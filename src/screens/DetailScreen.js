import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { artworkUrl, fetchPokemonDetail } from '../api';
import ErrorView from '../components/ErrorView';
import StatBar from '../components/StatBar';
import TypeBadge from '../components/TypeBadge';
import { useTeam } from '../TeamContext';
import { formatName, theme } from '../theme';

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params; // received through route params
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isInTeam, addToTeam, removeFromTeam, isFull } = useTeam();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemonDetail(id);
      setPokemon(data);
      navigation.setOptions({ title: formatName(data.name) });
    } catch (e) {
      setError('Could not load this Pokémon. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <ActivityIndicator size="large" color={theme.primary} style={styles.center} />;
  }
  if (error || !pokemon) {
    return <ErrorView message={error} onRetry={load} />;
  }

  const inTeam = isInTeam(pokemon.id);
  const disabled = !inTeam && isFull;

  const onToggle = () => {
    if (inTeam) {
      removeFromTeam(pokemon.id);
    } else {
      addToTeam({ id: pokemon.id, name: pokemon.name, stats: pokemon.stats });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: artworkUrl(pokemon.id) }} style={styles.image} resizeMode="contain" />
      <Text style={styles.number}>#{String(pokemon.id).padStart(4, '0')}</Text>
      <Text style={styles.name}>{formatName(pokemon.name)}</Text>

      <View style={styles.types}>
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </View>

      <View style={styles.facts}>
        <View style={styles.fact}>
          <Text style={styles.factValue}>{pokemon.height} m</Text>
          <Text style={styles.factLabel}>Height</Text>
        </View>
        <View style={styles.fact}>
          <Text style={styles.factValue}>{pokemon.weight} kg</Text>
          <Text style={styles.factLabel}>Weight</Text>
        </View>
      </View>

      <Text style={styles.heading}>Base stats</Text>
      {pokemon.stats.map((s) => (
        <StatBar key={s.name} name={s.name} value={s.value} />
      ))}

      <Pressable
        onPress={onToggle}
        disabled={disabled}
        style={[
          styles.button,
          inTeam && { backgroundColor: theme.dark },
          disabled && { backgroundColor: theme.disabled },
        ]}
      >
        <Text style={styles.buttonText}>
          {inTeam ? 'Remove from team' : disabled ? 'Team is full (6/6)' : 'Add to team'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, alignItems: 'stretch' },
  center: { marginTop: 60 },
  image: { width: '100%', height: 240 },
  number: { textAlign: 'center', color: theme.muted, fontSize: 16 },
  name: { textAlign: 'center', fontSize: 30, fontWeight: '800', color: theme.text },
  types: { flexDirection: 'row', justifyContent: 'center', marginVertical: 12 },
  facts: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  fact: { alignItems: 'center' },
  factValue: { fontSize: 20, fontWeight: '700', color: theme.text },
  factLabel: { color: theme.muted },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 6, color: theme.text },
  button: {
    backgroundColor: theme.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
