import { donationRepository } from '../repositories/donationRepository';
import { organizationRepository } from '../repositories/organizationRepository';
import { calculateDistanceKm, calculateDistanceScore } from '../utils/distance';
import { Donation, Organization } from '../types';

export interface MatchRecommendation {
  donation: Donation;
  ngo: Organization;
  distanceKm: number;
  matchScore: number;
  scoreBreakdown: {
    distanceScore: number; // 35% weight
    capacityScore: number; // 25% weight
    categoryMatchScore: number; // 25% weight
    urgencyBonus: number; // 15% weight
  };
  rationale: string;
}

export class MatchingService {
  /**
   * Rule-based multi-criteria matching algorithm.
   * Explicitly transparent, explainable, and non-blackbox.
   */
  async getRecommendationsForNgo(ngoUserId: string): Promise<MatchRecommendation[]> {
    const ngo = await organizationRepository.findByUserId(ngoUserId);
    if (!ngo) return [];

    // Find all available donations
    const availableDonations = await donationRepository.findDonations({ status: 'available' });
    const recommendations: MatchRecommendation[] = [];

    for (const donation of availableDonations) {
      // 1. Distance Calculation (Haversine)
      const distanceKm = calculateDistanceKm(
        donation.pickup_latitude,
        donation.pickup_longitude,
        ngo.latitude,
        ngo.longitude
      );

      const distanceScore = calculateDistanceScore(distanceKm, 30); // 30km cutoff

      // 2. Capacity Score (ratio of donation to capacity)
      let capacityScore = 100;
      if (donation.quantity_kg > ngo.daily_capacity_kg) {
        capacityScore = Math.max(10, Math.round((ngo.daily_capacity_kg / donation.quantity_kg) * 100));
      }

      // 3. Category & Dietary Attribute Match
      const acceptsCategory = ngo.accepted_food_types.some(
        type => type.toLowerCase() === donation.food_category.toLowerCase()
      );
      const categoryMatchScore = acceptsCategory ? 100 : 40;

      // 4. Urgency Bonus
      const hoursToExpiry = (new Date(donation.expiry_time).getTime() - Date.now()) / 3600000;
      let urgencyBonus = 50;
      if (hoursToExpiry <= 4 && hoursToExpiry > 0) urgencyBonus = 100;
      else if (hoursToExpiry <= 8) urgencyBonus = 80;

      // Weighted total score
      const matchScore = Math.round(
        distanceScore * 0.35 +
        capacityScore * 0.25 +
        categoryMatchScore * 0.25 +
        urgencyBonus * 0.15
      );

      let rationale = `${distanceKm}km away. `;
      if (acceptsCategory) rationale += `Matches accepted '${donation.food_category}' category. `;
      if (hoursToExpiry <= 4) rationale += `Urgent pickup needed (<${Math.max(1, Math.round(hoursToExpiry))}h to expiry). `;

      recommendations.push({
        donation,
        ngo,
        distanceKm,
        matchScore,
        scoreBreakdown: {
          distanceScore,
          capacityScore,
          categoryMatchScore,
          urgencyBonus
        },
        rationale: rationale.trim()
      });
    }

    // Sort descending by match score
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export const matchingService = new MatchingService();
