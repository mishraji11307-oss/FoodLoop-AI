export interface NutritionInput {
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  sugar_g?: number;
  fat_g?: number;
  sat_fat_g?: number;
  sodium_mg?: number;
  fiber_g?: number;
}

export interface NutriResult {
  healthScore: number; // 0 - 100
  nutriGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  summaryEn: string;
  summaryHi: string;
}

/**
 * Computes an objective health score and Nutri-Score grade based on standard
 * nutritional profiling (penalizing high energy, sugar, saturated fat, sodium,
 * and rewarding fiber and protein).
 */
export const calculateNutriScore = (nutrition: NutritionInput, allergens: string[]): NutriResult => {
  let score = 70; // baseline

  const calories = nutrition.calories ?? 200;
  const sugar = nutrition.sugar_g ?? 5;
  const satFat = nutrition.sat_fat_g ?? 2;
  const sodium = nutrition.sodium_mg ?? 200;
  const protein = nutrition.protein_g ?? 4;
  const fiber = nutrition.fiber_g ?? 2;

  // Negative factors
  if (calories > 400) score -= 15;
  else if (calories > 250) score -= 8;

  if (sugar > 20) score -= 20;
  else if (sugar > 10) score -= 10;
  else if (sugar > 5) score -= 4;

  if (satFat > 7) score -= 15;
  else if (satFat > 3) score -= 8;

  if (sodium > 600) score -= 15;
  else if (sodium > 300) score -= 8;

  // Positive factors
  if (fiber >= 5) score += 12;
  else if (fiber >= 2.5) score += 6;

  if (protein >= 15) score += 12;
  else if (protein >= 8) score += 6;

  // Clamp score
  const healthScore = Math.max(10, Math.min(100, Math.round(score)));

  let nutriGrade: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
  if (healthScore >= 80) nutriGrade = 'A';
  else if (healthScore >= 65) nutriGrade = 'B';
  else if (healthScore >= 50) nutriGrade = 'C';
  else if (healthScore >= 35) nutriGrade = 'D';
  else nutriGrade = 'E';

  // Construct bilingual explanations
  const allergenNoteEn = allergens.length > 0 
    ? ` Allergens identified: ${allergens.join(', ')}.` 
    : ' No common declared allergens detected.';
  const allergenNoteHi = allergens.length > 0 
    ? ` पाए गए एलर्जेन: ${allergens.join(', ')}।` 
    : ' कोई सामान्य घोषित एलर्जेन नहीं मिला।';

  let summaryEn = `Nutri-Grade ${nutriGrade} (Score: ${healthScore}/100). `;
  let summaryHi = `न्यूट्रि-ग्रेड ${nutriGrade} (स्कोर: ${healthScore}/100). `;

  if (nutriGrade === 'A' || nutriGrade === 'B') {
    summaryEn += `Nutritionally balanced with favorable protein and fiber levels.${allergenNoteEn}`;
    summaryHi += `संतुलित पोषण, पर्याप्त प्रोटीन और फाइबर सामग्री के साथ।${allergenNoteHi}`;
  } else if (nutriGrade === 'C') {
    summaryEn += `Moderate nutritional profile. Enjoy in balanced moderation.${allergenNoteEn}`;
    summaryHi += `मध्यम पोषण स्तर। संतुलित मात्रा में सेवन करें।${allergenNoteHi}`;
  } else {
    summaryEn += `High in processed sugars, saturated fats, or sodium. Consume occasionally.${allergenNoteEn}`;
    summaryHi += `अत्यधिक शर्करा, संतृप्त वसा या सोडियम की मात्रा। कभी-कभार ही सेवन करें।${allergenNoteHi}`;
  }

  return {
    healthScore,
    nutriGrade,
    summaryEn,
    summaryHi
  };
};
