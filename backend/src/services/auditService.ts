import { auditRepository } from '../repositories/auditRepository';
import { organizationRepository } from '../repositories/organizationRepository';
import { VerificationStatus } from '../types';

export class AuditService {
  async getAuditLogs(limit = 50) {
    return auditRepository.getRecent(limit);
  }

  async getAllOrganizations(type?: 'donor' | 'ngo') {
    return organizationRepository.findAll(type);
  }

  async verifyOrganization(
    adminUserId: string,
    orgId: string,
    status: VerificationStatus,
    reason?: string
  ) {
    const updated = await organizationRepository.updateVerification(orgId, status);
    if (!updated) throw new Error('Organization not found');

    await auditRepository.log(
      status === 'verified' ? 'ORG_VERIFIED' : 'ORG_REJECTED',
      'organization',
      orgId,
      { status, reason, orgName: updated.name },
      adminUserId
    );

    return updated;
  }
}

export const auditService = new AuditService();
