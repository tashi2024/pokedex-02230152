import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'pokedex-team-v1';
export const MAX_TEAM = 6;

const TeamContext = createContext(null);

// A team member is { id, name, stats: [{ name, value }] }
export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // load saved team once when the app starts
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setTeam(parsed.slice(0, MAX_TEAM));
        }
      } catch (e) {
        // ignore: start with an empty team
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // save every change (but not before the first load finished)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(team)).catch(() => {});
  }, [team, loaded]);

  const isInTeam = useCallback((id) => team.some((p) => p.id === id), [team]);

  const addToTeam = useCallback((member) => {
    setTeam((cur) =>
      cur.length >= MAX_TEAM || cur.some((p) => p.id === member.id) ? cur : [...cur, member]
    );
  }, []);

  const removeFromTeam = useCallback((id) => {
    setTeam((cur) => cur.filter((p) => p.id !== id));
  }, []);

  const value = useMemo(
    () => ({ team, isInTeam, addToTeam, removeFromTeam, isFull: team.length >= MAX_TEAM }),
    [team, isInTeam, addToTeam, removeFromTeam]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used inside TeamProvider');
  return ctx;
}
