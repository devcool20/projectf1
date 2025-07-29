import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export function AuthStatus() {
  const { session, loading, refreshSession } = useAuth();

  const handleRefresh = async () => {
    try {
      await refreshSession();
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>🔄 Loading auth...</Text>
      </View>
    );
  }

  if (session) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>✅ Logged in as: {session.user.email}</Text>
        <Text style={styles.subText}>User ID: {session.user.id}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>❌ Not logged in</Text>
      <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    margin: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  subText: {
    color: '#666666',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'center',
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 