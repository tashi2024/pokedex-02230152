// All PokeAPI calls live here.
const BASE = 'https://pokeapi.co/api/v2';

// Last three digits of student ID 02230152 -> list starts at offset 152
export const START_OFFSET = 152;
export const PAGE_SIZE = 20;
export const MAX_ID = 1025; // national dex size used by the lab

export const idFromUrl = (url) => Number(url.split('/').filter(Boolean).pop());

export const artworkUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const toListItem = (p) => ({ id: idFromUrl(p.url), name: p.name });

// One page of the paged list. Ignores alternate forms (ids above MAX_ID).
export async function fetchPokemonPage(offset, limit = PAGE_SIZE) {
  const data = await getJson(`${BASE}/pokemon?offset=${offset}&limit=${limit}`);
  const all = data.results.map(toListItem);
  const items = all.filter((p) => p.id <= MAX_ID);
  const reachedEnd = items.length < all.length || data.next === null;
  return { items, hasMore: !reachedEnd };
}

// All names, fetched once and cached, used for search and the game.
let namesCache = null;
export async function fetchAllNames() {
  if (namesCache) return namesCache;
  const data = await getJson(`${BASE}/pokemon?limit=${MAX_ID}`);
  namesCache = data.results.map(toListItem).filter((p) => p.id <= MAX_ID);
  return namesCache;
}

// Set of ids of one type (for the type filter feature).
const typeCache = {};
export async function fetchTypeIds(type) {
  if (typeCache[type]) return typeCache[type];
  const data = await getJson(`${BASE}/type/${type}`);
  const ids = new Set(
    data.pokemon.map((entry) => idFromUrl(entry.pokemon.url)).filter((id) => id <= MAX_ID)
  );
  typeCache[type] = ids;
  return ids;
}

export async function fetchPokemonDetail(idOrName) {
  const d = await getJson(`${BASE}/pokemon/${idOrName}`);
  return {
    id: d.id,
    name: d.name,
    types: d.types.map((t) => t.type.name),
    height: d.height / 10, // decimetres -> metres
    weight: d.weight / 10, // hectograms -> kg
    stats: d.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  };
}
