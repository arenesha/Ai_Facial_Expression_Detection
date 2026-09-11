export const BASE_SCORE = 10;
export const FAST_BONUS = 5;
export const VERY_FAST_BONUS = 10;

export const calculateScore = (
  reactionTimeMs: number, 
  currentCombo: number
): { pointsAdded: number, isFast: boolean, isVeryFast: boolean } => {
  let points = BASE_SCORE;
  let isFast = false;
  let isVeryFast = false;
  
  if (reactionTimeMs <= 500) {
    points += VERY_FAST_BONUS;
    isVeryFast = true;
  } else if (reactionTimeMs <= 1000) {
    points += FAST_BONUS;
    isFast = true;
  }
  
  // Apply a combo multiplier carefully (e.g. max x5)
  // Combo starts at 1. So if combo is 3, multiplier is 1.2 (for example)
  // The requirement says "Add combo multiplier carefully"
  const multiplier = 1 + (Math.min(currentCombo, 10) * 0.1); 
  
  points = Math.round(points * multiplier);
  
  return { pointsAdded: points, isFast, isVeryFast };
};
