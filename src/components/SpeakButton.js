import React, { useCallback, useState } from 'react';
import { Alert, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';

export default function SpeakButton({ text }) {
  const [speaking, setSpeaking] = useState(false);
  useFocusEffect(useCallback(() => () => {
    Speech.stop().catch(() => {});
  }, []));

  async function onPress() {
    const stop = () => setSpeaking(false);
    const failed = () => {
      stop();
      Alert.alert('Could not read this reply aloud', 'Check the device text-to-speech settings.');
    };
    try {
      await Speech.stop();
      if (speaking) return stop();
      setSpeaking(true);
      Speech.speak(text, { language: 'en', onDone: stop, onStopped: stop, onError: failed });
    } catch {
      failed();
    }
  }

  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={speaking ? 'Stop reading reply' : 'Read reply aloud'}
      onPress={onPress} style={{ minHeight: 48, justifyContent: 'center' }}>
      <Text style={{ color: '#194a85', fontSize: 16, fontWeight: '600' }}>{speaking ? 'Stop reading' : 'Read aloud'}</Text>
    </TouchableOpacity>
  );
}
