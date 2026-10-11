// Regras compartilhadas entre servidor e app (níveis, pontos, raridades).

// Pontos de conexão necessários para cada nível (índice 0 = nível 1).
export const LEVELS = [0, 60, 150, 300, 500, 800, 1200, 1700, 2300, 3000];

export const LEVEL_NAMES = [
  'Reencontro',
  'Faísca',
  'Sintonia',
  'Cumplicidade',
  'Parceria',
  'Intimidade',
  'Porto seguro',
  'Alma gêmea',
  'Inseparáveis',
  'Lenda',
];

// Nível mínimo do casal para cada raridade aparecer nos pacotes.
export const RARITY_UNLOCK = { comum: 1, rara: 1, epica: 3, lendaria: 5 };

// Chance relativa de cada raridade em um pacote.
export const RARITY_WEIGHT = { comum: 60, rara: 28, epica: 10, lendaria: 3 };

export const PACK_SIZE = 3;
export const QUESTION_POINTS = 15;
export const DUPLICATE_POINTS = 2;

export function levelFor(points) {
  let level = 1;
  for (let i = 0; i < LEVELS.length; i++) if (points >= LEVELS[i]) level = i + 1;
  const floor = LEVELS[level - 1];
  const next = LEVELS[level] ?? null;
  return {
    level,
    name: LEVEL_NAMES[level - 1],
    floor,
    next,
    progress: next ? (points - floor) / (next - floor) : 1,
  };
}

// Dia corrente no fuso do Brasil, no formato AAAA-MM-DD.
export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function dayNumber(key) {
  return Math.floor(Date.parse(`${key}T00:00:00Z`) / 86400000);
}
