import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TYPE_COLORS, formatName } from '../theme';

export default function TypeBadge({ type }) {
  return (
    <View style={[styles.badge, { backgroundColor: TYPE_COLORS[type] || '#999' }]}>
      <Text style={styles.text}>{formatName(type)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  text: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
