import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STAT_LABELS, theme } from '../theme';

// A labelled horizontal bar. `max` is the value that fills the bar.
export default function StatBar({ name, value, max = 255 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{STAT_LABELS[name] || name}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  label: { width: 70, color: theme.muted, fontSize: 14 },
  value: { width: 40, fontWeight: '600', color: theme.text },
  track: { flex: 1, height: 10, backgroundColor: '#EEE', borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.primary, borderRadius: 5 },
});
