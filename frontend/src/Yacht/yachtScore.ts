export type CategoryKey =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'choice'
  | 'fourOfAKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'yacht';

export interface ScoreSheet {
  ones?: number | null;
  twos?: number | null;
  threes?: number | null;
  fours?: number | null;
  fives?: number | null;
  sixes?: number | null;
  choice?: number | null;
  fourOfAKind?: number | null;
  fullHouse?: number | null;
  smallStraight?: number | null;
  largeStraight?: number | null;
  yacht?: number | null;
}

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  ones: 'Aces (1)',
  twos: 'Deuces (2)',
  threes: 'Threes (3)',
  fours: 'Fours (4)',
  fives: 'Fives (5)',
  sixes: 'Sixes (6)',
  choice: 'Choice',
  fourOfAKind: '4 of a Kind',
  fullHouse: 'Full House',
  smallStraight: 'Small Straight',
  largeStraight: 'Large Straight',
  yacht: 'Yacht',
};

export function calculateScore(category: CategoryKey, dice: number[]): number {
  if (!dice || dice.length !== 5) return 0;
  const counts = [0, 0, 0, 0, 0, 0, 0];
  let sum = 0;
  for (const d of dice) {
    if (d >= 1 && d <= 6) {
      counts[d]++;
      sum += d;
    }
  }

  switch (category) {
    case 'ones':
      return counts[1] * 1;
    case 'twos':
      return counts[2] * 2;
    case 'threes':
      return counts[3] * 3;
    case 'fours':
      return counts[4] * 4;
    case 'fives':
      return counts[5] * 5;
    case 'sixes':
      return counts[6] * 6;
    case 'choice':
      return sum;
    case 'fourOfAKind': {
      const has4 = counts.some((c) => c >= 4);
      return has4 ? sum : 0;
    }
    case 'fullHouse': {
      const has3 = counts.some((c) => c === 3);
      const has2 = counts.some((c) => c === 2);
      const has5 = counts.some((c) => c === 5);
      if ((has3 && has2) || has5) {
        return sum;
      }
      return 0;
    }
    case 'smallStraight': {
      const has = (vals: number[]) => vals.every((v) => counts[v] >= 1);
      if (has([1, 2, 3, 4]) || has([2, 3, 4, 5]) || has([3, 4, 5, 6])) {
        return 15;
      }
      return 0;
    }
    case 'largeStraight': {
      const has = (vals: number[]) => vals.every((v) => counts[v] >= 1);
      if (has([1, 2, 3, 4, 5]) || has([2, 3, 4, 5, 6])) {
        return 30;
      }
      return 0;
    }
    case 'yacht': {
      const has5 = counts.some((c) => c === 5);
      return has5 ? 50 : 0;
    }
    default:
      return 0;
  }
}

export function calculateTotalScore(scores: ScoreSheet): {
  subtotal: number;
  bonus: number;
  total: number;
} {
  const ones = scores.ones ?? 0;
  const twos = scores.twos ?? 0;
  const threes = scores.threes ?? 0;
  const fours = scores.fours ?? 0;
  const fives = scores.fives ?? 0;
  const sixes = scores.sixes ?? 0;

  const subtotal = ones + twos + threes + fours + fives + sixes;
  const bonus = subtotal >= 63 ? 35 : 0;

  let total = subtotal + bonus;

  const lowerCategories: CategoryKey[] = [
    'choice',
    'fourOfAKind',
    'fullHouse',
    'smallStraight',
    'largeStraight',
    'yacht',
  ];

  for (const cat of lowerCategories) {
    if (scores[cat] !== undefined && scores[cat] !== null) {
      total += scores[cat]!;
    }
  }

  return { subtotal, bonus, total };
}
