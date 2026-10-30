import { CategoryKey, ScoreSheet, calculateScore } from './yacht.score';

export type AiDifficulty = 'NOVICE' | 'INTERMEDIATE' | 'MASTER';

export const ALL_CATEGORIES: CategoryKey[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
  'choice',
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yacht',
];

// 초급 AI가 모두 0점일 때 희생하는 "나오기 힘든 순서"
const NOVICE_SACRIFICE_ORDER: CategoryKey[] = [
  'yacht',
  'largeStraight',
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'sixes',
  'fives',
  'fours',
  'threes',
  'twos',
  'ones',
];

export class YachtAiEngine {
  /**
   * 🎲 [1] 주사위 KEEP 판단
   */
  static decideKeep(
    difficulty: AiDifficulty,
    dice: number[],
    rollsLeft: number,
    scores: ScoreSheet,
  ): boolean[] {
    if (rollsLeft <= 0) {
      return [true, true, true, true, true];
    }

    switch (difficulty) {
      case 'NOVICE':
        return this.decideKeepNovice(dice);
      case 'INTERMEDIATE':
        return this.decideKeepIntermediate(dice, scores);
      case 'MASTER':
        return this.decideKeepMaster(dice, scores, rollsLeft);
      default:
        return this.decideKeepNovice(dice);
    }
  }

  /**
   * 🟢 초급: 무조건 Yacht를 노림 (가장 빈도수가 높은 눈금만 KEEP)
   */
  private static decideKeepNovice(dice: number[]): boolean[] {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    dice.forEach((d) => counts[d]++);

    let targetVal = 1;
    let maxCount = -1;

    // 빈도수 1위 눈금 탐색 (동률 시 더 큰 숫자 우선)
    for (let val = 6; val >= 1; val--) {
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        targetVal = val;
      }
    }

    // 타겟 눈금과 일치하는 주사위만 KEEP
    return dice.map((d) => d === targetVal);
  }

  /**
   * 🟡 중급: 실리적인 패턴 매칭 (스트레이트, 풀하우스, 상단 456 보너스 고려)
   */
  private static decideKeepIntermediate(dice: number[], scores: ScoreSheet): boolean[] {
    const unique = Array.from(new Set(dice)).sort((a, b) => a - b);
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    dice.forEach((d) => counts[d]++);

    // 1. Large Straight 노림 (4개 연속 숫자가 있고 라지 스트레이트 비었을 때)
    if (scores.largeStraight === undefined || scores.largeStraight === null) {
      const uStr = unique.join('');
      if (
        uStr.includes('1234') ||
        uStr.includes('2345') ||
        uStr.includes('3456')
      ) {
        // 연속된 4개 숫자만 KEEP
        const targetSeq = uStr.includes('1234')
          ? [1, 2, 3, 4]
          : uStr.includes('2345')
          ? [2, 3, 4, 5]
          : [3, 4, 5, 6];
        const kept = [false, false, false, false, false];
        targetSeq.forEach((val) => {
          const idx = dice.findIndex((d, i) => d === val && !kept[i]);
          if (idx !== -1) kept[idx] = true;
        });
        return kept;
      }
    }

    // 2. Full House 노림 (3개 동일 + 다른 1개 동일 또는 2페어)
    if (scores.fullHouse === undefined || scores.fullHouse === null) {
      const pairs = [1, 2, 3, 4, 5, 6].filter((v) => counts[v] >= 2);
      if (pairs.length >= 2) {
        // 2페어 모두 KEEP
        return dice.map((d) => pairs.includes(d));
      }
      const triples = [1, 2, 3, 4, 5, 6].filter((v) => counts[v] === 3);
      if (triples.length === 1) {
        return dice.map((d) => d === triples[0]);
      }
    }

    // 3. 상단 4, 5, 6번 슬롯 의식
    for (const val of [6, 5, 4]) {
      const catKey = val === 6 ? 'sixes' : val === 5 ? 'fives' : 'fours';
      if ((scores[catKey] === undefined || scores[catKey] === null) && counts[val] >= 2) {
        return dice.map((d) => d === val);
      }
    }

    // 기본: 가장 빈도수 높은 눈금 KEEP
    return this.decideKeepNovice(dice);
  }

  /**
   * 🔴 고급: 32가지 부분집합 완전 기대값(EV) 탐색
   */
  private static decideKeepMaster(
    dice: number[],
    scores: ScoreSheet,
    rollsLeft: number,
  ): boolean[] {
    let bestHeld = [true, true, true, true, true];
    let bestEV = -1;

    // 2^5 = 32가지 마스크 순회
    for (let mask = 0; mask < 32; mask++) {
      const held = [
        (mask & 1) !== 0,
        (mask & 2) !== 0,
        (mask & 4) !== 0,
        (mask & 8) !== 0,
        (mask & 16) !== 0,
      ];

      const freeIndices = [0, 1, 2, 3, 4].filter((i) => !held[i]);
      const k = freeIndices.length;

      // 간이 몬테카를로 / 균등 샘플링 기대값 산출
      let totalScore = 0;
      const samples = k === 0 ? 1 : k <= 2 ? Math.pow(6, k) : 36;

      for (let s = 0; s < samples; s++) {
        const testDice = [...dice];
        let tempS = s;
        for (const idx of freeIndices) {
          testDice[idx] = (tempS % 6) + 1;
          tempS = Math.floor(tempS / 6);
        }

        // 남은 빈 슬롯 중 얻을 수 있는 최고 유효 가치
        let maxVal = 0;
        ALL_CATEGORIES.forEach((cat) => {
          if (scores[cat] === undefined || scores[cat] === null) {
            const sc = calculateScore(cat, testDice);
            if (sc > maxVal) maxVal = sc;
          }
        });
        totalScore += maxVal;
      }

      const ev = totalScore / samples;
      if (ev > bestEV) {
        bestEV = ev;
        bestHeld = held;
      }
    }

    return bestHeld;
  }

  /**
   * 📊 [2] 점수 슬롯 최종 선택
   */
  static decideScoreCategory(
    difficulty: AiDifficulty,
    dice: number[],
    scores: ScoreSheet,
    round: number,
  ): CategoryKey {
    const emptyCategories = ALL_CATEGORIES.filter(
      (cat) => scores[cat] === undefined || scores[cat] === null,
    );
    if (emptyCategories.length === 0) return 'ones';

    switch (difficulty) {
      case 'NOVICE':
        return this.decideScoreCategoryNovice(dice, scores, emptyCategories);
      case 'INTERMEDIATE':
        return this.decideScoreCategoryIntermediate(dice, scores, emptyCategories);
      case 'MASTER':
        return this.decideScoreCategoryMaster(dice, scores, round, emptyCategories);
      default:
        return this.decideScoreCategoryNovice(dice, scores, emptyCategories);
    }
  }

  /**
   * 🟢 초급 슬롯 선택 (사용자 지정 정확한 룰):
   * 1) 1점 이상 점수를 얻을 수 있는 슬롯 중 최고 점수 슬롯 선택 (Choice 제외)
   * 2) 남은 게 모두 0점이면 ➔ Choice 소비!
   * 3) Choice도 이미 썼고 모두 0점이면 ➔ 나오기 힘든 순서대로 희생!
   */
  private static decideScoreCategoryNovice(
    dice: number[],
    scores: ScoreSheet,
    emptyCategories: CategoryKey[],
  ): CategoryKey {
    // 1) 1점 이상 나오는 슬롯들 중 최고 점수 슬롯 탐색 (Choice는 일단 제외)
    let bestPositiveCategory: CategoryKey | null = null;
    let maxPositiveScore = 0;

    for (const cat of emptyCategories) {
      if (cat === 'choice') continue; // Choice는 후순위
      const score = calculateScore(cat, dice);
      if (score > maxPositiveScore) {
        maxPositiveScore = score;
        bestPositiveCategory = cat;
      }
    }

    if (bestPositiveCategory && maxPositiveScore > 0) {
      return bestPositiveCategory;
    }

    // 2) 남은 슬롯이 모두 0점이거나 Choice만 남은 경우: Choice가 비어있다면 Choice 소비!
    if (emptyCategories.includes('choice')) {
      return 'choice';
    }

    // 3) Choice도 이미 사용했고 남은 게 전부 0점뿐인 경우: "나오기 힘든 순서"대로 희생!
    for (const sacrificeCat of NOVICE_SACRIFICE_ORDER) {
      if (emptyCategories.includes(sacrificeCat)) {
        return sacrificeCat;
      }
    }

    return emptyCategories[0];
  }

  /**
   * 🟡 중급 슬롯 선택:
   * 1) 고득점 달성 족보 우선
   * 2) Choice는 20점 이상일 때만 활용
   * 3) 0점 희생 시 Aces(1s) 1순위 희생
   */
  private static decideScoreCategoryIntermediate(
    dice: number[],
    scores: ScoreSheet,
    emptyCategories: CategoryKey[],
  ): CategoryKey {
    const diceSum = dice.reduce((a, b) => a + b, 0);

    // 고득점 슬롯 (Yacht, LargeStraight, FullHouse 등) 달성 시 즉시 기록
    for (const cat of ['yacht', 'largeStraight', 'fourOfAKind', 'fullHouse', 'smallStraight'] as CategoryKey[]) {
      if (emptyCategories.includes(cat) && calculateScore(cat, dice) > 0) {
        return cat;
      }
    }

    // Choice는 20점 이상일 때만 유효하게 사용
    if (emptyCategories.includes('choice') && diceSum >= 20) {
      return 'choice';
    }

    // 상단 슬롯 4, 5, 6에 눈금 3개 이상 모였을 때 우선 기록
    for (const cat of ['sixes', 'fives', 'fours'] as CategoryKey[]) {
      if (emptyCategories.includes(cat) && calculateScore(cat, dice) >= 12) {
        return cat;
      }
    }

    // 점수가 나오는 슬롯 중 최대 점수
    let bestCat = emptyCategories[0];
    let maxSc = -1;
    for (const cat of emptyCategories) {
      const sc = calculateScore(cat, dice);
      if (sc > maxSc) {
        maxSc = sc;
        bestCat = cat;
      }
    }

    if (maxSc > 0) return bestCat;

    // 0점 희생 전략: Aces 우선 희생
    if (emptyCategories.includes('ones')) return 'ones';
    if (emptyCategories.includes('twos')) return 'twos';
    if (emptyCategories.includes('yacht')) return 'yacht';
    if (emptyCategories.includes('largeStraight')) return 'largeStraight';

    return emptyCategories[0];
  }

  /**
   * 🔴 고급 슬롯 선택: 기대값 및 기회비용 평가 + 상단 63점 보너스 역산
   */
  private static decideScoreCategoryMaster(
    dice: number[],
    scores: ScoreSheet,
    round: number,
    emptyCategories: CategoryKey[],
  ): CategoryKey {
    const diceSum = dice.reduce((a, b) => a + b, 0);

    // 1. Yacht(50점) 나오면 100% 즉시 기록
    if (emptyCategories.includes('yacht') && calculateScore('yacht', dice) === 50) {
      return 'yacht';
    }

    // 2. Choice는 주사위 합이 22점 이상일 때만 아껴서 사용
    if (emptyCategories.includes('choice') && diceSum >= 22) {
      return 'choice';
    }

    // 3. 상단 63점 보너스 달성을 위한 가중치 평가
    const upperKeys: CategoryKey[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    for (let val = 6; val >= 4; val--) {
      const key = upperKeys[val - 1];
      if (emptyCategories.includes(key)) {
        const sc = calculateScore(key, dice);
        // 해당 눈금이 3개 이상(목표 기준치) 충족되면 상단에 우선 투자!
        if (sc >= val * 3) {
          return key;
        }
      }
    }

    // 4. 일반 슬롯 가치 평가
    let bestCat = emptyCategories[0];
    let bestUtility = -999;

    for (const cat of emptyCategories) {
      const sc = calculateScore(cat, dice);
      let utility = sc;

      // 슬롯별 기회비용 보정
      if (cat === 'choice') utility -= 18;
      if (cat === 'yacht') utility -= 35;
      if (cat === 'largeStraight') utility -= 22;

      if (utility > bestUtility) {
        bestUtility = utility;
        bestCat = cat;
      }
    }

    // 만약 0점 희생해야 하는 상황이라면
    if (calculateScore(bestCat, dice) === 0) {
      if (emptyCategories.includes('ones')) return 'ones';
      if (emptyCategories.includes('twos')) return 'twos';
      if (round >= 10 && emptyCategories.includes('yacht')) return 'yacht';
    }

    return bestCat;
  }
}
