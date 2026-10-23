import { apiRequest } from './apiClient';
import { MatchRecommendation } from '../types';

export const matchingService = {
  async getRecommendations(): Promise<MatchRecommendation[]> {
    return apiRequest<MatchRecommendation[]>('/matching/recommendations');
  }
};
