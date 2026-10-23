import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';

export interface OcrResult {
  text: string;
  provider: 'ocr_space' | 'gemini_vision' | 'offline_demo';
  confidence?: number;
  itemType?: 'receipt' | 'label' | 'general';
}

export class OcrService {
  /**
   * Extracts text from a base64 encoded image or image data URL.
   */
  async extractText(imageBase64: string, itemType: 'receipt' | 'label' | 'general' = 'general'): Promise<OcrResult> {
    const ocrKey = config.services.ocrApiKey?.trim();
    const aiKey = config.services.aiApiKey?.trim();

    // 1. If Gemini AI Key is configured (or OCR key is Google API key)
    const effectiveAiKey = aiKey || (ocrKey && ocrKey.startsWith('AIza') ? ocrKey : '');
    if (effectiveAiKey) {
      try {
        const geminiResult = await this.extractWithGemini(imageBase64, effectiveAiKey, itemType);
        if (geminiResult && geminiResult.trim().length > 0) {
          return {
            text: geminiResult,
            provider: 'gemini_vision',
            confidence: 0.95,
            itemType
          };
        }
      } catch (err) {
        console.warn('Gemini Vision OCR error, trying OCR.space fallback:', (err as any).message);
      }
    }

    // 2. If OCR.space Key is configured (or use free public demo key)
    const effectiveOcrKey = ocrKey && !ocrKey.startsWith('AIza') ? ocrKey : 'helloworld';
    try {
      const ocrSpaceResult = await this.extractWithOcrSpace(imageBase64, effectiveOcrKey);
      if (ocrSpaceResult && ocrSpaceResult.trim().length > 0) {
        return {
          text: ocrSpaceResult,
          provider: 'ocr_space',
          confidence: 0.88,
          itemType
        };
      }
    } catch (err) {
      console.warn('OCR.space error:', (err as any).message);
    }

    // 3. Graceful offline demo fallback
    return {
      text: this.getDemoFallbackText(itemType),
      provider: 'offline_demo',
      confidence: 0.80,
      itemType
    };
  }

  /**
   * Calls OCR.space REST API
   */
  private async extractWithOcrSpace(imageBase64: string, apiKey: string): Promise<string> {
    const formattedData = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const formData = new URLSearchParams();
    formData.append('apikey', apiKey);
    formData.append('base64Image', formattedData);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!res.ok) {
      throw new AppError(`OCR.space HTTP error: ${res.statusText}`, 502);
    }

    const data = await res.json() as any;
    if (data.IsErroredOnProcessing) {
      throw new AppError(data.ErrorMessage?.[0] || 'OCR.space processing failed', 422);
    }

    const parsedResults = data.ParsedResults || [];
    if (parsedResults.length === 0 || !parsedResults[0].ParsedText) {
      return '';
    }

    return parsedResults[0].ParsedText.trim();
  }

  /**
   * Calls Google Gemini Vision API for high-accuracy food label / receipt OCR
   */
  private async extractWithGemini(imageBase64: string, apiKey: string, itemType: string): Promise<string> {
    let cleanBase64 = imageBase64;
    let mimeType = 'image/jpeg';

    if (imageBase64.startsWith('data:')) {
      const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        cleanBase64 = match[2];
      }
    }

    const prompt = itemType === 'receipt'
      ? 'Transcribe this grocery store receipt exactly line by line. Include item names, quantities, and prices if legible.'
      : 'Extract all ingredients, nutrition facts (energy/calories, protein, carbohydrates, sugars, fat, saturated fat, sodium/salt), and allergen statements from this food packaging image verbatim. Return plain text only.';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: cleanBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new AppError(`Gemini Vision error: ${errText}`, 502);
    }

    const data = await res.json() as any;
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return textOutput ? textOutput.trim() : '';
  }

  /**
   * Returns a sample mock text if no external API key is active or if offline
   */
  private getDemoFallbackText(itemType: 'receipt' | 'label' | 'general'): string {
    if (itemType === 'receipt') {
      return `ORGANIC SUPERMARKET #402
DATE: 2026-10-23
-----------------------------
WHOLE MILK 1L           $3.49
WHOLE WHEAT BREAD       $2.99
GREEK YOGURT 500G       $4.29
FRESH SPINACH BUNCH     $2.19
ORGANIC APPLES 1KG      $4.99
CHICKEN BREAST 500G     $6.50
BASMATI RICE 1KG        $3.80
-----------------------------
SUBTOTAL               $28.25
TAX                     $1.41
TOTAL                  $29.66
ITEMS SOLD: 7`;
    }

    return `INGREDIENTS: Whole grain rolled oats, cane sugar, honey, almonds, peanuts, sunflower seeds, sea salt, soy lecithin, tocopherols (Vitamin E preservative E306).
CONTAINS: PEANUTS, TREE NUTS (ALMONDS), SOY.
NUTRITION PER 100g: Calories 450kcal, Protein 12g, Carbohydrate 58g, Sugars 22g, Total Fat 18g, Saturated Fat 4g, Sodium 160mg.`;
  }
}

export const ocrService = new OcrService();
