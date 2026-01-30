import { supabase } from './supabase';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'create_patient'
  | 'update_patient'
  | 'view_patient'
  | 'create_visit'
  | 'update_visit'
  | 'view_visit'
  | 'generate_report'
  | 'approve_report'
  | 'reject_report'
  | 'view_report'
  | 'send_report'
  | 'update_password'
  | 'failed_login';

export type EntityType = 'patient' | 'visit' | 'report' | 'user';

interface AuditLogParams {
  action: AuditAction;
  entityType?: EntityType;
  entityId?: string;
  details?: Record<string, any>;
}

export async function createAuditLog({
  action,
  entityType,
  entityId,
  details,
}: AuditLogParams): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Cannot create audit log: No authenticated user');
      return false;
    }

    const { error } = await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      details: details || {},
    });

    if (error) {
      console.error('Error creating audit log:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error creating audit log:', err);
    return false;
  }
}

export async function logPatientAccess(patientId: string, action: 'view' | 'create' | 'update') {
  return createAuditLog({
    action: `${action}_patient` as AuditAction,
    entityType: 'patient',
    entityId: patientId,
  });
}

export async function logVisitAccess(visitId: string, action: 'view' | 'create' | 'update') {
  return createAuditLog({
    action: `${action}_visit` as AuditAction,
    entityType: 'visit',
    entityId: visitId,
  });
}

export async function logReportAccess(
  reportId: string,
  action: 'view' | 'generate' | 'approve' | 'reject' | 'send'
) {
  return createAuditLog({
    action: `${action}_report` as AuditAction,
    entityType: 'report',
    entityId: reportId,
  });
}

export async function logAuthentication(action: 'login' | 'logout' | 'failed_login', details?: Record<string, any>) {
  return createAuditLog({
    action,
    details,
  });
}

export async function getAuditLogs(filters?: {
  userId?: string;
  action?: AuditAction;
  entityType?: EntityType;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters?.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return null;
  }
}

export async function getAuditLogsByEntity(entityType: EntityType, entityId: string) {
  return getAuditLogs({ entityType, entityId });
}

export async function getRecentUserActivity(userId: string, limit: number = 20) {
  return getAuditLogs({ userId, limit });
}
