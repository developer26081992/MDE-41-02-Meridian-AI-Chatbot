import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';

export default function SignInScreen() {
  const { signIn, restoreError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSignIn() {
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Sign-in failed', error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.title}>Meridian Assistant</Text>
          <Text style={styles.note}>Demo sign-in uses a Meridian email and any non-empty password.</Text>
          {restoreError && <Text style={styles.note}>Your session could not be restored. Sign in again.</Text>}
          <TextInput style={styles.input} accessibilityLabel="Work email" placeholder="Work email"
            placeholderTextColor="#4b5a6e" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <TextInput style={styles.input} accessibilityLabel="Password" placeholder="Password"
            placeholderTextColor="#4b5a6e" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: busy, busy }}
            style={styles.button} onPress={onSignIn} disabled={busy}>
            <Text style={styles.buttonText}>{busy ? 'Signing in…' : 'Sign in'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#153459', marginBottom: 12 },
  note: { fontSize: 16, color: '#35465c', marginBottom: 16 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#66768a', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, color: '#17263b' },
  button: { backgroundColor: '#194a85', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
