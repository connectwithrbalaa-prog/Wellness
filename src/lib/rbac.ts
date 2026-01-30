import { supabase } from './supabase';

export type UserRole = 'admin' | 'doctor' | 'staff';

export interface DoctorProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  specialization?: string;
  license_number?: string;
  is_active: boolean;
  created_at: string;
}

export async function getCurrentUserProfile(): Promise<DoctorProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function checkUserRole(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  try {
    const profile = await getCurrentUserProfile();

    if (!profile || !profile.is_active) {
      return false;
    }

    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return requiredRoles.includes(profile.role);
  } catch (err) {
    console.error('Error checking user role:', err);
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  return checkUserRole('admin');
}

export async function isDoctor(): Promise<boolean> {
  return checkUserRole(['admin', 'doctor']);
}

export async function canApproveReports(): Promise<boolean> {
  return checkUserRole(['admin', 'doctor']);
}

export async function canCreatePatients(): Promise<boolean> {
  return checkUserRole(['admin', 'doctor', 'staff']);
}

export async function canViewAuditLogs(): Promise<boolean> {
  return checkUserRole('admin');
}

export async function canManageUsers(): Promise<boolean> {
  return checkUserRole('admin');
}

export const RolePermissions = {
  admin: {
    canApproveReports: true,
    canCreatePatients: true,
    canUpdatePatients: true,
    canDeletePatients: false,
    canViewAuditLogs: true,
    canManageUsers: true,
    canExportData: true,
    canConfigureSystem: true,
  },
  doctor: {
    canApproveReports: true,
    canCreatePatients: true,
    canUpdatePatients: true,
    canDeletePatients: false,
    canViewAuditLogs: false,
    canManageUsers: false,
    canExportData: true,
    canConfigureSystem: false,
  },
  staff: {
    canApproveReports: false,
    canCreatePatients: true,
    canUpdatePatients: true,
    canDeletePatients: false,
    canViewAuditLogs: false,
    canManageUsers: false,
    canExportData: false,
    canConfigureSystem: false,
  },
};

export function hasPermission(role: UserRole, permission: keyof typeof RolePermissions.admin): boolean {
  return RolePermissions[role]?.[permission] || false;
}
