import { apiRequest } from './apiClient';

export interface OcrScanResponse {
  text: string;
  provider: 'ocr_space' | 'gemini_vision' | 'offline_demo';
  confidence?: number;
  itemType?: string;
}

export const ocrService = {
  async scanImage(imageBase64: string, itemType: 'receipt' | 'label' | 'general' = 'general'): Promise<OcrScanResponse> {
    return apiRequest<OcrScanResponse>('/ocr/scan', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64, itemType })
    });
  }
};
