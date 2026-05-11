import AsyncStorage from '@react-native-async-storage/async-storage';

// UPDATE THIS to your computer's local Wi-Fi IP Address!
// Find it in System Settings -> Wi-Fi -> Details on Mac.
export const BASE_URL = 'http://192.168.1.100:5000/api'; 

export const apiFetch = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};
