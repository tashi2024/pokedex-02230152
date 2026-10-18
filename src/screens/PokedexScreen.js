import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  PAGE_SIZE,
  START_OFFSET,
  fetchAllNames,
  fetchPokemonPage,
  fetchTypeIds,
} from '../api';
import ErrorView from '../components/ErrorView';
import PokemonCard from '../components/PokemonCard';
import { useDebounce } from '../hooks';
import { TYPE_COLORS, TYPE_NAMES, formatName, theme } from '../theme';

export default function PokedexScreen({ navigation }) {
  // ---------- paged list (infinite scroll) ----------
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(START_OFFSET);
  const busyRef = useRef(false);
  const hasMoreRef = useRef(true);
  const seenRef = useRef(new Set()); // ids already shown -> no duplicates

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMoreRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchPokemonPage(offsetRef.current);
      offsetRef.current += PAGE_SIZE;
      const fresh = page.items.filter((p) => !seenRef.current.has(p.id));
      fresh.forEach((p) => seenRef.current.add(p.id));
      setItems((cur) => [...cur, ...fresh]);
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);
    } catch (e) {
      setError('Could not load Pokémon. Check your internet connection.');
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  // ---------- search (debounced) + type filter ----------
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [typeFilter, setTypeFilter] = useState(null);
  const [names, setNames] = useState(null);
  const [typeIds, setTypeIds] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  const q = debouncedQuery.trim().toLowerCase();
  const filtering = q.length > 0 || typeFilter !== null;

  useEffect(() => {
    if (!filtering) return undefined;
    let cancelled = false;
    setFilterLoading(true);
    setFilterError(null);
    (async () => {
      try {
        const all = await fetchAllNames();
        const ids = typeFilter ? await fetchTypeIds(typeFilter) : null;
        if (!cancelled) {
          setNames(all);
          setTypeIds(ids);
        }
      } catch (e) {
        if (!cancelled) setFilterError('Could not search. Check your internet connection.');
      } finally {
        if (!cancelled) setFilterLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filtering, typeFilter, retryTick]);

  const results = useMemo(() => {
    if (!filtering || !names) return [];
    if (typeFilter && !typeIds) return [];
    return names.filter((p) => {
      if (typeIds && !typeIds.has(p.id)) return false;
      if (!q) return true;
      return p.name.includes(q) || String(p.id) === q;
    });
  }, [filtering, names, typeIds, typeFilter, q]);

  // ---------- rendering ----------
  const openDetail = (id) => navigation.navigate('Detail', { id });

  const renderItem = ({ item }) => (
    <PokemonCard id={item.id} name={item.name} onPress={() => openDetail(item.id)} />
  );

  let body;
  if (filtering) {
    if (filterLoading) {
      body = <ActivityIndicator size="large" color={theme.primary} style={styles.center} />;
    } else if (filterError) {
      body = <ErrorView message={filterError} onRetry={() => setRetryTick((t) => t + 1)} />;
    } else {
      body = (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.empty}>No Pokémon found.</Text>}
          initialNumToRender={12}
        />
      );
    }
  } else if (error && items.length === 0) {
    body = <ErrorView message={error} onRetry={loadMore} />;
  } else if (loading && items.length === 0) {
    body = <ActivityIndicator size="large" color={theme.primary} style={styles.center} />;
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          error ? (
            <ErrorView message={error} onRetry={loadMore} />
          ) : loading && hasMore ? (
            <ActivityIndicator color={theme.primary} style={styles.footer} />
          ) : null
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search all Pokémon by name"
        placeholderTextColor={theme.muted}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={styles.search}
      />

      {/* my own feature: filter by type */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" active={typeFilter === null} color={theme.primary} onPress={() => setTypeFilter(null)} />
          {TYPE_NAMES.map((t) => (
            <Chip
              key={t}
              label={formatName(t)}
              active={typeFilter === t}
              color={TYPE_COLORS[t]}
              onPress={() => setTypeFilter(typeFilter === t ? null : t)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.body}>{body}</View>
    </View>
  );
}

function Chip({ label, active, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { borderColor: color }, active && { backgroundColor: color }]}
    >
      <Text style={[styles.chipText, { color: active ? '#fff' : color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  search: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.text,
  },
  chips: { paddingHorizontal: 12, paddingVertical: 10 },
  chip: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  chipText: { fontWeight: '700', fontSize: 13 },
  body: { flex: 1 },
  center: { marginTop: 40 },
  footer: { marginVertical: 16 },
  empty: { textAlign: 'center', color: theme.muted, fontSize: 16, marginTop: 40 },
});
