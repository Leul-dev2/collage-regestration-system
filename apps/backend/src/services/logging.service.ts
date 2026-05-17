import { prisma } from '../config/prisma';

export interface AuditLogData {
  userId?: string;
  institutionId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}

export const logActivity = async (data: AuditLogData, tx?: any) => {
  try {
    const client = tx || prisma;
    await client.auditLog.create({
      data: {
        userId: data.userId,
        institutionId: data.institutionId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details,
        ipAddress: data.ipAddress,
      },
    });
  } catch (error) {
    // We don't want logging failures to crash the main request
    console.error('Failed to create audit log:', error);
  }
};
