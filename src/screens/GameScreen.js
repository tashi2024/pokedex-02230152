import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { artworkUrl, fetchAllNames } from '../api';
import ErrorView from '../components/ErrorView';
import { formatName, theme } from '../theme';

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// pick a random Pokémon from the pool plus three different wrong answers
function makeRound(pool) {
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const wrong = shuffle(pool.filter((p) => p.id !== correct.id)).slice(0, 3);
  return { correct, options: shuffle([correct, ...wrong]) };
}

export default function GameScreen() {
  const [pool, setPool] = useState([]); // the first 151 Pokémon
  const [round, setRound] = useState(null);
  const [picked, setPicked] = useState(null); // option chosen this round
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await fetchAllNames();
      const first151 = all.filter((p) => p.id <= 151);
      setPool(first151);
      setRound(makeRound(first151));
      setPicked(null);
    } catch (e) {
      setError('Could not start the game. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const answer = (option) => {
    if (picked !== null) return; // already answered
    setPicked(option);
    if (option.id === round.correct.id) {
      const next = streak + 1;
      setScore((s) => s + 1);
      setStreak(next);
      setBest((b) => Math.max(b, next));
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    setRound(makeRound(pool));
    setPicked(null);
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.primary} style={styles.center} />;
  }
  if (error || !round) {
    return <ErrorView message={error} onRetry={load} />;
  }

  const revealed = picked !== null;

  const buttonStyle = (option) => {
    if (!revealed) return styles.option;
    if (option.id === round.correct.id) return [styles.option, { backgroundColor: theme.green }];
    if (option.id === picked.id) return [styles.option, { backgroundColor: theme.red }];
    return [styles.option, { opacity: 0.5 }];
  };

  return (
    <View style={styles.container}>
      <View style={styles.scoreRow}>
        <Score label="Score" value={score} />
        <Score label="Streak" value={streak} />
        <Score label="Best streak" value={best} />
      </View>

      <Text style={styles.title}>Who's that Pokémon?</Text>

      <Image
        source={{ uri: artworkUrl(round.correct.id) }}
        style={[styles.image, !revealed && { tintColor: '#000' }]} // black silhouette until answered
        resizeMode="contain"
      />

      {revealed && (
        <Text style={styles.result}>
          {picked.id === round.correct.id
            ? 'Correct!'
            : `It was ${formatName(round.correct.name)}`}
        </Text>
      )}

      <View style={styles.options}>
        {round.options.map((option) => (
          <Pressable
            key={option.id}
            style={buttonStyle(option)}
            onPress={() => answer(option)}
            disabled={revealed}
          >
            <Text style={styles.optionText}>{formatName(option.name)}</Text>
          </Pressable>
        ))}
      </View>

      {revealed && (
        <Pressable style={styles.next} onPress={next}>
          <Text style={styles.nextText}>Next</Text>
        </Pressable>
      )}
    </View>
  );
}

function Score({ label, value }) {
  return (
    <View style={styles.score}>
      <Text style={styles.scoreValue}>{value}</Text>
      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 16 },
  center: { marginTop: 60 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  score: { alignItems: 'center' },
  scoreValue: { fontSize: 24, fontWeight: '800', color: theme.primary },
  scoreLabel: { color: theme.muted, fontSize: 13 },
  title: { textAlign: 'center', fontSize: 22, fontWeight: '800', color: theme.text, marginVertical: 6 },
  image: { width: '100%', height: 220 },
  result: { textAlign: 'center', fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 6 },
  options: { marginTop: 8 },
  option: {
    backgroundColor: theme.primary,
    padding: 14,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  optionText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  next: {
    backgroundColor: theme.dark,
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
