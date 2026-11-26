import React from 'react';
import { Alert, TouchableOpacity, Text } from 'react-native';

function showContacts() {
  Alert.alert('Talk to a person', 'Choose the department that can help.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'HR', onPress: () => Alert.alert('Human Resources', 'Open your staff directory and contact Human Resources for policy or HR help.') },
    { text: 'IT', onPress: () => Alert.alert('IT help desk', 'Use the staff directory to contact the IT help desk. It is available 08:00 to 18:00 on working days.') },
  ]);
}

export default function TalkToPersonButton() {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={showContacts} style={{ minHeight: 48, justifyContent: 'center' }}>
      <Text style={{ color: '#194a85', fontSize: 16, fontWeight: '600' }}>Talk to a person</Text>
    </TouchableOpacity>
  );
}
