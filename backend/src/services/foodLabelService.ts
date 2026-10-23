import { foodLabelRepository } from '../repositories/foodLabelRepository';
import { calculateNutriScore, NutritionInput } from '../utils/nutriScore';
import { FoodLabelScan } from '../types';

export interface ScanLabelInput {
  userId?: string;
  productName: string;
  brand?: string;
  rawText: string;
  userAllergens?: string[];
  imageUrl?: string;
}

const COMMON_ALLERGENS_DICT: Record<string, string[]> = {
  peanuts: ['peanut', 'peanuts', 'groundnut', 'groundnuts', 'arachis'],
  tree_nuts: ['almond', 'almonds', 'cashew', 'cashews', 'walnut', 'walnuts', 'hazelnut', 'hazelnuts', 'pistachio', 'pistachios', 'pecan'],
  milk: ['milk', 'dairy', 'whey', 'casein', 'lactose', 'butter', 'cheese', 'cream'],
  gluten: ['wheat', 'barley', 'rye', 'gluten', 'spelt', 'semolina', 'maida', 'atta'],
  soy: ['soy', 'soya', 'soybean', 'soybeans', 'soy lecithin'],
  eggs: ['egg', 'eggs', 'egg yolk', 'egg white', 'albumin'],
  fish: ['fish', 'salmon', 'tuna', 'anchovy', 'anchovies', 'codfish'],
  shellfish: ['crustacean', 'crustaceans', 'shrimp', 'crab', 'lobster', 'prawn', 'prawns'],
  sesame: ['sesame', 'tahini', 'til seed', 'gingelly']
};

export class FoodLabelService {
  /**
   * Deterministically parses ingredients, nutrition facts, allergens, and generates bilingual analysis.
   */
  async processLabelScan(input: ScanLabelInput): Promise<FoodLabelScan & { userAllergenConflict: boolean; matchingUserAllergens: string[] }> {
    const textLower = input.rawText.toLowerCase();

    // 0. Auto-detect Product Name & Brand if placeholder or empty
    let detectedProductName = (input.productName || '').trim();
    let detectedBrand = (input.brand || '').trim();

    if (!detectedProductName || detectedProductName.toLowerCase() === 'abc' || detectedProductName === 'Granola Crunch') {
      if (/kurkure/i.test(input.rawText)) detectedProductName = 'Kurkure Masala Munch';
      else if (/maggi/i.test(input.rawText)) detectedProductName = 'Maggi 2-Minute Noodles';
      else if (/lays|lay's/i.test(input.rawText)) detectedProductName = "Lay's Potato Chips";
      else if (/britannia/i.test(input.rawText)) detectedProductName = 'Britannia Good Day';
      else if (/amul/i.test(input.rawText)) detectedProductName = 'Amul Butter';
      else {
        const firstLine = input.rawText.split('\n')[0]?.trim();
        if (firstLine && firstLine.length > 2 && firstLine.length < 50) {
          detectedProductName = firstLine.replace(/is a Registered.*/i, '').trim() || 'Food Product';
        }
      }
    }

    if (!detectedBrand || detectedBrand.toLowerCase() === 'jbvgb' || detectedBrand === 'NatureHarvest') {
      if (/pepsico/i.test(input.rawText)) detectedBrand = 'PepsiCo India';
      else if (/nestle|nestlé/i.test(input.rawText)) detectedBrand = 'Nestlé';
      else if (/britannia/i.test(input.rawText)) detectedBrand = 'Britannia';
      else if (/amul/i.test(input.rawText)) detectedBrand = 'Amul';
      else if (/haldiram/i.test(input.rawText)) detectedBrand = "Haldiram's";
      else if (/parle/i.test(input.rawText)) detectedBrand = 'Parle';
      else if (/itc/i.test(input.rawText)) detectedBrand = 'ITC';
    }

    // 1. Detect allergens present in text using strict word boundaries (avoids 'code' matching 'cod' or 'veggie' matching 'egg')
    const detectedAllergens: string[] = [];
    for (const [allergenKey, keywords] of Object.entries(COMMON_ALLERGENS_DICT)) {
      const isPresent = keywords.some(kw => {
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
        return pattern.test(input.rawText);
      });
      if (isPresent) {
        detectedAllergens.push(allergenKey);
      }
    }

    // 2. Extract ingredients list
    let ingredients: string[] = [];
    const ingrMatch = input.rawText.match(/ingredients?:?([^\n\r.]+)/i);
    if (ingrMatch && ingrMatch[1]) {
      ingredients = ingrMatch[1]
        .split(/[,;]/)
        .map(i => i.trim())
        .filter(i => i.length > 1);
    } else {
      // Fallback clean extraction
      ingredients = input.rawText
        .split(/[,\n]/)
        .map(i => i.trim())
        .filter(i => i.length > 2 && !i.match(/nutrition|calories|protein|fat|serving/i))
        .slice(0, 12);
    }

    // 3. Extract nutrition facts
    const nutrition: NutritionInput = {};
    const calMatch = input.rawText.match(/(\d+)\s*(?:kcal|calories)/i);
    if (calMatch) nutrition.calories = parseInt(calMatch[1], 10);

    const protMatch = input.rawText.match(/protein:?\s*(\d+(?:\.\d+)?)\s*g/i);
    if (protMatch) nutrition.protein_g = parseFloat(protMatch[1]);

    const carbMatch = input.rawText.match(/(?:carbohydrate|carbs):?\s*(\d+(?:\.\d+)?)\s*g/i);
    if (carbMatch) nutrition.carbs_g = parseFloat(carbMatch[1]);

    const sugMatch = input.rawText.match(/sugars?:?\s*(\d+(?:\.\d+)?)\s*g/i);
    if (sugMatch) nutrition.sugar_g = parseFloat(sugMatch[1]);

    const fatMatch = input.rawText.match(/total fat:?\s*(\d+(?:\.\d+)?)\s*g/i);
    if (fatMatch) nutrition.fat_g = parseFloat(fatMatch[1]);

    const satFatMatch = input.rawText.match(/saturated fat:?\s*(\d+(?:\.\d+)?)\s*g/i);
    if (satFatMatch) nutrition.sat_fat_g = parseFloat(satFatMatch[1]);

    const sodMatch = input.rawText.match(/sodium:?\s*(\d+(?:\.\d+)?)\s*mg/i);
    if (sodMatch) nutrition.sodium_mg = parseFloat(sodMatch[1]);

    // 4. Calculate NutriScore & generate bilingual summaries
    const { healthScore, nutriGrade, summaryEn, summaryHi } = calculateNutriScore(
      nutrition,
      detectedAllergens
    );

    // 5. Detect Preservatives & Additives
    const preservatives: string[] = [];
    const eNumberMatches = input.rawText.match(/E\d{3,4}[a-z]?/gi);
    if (eNumberMatches) {
      preservatives.push(...Array.from(new Set(eNumberMatches)));
    }
    if (textLower.includes('sodium benzoate')) preservatives.push('Sodium Benzoate (E211)');
    if (textLower.includes('tocopherol')) preservatives.push('Tocopherols (E306)');
    if (textLower.includes('citric acid')) preservatives.push('Citric Acid (E330)');

    // 6. User allergen conflict check
    let userAllergens = input.userAllergens || [];
    if (input.userId && userAllergens.length === 0) {
      const prefs = await foodLabelRepository.getAllergenPreferences(input.userId);
      if (prefs) userAllergens = prefs.allergens;
    }

    const matchingUserAllergens = detectedAllergens.filter(da =>
      userAllergens.some(ua => ua.toLowerCase() === da.toLowerCase())
    );
    const userAllergenConflict = matchingUserAllergens.length > 0;

    // 7. Save Scan Record
    const saved = await foodLabelRepository.saveScan({
      user_id: input.userId,
      product_name: detectedProductName || input.productName || 'Food Item',
      brand: detectedBrand || input.brand || '',
      image_url: input.imageUrl,
      extracted_text: input.rawText,
      ingredients,
      nutrition_facts: nutrition,
      detected_allergens: detectedAllergens,
      health_score: healthScore,
      nutri_grade: nutriGrade,
      explanation_en: summaryEn,
      explanation_hi: summaryHi,
      preservatives_additives: preservatives
    });

    return {
      ...saved,
      userAllergenConflict,
      matchingUserAllergens
    };
  }

  async getRecentScans(userId?: string) {
    return foodLabelRepository.getScansByUserId(userId);
  }

  async getUserAllergenPreferences(userId: string) {
    return foodLabelRepository.getAllergenPreferences(userId);
  }

  async updateUserAllergenPreferences(
    userId: string,
    allergens: string[],
    dietaryFlags: string[],
    strictness: 'warning' | 'strict'
  ) {
    return foodLabelRepository.saveAllergenPreferences(userId, allergens, dietaryFlags, strictness);
  }
}

export const foodLabelService = new FoodLabelService();
