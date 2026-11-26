import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { listConversations, deleteConversation } from '../db/database';

export default function HistoryScreen({ navigation }) {
  const { session } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    setError('');
    listConversations(session.user).then((rows) => {
      if (active) setItems(rows);
    }).catch(() => {
      if (active) setError('History could not be opened. Go back and try again.');
    });
    return () => { active = false; };
  }, [session.user]));

  function onDelete(item) {
    Alert.alert('Delete conversation?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteConversation(session.user, item.id);
            setItems((rows) => rows.filter((row) => row.id !== item.id));
          } catch {
            Alert.alert('Could not delete', 'Try again.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {error ? <Text accessibilityRole="alert" style={styles.empty}>{error}</Text> : items === null ?
        <ActivityIndicator accessibilityLabel="Loading history" /> :
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.empty}>No conversations yet</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <TouchableOpacity style={styles.open} accessibilityRole="button"
                accessibilityLabel={'Open conversation: ' + item.title}
                onPress={() => navigation.navigate('Chat', { conversationId: item.id, selection: Date.now() })}>
                <Text style={styles.title}>{item.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} accessibilityRole="button"
                accessibilityLabel={'Delete conversation: ' + item.title} onPress={() => onDelete(item)}>
                <Text style={styles.remove}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 12 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', borderBottomWidth: 1, borderColor: '#d8e1ee' },
  open: { flex: 1, minHeight: 48, justifyContent: 'center', paddingVertical: 12 },
  action: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  title: { fontSize: 16, color: '#153459', fontWeight: '600' },
  remove: { fontSize: 16, color: '#9c2433' },
  empty: { padding: 20, textAlign: 'center', fontSize: 16, color: '#35465c' },
});
