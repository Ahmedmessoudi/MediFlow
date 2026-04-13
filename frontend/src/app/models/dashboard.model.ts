export interface DepartmentStat {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  patientCount: number;
  bedCount: number;
  occupiedBeds: number;
  occupancyRate: number;
}

export interface DoctorWorkload {
  doctorId: number;
  doctorName: string;
  patientCount: number;
}

export interface DashboardStats {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  icuUsagePercent: number;
  totalPatients: number;
  criticalPatients: number;
  totalRooms: number;
  totalDepartments: number;
  totalEquipment: number;
  departmentStats?: DepartmentStat[];
  doctorWorkloads?: DoctorWorkload[];
}
