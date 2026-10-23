import { Request, Response, NextFunction } from 'express';
import { donationService } from '../services/donationService';
import { sendSuccess } from '../utils/responseHandler';
import { DonationStatus } from '../types';

export const getDonations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, food_category, donor_id } = req.query;
    const donations = await donationService.getDonations({
      status: status as DonationStatus,
      food_category: food_category as string,
      donor_id: donor_id as string
    });
    sendSuccess(res, donations);
  } catch (error) {
    next(error);
  }
};

export const getDonationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const donation = await donationService.getDonationById(req.params.id);
    sendSuccess(res, donation);
  } catch (error) {
    next(error);
  }
};

export const createDonation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const donation = await donationService.createDonation(req.user!.id, req.body);
    sendSuccess(res, donation, 'Donation listing published', 201);
  } catch (error) {
    next(error);
  }
};

export const requestDonation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ngo_id, request_notes } = req.body;
    const request = await donationService.requestDonation(
      req.params.id,
      ngo_id,
      req.user!.id,
      request_notes
    );
    sendSuccess(res, request, 'Donation claim request submitted', 201);
  } catch (error) {
    next(error);
  }
};

export const getDonationRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requests = await donationService.getDonationRequests(req.params.id);
    sendSuccess(res, requests);
  } catch (error) {
    next(error);
  }
};

export const acceptDonationRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const donation = await donationService.acceptRequest(req.params.id, req.user!.id);
    sendSuccess(res, donation, 'Donation request accepted. Status changed to matched.');
  } catch (error) {
    next(error);
  }
};

export const rejectDonationRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await donationService.rejectRequest(req.params.id, req.user!.id);
    sendSuccess(res, result, 'Donation request rejected');
  } catch (error) {
    next(error);
  }
};

export const confirmPickup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { otp, temperature_celsius, notes } = req.body;
    const donation = await donationService.confirmPickup(
      req.params.id,
      otp,
      req.user!.id,
      { temperatureCelsius: temperature_celsius, notes }
    );
    sendSuccess(res, donation, 'Pickup OTP verified successfully. Surplus in transit.');
  } catch (error) {
    next(error);
  }
};

export const confirmDelivery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { otp, beneficiaries_served, confirmation_notes, confirmation_photo_url } = req.body;
    const donation = await donationService.confirmDelivery(
      req.params.id,
      otp,
      req.user!.id,
      {
        beneficiariesServed: beneficiaries_served,
        confirmationNotes: confirmation_notes,
        confirmationPhotoUrl: confirmation_photo_url
      }
    );
    sendSuccess(res, donation, 'Delivery OTP verified. Surplus food distribution completed.');
  } catch (error) {
    next(error);
  }
};
