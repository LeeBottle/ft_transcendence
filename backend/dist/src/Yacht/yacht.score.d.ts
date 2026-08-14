export type CategoryKey = 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes' | 'choice' | 'fourOfAKind' | 'fullHouse' | 'smallStraight' | 'largeStraight' | 'yacht';
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
export declare const CATEGORY_LABELS: Record<CategoryKey, string>;
export declare function calculateScore(category: CategoryKey, dice: number[]): number;
export declare function calculateTotalScore(scores: ScoreSheet): {
    subtotal: number;
    bonus: number;
    total: number;
};
