import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import { askAssistant } from '../api/chat';
import { useAuth } from '../auth/AuthContext';
import { appendMessage, createConversation, getConversation } from '../db/database';

export default function ChatScreen(props) {
  const { conversationId, selection } = props.route.params || {};
  return <Conversation key={selection || 'new'} initialId={conversationId} navigation={props.navigation} />;
}

function Conversation({ initialId, navigation }) {
  const { session } = useAuth();
  const id = useRef(initialId);
  const request = useRef(null);
  const list = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState(Boolean(initialId));
  const [error, setError] = useState('');

  useFocusEffect(React.useCallback(() => {
    let active = true;
    if (id.current && !request.current) {
      setReading(true);
      getConversation(session.user, id.current).then((saved) => {
        if (!active) return;
        id.current = saved?.id;
        setMessages(saved?.messages || []);
        if (!saved) setError('This conversation was deleted. Send a message to start again.');
      }).catch(() => {
        if (active) setError('Could not open this conversation. Reopen it from history.');
      }).finally(() => {
        if (active) setReading(false);
      });
    }
    return () => { active = false; };
  }, [session.user]));

  useEffect(() => () => request.current?.abort(), []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.header}>
          <HeaderButton label="New chat" disabled={loading} onPress={() => navigation.replace('Chat')} />
          <HeaderButton label="History" disabled={loading} onPress={() => navigation.navigate('History')} />
          <HeaderButton label="Settings" disabled={loading} onPress={() => navigation.navigate('Settings')} />
        </View>
      ),
    });
  }, [loading, navigation]);

  async function send(retry = false) {
    const text = input.trim();
    if (request.current || reading || (!retry && !text)) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError('');
    try {
      let turns = messages;
      if (!retry) {
        if (id.current) {
          turns = [...messages, await appendMessage(session.user, id.current, 'user', text)];
        } else {
          const saved = await createConversation(session.user, text);
          id.current = saved.id;
          turns = saved.messages;
        }
        setMessages(turns);
        setInput('');
      }
      let context = turns.slice(-24);
      if (context[0].role === 'assistant') context = context.slice(1);
      const { reply, handoff } = await askAssistant(context, controller);
      const answer = await appendMessage(session.user, id.current, 'assistant', reply, handoff);
      setMessages([...turns, answer]);
    } catch (failure) {
      setError(failure.message || 'The message could not be sent. Try again.');
    } finally {
      request.current = null;
      setLoading(false);
    }
  }

  const awaitingReply = messages[messages.length - 1]?.role === 'user';
  const disabled = loading || reading || !input.trim();

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        {reading ? <ActivityIndicator accessibilityLabel="Opening conversation" style={styles.empty} /> :
          <FlatList
            ref={list}
            data={messages}
            style={styles.container}
            contentContainerStyle={styles.transcript}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
            keyExtractor={(message) => String(message.id)}
            renderItem={({ item }) => <MessageBubble message={item} />}
            ListEmptyComponent={<Text style={styles.empty}>Ask about office hours, leave, remote work, expenses, passwords or IT support.</Text>}
          />}
        {loading && <TypingIndicator />}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {awaitingReply && !loading && !reading &&
          <TouchableOpacity accessibilityRole="button" style={styles.retry} onPress={() => send(true)}>
            <Text style={styles.link}>Retry last question</Text>
          </TouchableOpacity>}
        <View style={styles.inputBar}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} maxLength={2000}
            editable={!loading && !reading} multiline accessibilityLabel="Ask a question"
            placeholder="Ask a question" placeholderTextColor="#4b5a6e" />
          <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }}
            style={[styles.send, disabled && styles.disabled]} onPress={() => send()} disabled={disabled}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function HeaderButton({ label, disabled, onPress }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={styles.headerButton}><Text style={styles.link}>{label}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  transcript: { padding: 12 },
  empty: { padding: 16, color: '#35465c', fontSize: 16, lineHeight: 24 },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 5 },
  link: { color: '#194a85', fontSize: 16, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, borderTopWidth: 1, borderColor: '#d8e1ee' },
  input: { flex: 1, minHeight: 48, maxHeight: 112, borderWidth: 1, borderColor: '#66768a', borderRadius: 8, padding: 10, fontSize: 16, color: '#17263b' },
  send: { minHeight: 48, paddingHorizontal: 14, backgroundColor: '#194a85', justifyContent: 'center', marginLeft: 8, borderRadius: 8 },
  disabled: { backgroundColor: '#52647b' },
  sendText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  error: { color: '#9c2433', paddingHorizontal: 12, paddingVertical: 6, fontSize: 16 },
  retry: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 },
});
