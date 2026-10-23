import { donationRepository } from '../repositories/donationRepository';
import { organizationRepository } from '../repositories/organizationRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { auditRepository } from '../repositories/auditRepository';
import { Donation, DonationStatus, DonationRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

const generateSixDigitOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const ALLOWED_STATUS_TRANSITIONS: Record<DonationStatus, DonationStatus[]> = {
  available: ['requested', 'matched', 'cancelled', 'expired'],
  requested: ['matched', 'available', 'cancelled', 'expired'],
  matched: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  expired: []
};

export class DonationService {
  async getDonations(filters?: {
    status?: DonationStatus;
    food_category?: string;
    donor_id?: string;
  }) {
    return donationRepository.findDonations(filters);
  }

  async getDonationById(id: string) {
    const donation = await donationRepository.findDonationById(id);
    if (!donation) throw new AppError('Donation not found', 404);
    return donation;
  }

  async createDonation(
    donorId: string,
    data: Omit<Donation, 'id' | 'donor_id' | 'status' | 'pickup_otp' | 'delivery_otp' | 'created_at' | 'updated_at'>
  ) {
    const pickupOtp = generateSixDigitOtp();
    const deliveryOtp = generateSixDigitOtp();

    const donation = await donationRepository.createDonation({
      ...data,
      donor_id: donorId,
      status: 'available',
      pickup_otp: pickupOtp,
      delivery_otp: deliveryOtp
    });

    await auditRepository.log(
      'DONATION_CREATED',
      'donation',
      donation.id,
      { title: donation.title, quantity_kg: donation.quantity_kg },
      donorId
    );

    return donation;
  }

  async requestDonation(donationId: string, ngoId: string, requesterUserId: string, notes?: string) {
    const donation = await donationRepository.findDonationById(donationId);
    if (!donation) throw new AppError('Donation not found', 404);

    if (donation.status !== 'available' && donation.status !== 'requested') {
      throw new AppError(`Cannot request donation with status '${donation.status}'`, 400);
    }

    const ngo = await organizationRepository.findById(ngoId);
    if (!ngo) throw new AppError('NGO organization not found', 404);
    if (ngo.verification_status !== 'verified') {
      throw new AppError('NGO must be verified by admin before requesting food surplus', 403);
    }

    // Check existing request
    const existingRequests = await donationRepository.findRequestsByDonationId(donationId);
    const alreadyRequested = existingRequests.some(r => r.ngo_id === ngoId && r.status === 'pending');
    if (alreadyRequested) {
      throw new AppError('You have already submitted a pending request for this donation', 400);
    }

    const request = await donationRepository.createRequest({
      donation_id: donationId,
      ngo_id: ngoId,
      requester_user_id: requesterUserId,
      match_score: 85,
      status: 'pending',
      request_notes: notes
    });

    // Update status to requested if currently available
    if (donation.status === 'available') {
      await donationRepository.updateDonationStatus(
        donationId,
        'requested',
        requesterUserId,
        `Request received from ${ngo.name}`
      );
    }

    // Notify donor
    await notificationRepository.create({
      user_id: donation.donor_id,
      title: 'New Donation Claim Request',
      message: `${ngo.name} requested to claim "${donation.title}". Review and accept to schedule pickup.`,
      type: 'donation_match',
      link_url: `/foodbridge`
    });

    return request;
  }

  async getDonationRequests(donationId: string) {
    return donationRepository.findRequestsByDonationId(donationId);
  }

  async acceptRequest(requestId: string, donorUserId: string) {
    const request = await donationRepository.findRequestById(requestId);
    if (!request) throw new AppError('Donation request not found', 404);

    const donation = await donationRepository.findDonationById(request.donation_id);
    if (!donation) throw new AppError('Donation not found', 404);

    if (donation.donor_id !== donorUserId) {
      throw new AppError('Forbidden: Only the donation owner can accept requests', 403);
    }

    // Validate transition
    this.validateTransition(donation.status, 'matched');

    await donationRepository.updateRequestStatus(requestId, 'accepted');
    const updated = await donationRepository.updateDonationStatus(
      donation.id,
      'matched',
      donorUserId,
      `Accepted request by NGO ID: ${request.ngo_id}`,
      request.ngo_id
    );

    // Notify NGO
    await notificationRepository.create({
      user_id: request.requester_user_id,
      title: 'Donation Request Accepted!',
      message: `Your request for "${donation.title}" was accepted. Pickup OTP is ready.`,
      type: 'request_accepted',
      link_url: `/foodbridge`
    });

    return updated;
  }

  async rejectRequest(requestId: string, donorUserId: string) {
    const request = await donationRepository.findRequestById(requestId);
    if (!request) throw new AppError('Donation request not found', 404);

    const donation = await donationRepository.findDonationById(request.donation_id);
    if (!donation) throw new AppError('Donation not found', 404);

    if (donation.donor_id !== donorUserId) {
      throw new AppError('Forbidden: Only the donation owner can reject requests', 403);
    }

    await donationRepository.updateRequestStatus(requestId, 'rejected');

    // If no other pending requests, return status to available
    const remainingRequests = await donationRepository.findRequestsByDonationId(donation.id);
    const hasOtherPending = remainingRequests.some(r => r.id !== requestId && r.status === 'pending');
    if (!hasOtherPending && donation.status === 'requested') {
      await donationRepository.updateDonationStatus(
        donation.id,
        'available',
        donorUserId,
        'All pending requests rejected, returned to available'
      );
    }

    return { message: 'Request rejected successfully' };
  }

  async confirmPickup(
    donationId: string,
    otp: string,
    verifiedByUserId: string,
    details?: { temperatureCelsius?: number; notes?: string }
  ) {
    const donation = await donationRepository.findDonationById(donationId);
    if (!donation) throw new AppError('Donation not found', 404);

    if (donation.status !== 'matched') {
      throw new AppError(`Cannot confirm pickup for donation in state '${donation.status}'. Must be 'matched'.`, 400);
    }

    if (donation.pickup_otp !== otp.trim()) {
      throw new AppError('Invalid Pickup OTP code. Verification failed.', 400);
    }

    this.validateTransition(donation.status, 'in_transit');

    const updated = await donationRepository.updateDonationStatus(
      donationId,
      'in_transit',
      verifiedByUserId,
      'Pickup OTP verified. Food is in transit.'
    );

    await donationRepository.createDeliveryConfirmation({
      donation_id: donationId,
      ngo_id: donation.assigned_ngo_id || '',
      pickup_timestamp: new Date().toISOString(),
      pickup_verified_by: verifiedByUserId,
      temperature_at_pickup: details?.temperatureCelsius,
      handover_notes: details?.notes
    });

    return updated;
  }

  async confirmDelivery(
    donationId: string,
    otp: string,
    verifiedByUserId: string,
    details?: { beneficiariesServed?: number; confirmationNotes?: string; confirmationPhotoUrl?: string }
  ) {
    const donation = await donationRepository.findDonationById(donationId);
    if (!donation) throw new AppError('Donation not found', 404);

    if (donation.status !== 'in_transit') {
      throw new AppError(`Cannot confirm delivery for donation in state '${donation.status}'. Must be 'in_transit'.`, 400);
    }

    if (donation.delivery_otp !== otp.trim()) {
      throw new AppError('Invalid Delivery OTP code. Verification failed.', 400);
    }

    this.validateTransition(donation.status, 'delivered');

    const updated = await donationRepository.updateDonationStatus(
      donationId,
      'delivered',
      verifiedByUserId,
      'Delivery OTP verified. Surplus food handed over and served.'
    );

    await auditRepository.log(
      'DELIVERY_COMPLETED',
      'donation',
      donationId,
      {
        beneficiariesServed: details?.beneficiariesServed || donation.servings_estimate,
        notes: details?.confirmationNotes
      },
      verifiedByUserId
    );

    return updated;
  }

  private validateTransition(current: DonationStatus, next: DonationStatus): void {
    const allowed = ALLOWED_STATUS_TRANSITIONS[current];
    if (!allowed || !allowed.includes(next)) {
      throw new AppError(
        `Invalid donation state transition from '${current}' to '${next}'. Allowed: [${allowed.join(', ')}]`,
        400
      );
    }
  }
}

export const donationService = new DonationService();
