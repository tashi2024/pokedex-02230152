import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { artworkUrl } from '../api';
import { formatName, theme } from '../theme';

// One row: artwork, number, name (and an optional extra element on the right).
export default function PokemonCard({ id, name, onPress, right }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
    >
      <Image source={{ uri: artworkUrl(id) }} style={styles.image} resizeMode="contain" />
      <View style={styles.info}>
        <Text style={styles.number}>#{String(id).padStart(4, '0')}</Text>
        <Text style={styles.name}>{formatName(name)}</Text>
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 5,
  },
  image: { width: 64, height: 64, marginRight: 12, backgroundColor: theme.bg, borderRadius: 32 },
  info: { flex: 1 },
  number: { color: theme.muted, fontSize: 13 },
  name: { fontSize: 18, fontWeight: '600', color: theme.text },
});
