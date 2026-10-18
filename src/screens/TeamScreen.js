import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import PokemonCard from '../components/PokemonCard';
import StatBar from '../components/StatBar';
import { MAX_TEAM, useTeam } from '../TeamContext';
import { theme } from '../theme';

export default function TeamScreen({ navigation }) {
  const { team, removeFromTeam } = useTeam();

  // combined base stats of every member
  const combined = useMemo(() => {
    const sums = {};
    team.forEach((p) => p.stats.forEach((s) => (sums[s.name] = (sums[s.name] || 0) + s.value)));
    const list = Object.keys(sums).map((name) => ({ name, value: sums[name] }));
    const total = list.reduce((acc, s) => acc + s.value, 0);
    return { list, total };
  }, [team]);

  const header = (
    <View style={styles.summary}>
      <Text style={styles.count}>
        Team: {team.length}/{MAX_TEAM}
      </Text>
      {team.length > 0 && (
        <>
          <Text style={styles.total}>Combined base stats: {combined.total}</Text>
          {combined.list.map((s) => (
            <StatBar key={s.name} name={s.name} value={s.value} max={255 * Math.max(team.length, 1)} />
          ))}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={team}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Your team is empty. Open a Pokémon and tap "Add to team".
          </Text>
        }
        renderItem={({ item }) => (
          <PokemonCard
            id={item.id}
            name={item.name}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
            right={
              <Pressable style={styles.remove} onPress={() => removeFromTeam(item.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  summary: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  count: { fontSize: 22, fontWeight: '800', color: theme.text },
  total: { fontSize: 15, color: theme.muted, marginBottom: 8 },
  empty: { textAlign: 'center', color: theme.muted, fontSize: 16, marginTop: 30, padding: 20 },
  remove: {
    backgroundColor: theme.red,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeText: { color: '#fff', fontWeight: '700' },
});
