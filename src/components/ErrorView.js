import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export default function ErrorView({ message, onRetry }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message || 'Something went wrong.'}</Text>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 24, alignItems: 'center' },
  text: { color: theme.text, fontSize: 16, textAlign: 'center', marginBottom: 12 },
  button: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
