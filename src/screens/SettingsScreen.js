import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { clearAll } from '../db/database';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  async function run(action, failure, success) {
    setBusy(true);
    try {
      await action();
      if (success) Alert.alert(success);
    } catch {
      Alert.alert(failure, 'Try again.');
    } finally {
      setBusy(false);
    }
  }

  function confirmClear() {
    Alert.alert('Clear conversation history?', 'All saved conversations for this account will be deleted from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear history', style: 'destructive', onPress: () =>
        run(() => clearAll(session.user), 'Could not clear history', 'History cleared') },
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity accessibilityRole="button" disabled={busy} style={styles.row} onPress={confirmClear}>
        <Text style={styles.label}>Clear conversation history</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={busy} style={styles.row}
        onPress={() => run(signOut, 'Could not sign out')}>
        <Text style={styles.label}>Sign out</Text>
      </TouchableOpacity>
      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  row: { minHeight: 48, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#d8e1ee' },
  label: { fontSize: 16, color: '#153459' },
  version: { marginTop: 24, fontSize: 16, color: '#44536a' },
});
