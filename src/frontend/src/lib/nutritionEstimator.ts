export interface NutritionEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export function estimateNutrition(fileName: string): NutritionEstimate {
  // Simulated AI estimation based on common food patterns
  // This is a deterministic, local-only estimator
  
  const hash = fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 100;

  // Generate plausible ranges based on seed
  const mealSize = (seed % 3) + 1; // 1=small, 2=medium, 3=large
  
  const baseCalories = mealSize === 1 ? 300 : mealSize === 2 ? 500 : 700;
  const variance = (seed % 200) - 100;
  const calories = Math.max(200, baseCalories + variance);

  // Macro distribution (roughly balanced)
  const proteinRatio = 0.25 + (seed % 10) / 100;
  const carbsRatio = 0.45 + (seed % 15) / 100;
  const fatRatio = 1 - proteinRatio - carbsRatio;

  const protein = (calories * proteinRatio) / 4; // 4 cal per gram
  const carbs = (calories * carbsRatio) / 4;
  const fat = (calories * fatRatio) / 9; // 9 cal per gram

  const fiber = Math.max(2, Math.min(15, carbs * 0.15));
  const sugar = Math.max(5, Math.min(30, carbs * 0.3));
  const sodium = Math.max(200, Math.min(1500, calories * 1.5));

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    fiber: Math.round(fiber),
    sugar: Math.round(sugar),
    sodium: Math.round(sodium),
  };
}
