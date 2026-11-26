import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

export default function TypingIndicator() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}>
      <ActivityIndicator color="#194a85" />
      <Text accessibilityLiveRegion="polite" style={{ flexShrink: 1, fontSize: 16, color: '#35465c' }}>
        Looking up Meridian policy…
      </Text>
    </View>
  );
}
