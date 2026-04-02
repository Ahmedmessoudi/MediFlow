export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';

export interface AppUser {
  id?: number;
  username: string;
  role: UserRole;
  password?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: UserRole;
}

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  ADMIN: ['/dashboard', '/patients', '/beds', '/rooms', '/admin'],
  DOCTOR: ['/dashboard', '/patients', '/beds'],
  NURSE: ['/dashboard', '/patients', '/beds'],
  RECEPTIONIST: ['/patients', '/beds'],
};

export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  ADMIN: '/dashboard',
  DOCTOR: '/dashboard',
  NURSE: '/dashboard',
  RECEPTIONIST: '/patients',
};

export type Permission =
  | 'patient:create' | 'patient:read' | 'patient:update' | 'patient:delete'
  | 'patient:update_condition' | 'patient:assign_bed' | 'patient:discharge'
  | 'bed:read' | 'bed:manage'
  | 'room:read' | 'room:manage'
  | 'equipment:read' | 'equipment:manage'
  | 'user:manage'
  | 'dashboard:full' | 'dashboard:limited';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'patient:create', 'patient:read', 'patient:update', 'patient:delete',
    'patient:update_condition', 'patient:assign_bed', 'patient:discharge',
    'bed:read', 'bed:manage',
    'room:read', 'room:manage',
    'equipment:read', 'equipment:manage',
    'user:manage',
    'dashboard:full',
  ],
  DOCTOR: [
    'patient:read', 'patient:update_condition',
    'bed:read',
    'dashboard:limited',
  ],
  NURSE: [
    'patient:read', 'patient:update',
    'patient:assign_bed', 'patient:discharge',
    'bed:read', 'bed:manage',
    'dashboard:limited',
  ],
  RECEPTIONIST: [
    'patient:create', 'patient:read',
    'bed:read',
  ],
};
