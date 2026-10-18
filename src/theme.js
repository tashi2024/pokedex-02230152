// Theme colour and shared constants.
export const theme = {
  primary: '#D6453D', // my theme colour: Pokédex red
  dark: '#8E1F1A',
  bg: '#FFF6F4',
  card: '#FFFFFF',
  text: '#222222',
  muted: '#777777',
  border: '#EADAD7',
  green: '#2E9E5B',
  red: '#D64545',
  disabled: '#BBBBBB',
};

export const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export const TYPE_NAMES = Object.keys(TYPE_COLORS);

export const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export function formatName(name) {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
