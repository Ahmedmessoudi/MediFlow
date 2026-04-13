export type NotificationType = 'PATIENT_ASSIGNED' | 'BED_CHANGE' | 'CRITICAL_ALERT' | 'SYSTEM_ALERT';

export interface Notification {
  id?: number;
  message: string;
  type: NotificationType;
  targetRoles: string;
  read: boolean;
  createdAt: string;
}
