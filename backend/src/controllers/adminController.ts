import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/auditService';
import { sendSuccess } from '../utils/responseHandler';

export const getOrganizations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type } = req.query;
    const orgs = await auditService.getAllOrganizations(type as 'donor' | 'ngo');
    sendSuccess(res, orgs);
  } catch (error) {
    next(error);
  }
};

export const verifyOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { verification_status, reason } = req.body;
    const org = await auditService.verifyOrganization(
      req.user!.id,
      req.params.id,
      verification_status,
      reason
    );
    sendSuccess(res, org, `Organization ${verification_status} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getModerationLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await auditService.getAuditLogs();
    sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
};
