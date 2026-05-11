import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../api';

export default function DashboardScreen({ navigation }) {
  const [friends, setFriends] = useState([]);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await apiFetch('/state');
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.friends) setFriends(data.friends);
    } catch (err) {
      console.log("Error loading data:", err);
      Alert.alert("Error", "Could not load data from the server.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  const renderFriend = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.friendName}>{item.name}</Text>
      <Text style={styles.friendDetails}>SplitSmart Participant</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Participants ({friends.length})</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No participants yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold' },
  logoutText: { color: 'red', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  friendName: { fontSize: 18, fontWeight: '500' },
  friendDetails: { color: '#666', marginTop: 5, fontSize: 14 }
});
