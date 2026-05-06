const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add CSS
const cssToAdd = `
/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}
.modal-content {
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 2.5rem;
    width: 90%;
    max-width: 400px;
    box-shadow: var(--shadow-md);
}
.modal-content h2 { margin-bottom: 1.5rem; justify-content: center; }
.auth-switch {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;
    color: var(--primary);
    cursor: pointer;
    text-decoration: underline;
}
`;
content = content.replace('</style>', cssToAdd + '\n</style>');

// 2. Add Modals
const modalsHTML = `
    <div id="auth-modal" class="modal-overlay">
        <div class="modal-content" style="background: rgba(255, 255, 255, 0.9);">
            <h2 id="auth-title">Login</h2>
            <form id="auth-form" class="input-group" style="flex-direction: column;">
                <input type="text" id="auth-username" placeholder="Username" required>
                <input type="password" id="auth-password" placeholder="Password" required>
                <button type="submit" class="btn-primary" id="auth-btn">Login</button>
            </form>
            <p class="auth-switch" onclick="toggleAuthMode()">Need an account? Register</p>
        </div>
    </div>

    <div id="history-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="background: rgba(255, 255, 255, 0.95); max-width: 600px; width: 90%;">
            <div class="panel-header" style="margin-bottom: 1rem; padding-bottom: 0.5rem;">
                <h2>Settlement History</h2>
                <button class="btn-secondary" onclick="closeHistory()" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">Close</button>
            </div>
            <div class="list-container" id="history-list" style="max-height: 400px;">
                <p style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No history found.</p>
            </div>
        </div>
    </div>
`;
content = content.replace('<div id="bg-3d"></div>', '<div id="bg-3d"></div>\n' + modalsHTML);

// 3. Update Header
const newHeader = `
    <header>
        <h1>SplitSmart</h1>
        <p class="subtitle">Simplified Expense Management & Diagnostics</p>
        <div id="user-controls" style="display: none; gap: 1rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
            <button class="btn-secondary" onclick="showHistory()" style="padding: 0.5rem 1.5rem;">View History</button>
            <button class="btn-primary" onclick="resetAll()" style="padding: 0.5rem 1.5rem;">Reset Data</button>
            <button class="btn-danger" onclick="logout()" style="padding: 0.5rem 1.5rem;">Logout</button>
        </div>
    </header>
`;
content = content.replace(/<header>[\s\S]*?<\/header>/, newHeader);

// 4. Update JS logic (apiFetch wrapper, auth logic)
const jsAuthLogic = `
        let token = localStorage.getItem('token');
        let isRegistering = false;
        
        async function apiFetch(url, options = {}) {
            const headers = { 'Content-Type': 'application/json', ...options.headers };
            if (token) headers['Authorization'] = \`Bearer \${token}\`;
            const res = await fetch(url, { ...options, headers });
            if (res.status === 401) {
                logout();
                throw new Error("Unauthorized");
            }
            return res;
        }

        document.getElementById('auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('auth-username').value;
            const password = document.getElementById('auth-password').value;
            const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
            
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error);
                
                token = data.token;
                localStorage.setItem('token', token);
                document.getElementById('auth-modal').style.display = 'none';
                document.getElementById('user-controls').style.display = 'flex';
                loadState();
            } catch (err) {
                alert(err.message);
            }
        });

        function toggleAuthMode() {
            isRegistering = !isRegistering;
            document.getElementById('auth-title').innerText = isRegistering ? 'Register' : 'Login';
            document.getElementById('auth-btn').innerText = isRegistering ? 'Register' : 'Login';
            document.querySelector('.auth-switch').innerText = isRegistering ? 'Already have an account? Login' : 'Need an account? Register';
        }

        function logout() {
            token = null;
            localStorage.removeItem('token');
            document.getElementById('auth-modal').style.display = 'flex';
            document.getElementById('user-controls').style.display = 'none';
            // Clear current data
            friends = []; expenses = []; balances = {};
            renderFriends(); renderExpenses(); calculateSettlements();
        }

        async function showHistory() {
            document.getElementById('history-modal').style.display = 'flex';
            const historyList = document.getElementById('history-list');
            historyList.innerHTML = '<p style="text-align: center;">Loading...</p>';
            try {
                const res = await apiFetch('/api/settlements');
                const data = await res.json();
                if (data.length === 0) {
                    historyList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No history found.</p>';
                    return;
                }
                historyList.innerHTML = '';
                data.forEach(item => {
                    const fromName = friends.find(f => f.id === item.from)?.name || 'Unknown';
                    const toName = friends.find(f => f.id === item.to)?.name || 'Unknown';
                    const el = document.createElement('div');
                    el.className = 'settlement-item';
                    el.style.marginBottom = '0.5rem';
                    el.innerHTML = \`
                        <div class="settlement-text"><strong>\${fromName}</strong> paid <strong>\${toName}</strong></div>
                        <div class="settlement-amount">₹\${item.amount.toFixed(2)}</div>
                    \`;
                    historyList.appendChild(el);
                });
            } catch (err) {
                historyList.innerHTML = '<p style="text-align: center; color: var(--danger);">Failed to load history.</p>';
            }
        }

        function closeHistory() {
            document.getElementById('history-modal').style.display = 'none';
        }
`;
content = content.replace('// State', jsAuthLogic + '\n        // State');

// Replace fetch with apiFetch
content = content.replace(/fetch\('\/api\/friends'/g, "apiFetch('/api/friends'");
content = content.replace(/fetch\('\/api\/expenses'/g, "apiFetch('/api/expenses'");
content = content.replace(/fetch\('\/api\/reset'/g, "apiFetch('/api/reset'");
content = content.replace(/fetch\('\/api\/state'/g, "apiFetch('/api/state'");

// Update initial load logic
const oldInit = `        init3D();
        loadState();`;
const newInit = `        init3D();
        if (token) {
            document.getElementById('auth-modal').style.display = 'none';
            document.getElementById('user-controls').style.display = 'flex';
            loadState();
        } else {
            document.getElementById('auth-modal').style.display = 'flex';
            document.getElementById('user-controls').style.display = 'none';
        }`;
content = content.replace(oldInit, newInit);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Frontend updated.');
