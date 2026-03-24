import { prisma } from '@/lib/prisma';

interface AuditLogInput {
  userId: string;
  userName: string;
  action: string;
  target: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        userName: input.userName,
        action: input.action,
        target: input.target,
        targetId: input.targetId,
        details: input.details as any,
        ipAddress: input.ipAddress,
      },
    });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error);
  }
}
