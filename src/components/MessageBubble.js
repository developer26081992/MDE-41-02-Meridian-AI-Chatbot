import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SpeakButton from './SpeakButton';
import TalkToPersonButton from './TalkToPersonButton';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.user : styles.assistant]}>
      <Text style={styles.author}>{isUser ? 'You' : 'Meridian Assistant'}</Text>
      <Text style={styles.text}>{message.text}</Text>
      {!isUser && <SpeakButton text={message.text} />}
      {!!message.handoff && <TalkToPersonButton />}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { borderRadius: 12, padding: 12, marginBottom: 10, maxWidth: '94%' },
  user: { alignSelf: 'flex-end', backgroundColor: '#dceaff' },
  assistant: { alignSelf: 'flex-start', backgroundColor: '#edf1f6' },
  author: { fontSize: 15, color: '#294e77', fontWeight: '700', marginBottom: 4 },
  text: { fontSize: 17, lineHeight: 24, color: '#17263b' },
});
