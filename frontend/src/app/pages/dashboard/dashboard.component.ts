import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { DashboardStats } from '../../models/dashboard.model';

Chart.register(...registerables);

interface KpiCard {
  title: string;
  value: string | number;
  icon: string;
  trend: string;
  up: boolean;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="space-y-4 animate-fade-in">
      <div>
        <h1 class="text-xl font-bold text-foreground">
          {{ isDoctor ? 'My Dashboard' : 'Dashboard' }}
        </h1>
        <p class="text-muted-foreground text-xs">
          {{ isDoctor ? 'Your patients and workload overview' : (hasFullDashboard ? 'Real-time hospital overview' : 'Limited dashboard view') }}
        </p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        @for (kpi of kpis(); track kpi.title) {
          <div class="bg-card rounded-xl border hover:shadow-md transition-shadow p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-muted-foreground">{{ kpi.title }}</p>
                <p class="text-2xl font-bold text-foreground mt-0.5">{{ kpi.value }}</p>
                <div class="flex items-center gap-1 mt-0.5">
                  @if (kpi.up) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                  }
                  <span class="text-[10px]" [class]="kpi.up ? 'text-success' : 'text-destructive'">{{ kpi.trend }}</span>
                </div>
              </div>
              <div class="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <span [innerHTML]="kpi.icon" [class]="kpi.color"></span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Charts -->
      @if (hasFullDashboard) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <!-- Department Occupancy Chart -->
          <div class="lg:col-span-2 bg-card rounded-xl border p-4 flex flex-col">
            <h3 class="text-sm font-semibold mb-3">Beds per Department</h3>
            <div class="relative flex-1 min-h-[220px] max-h-[260px] w-full">
              <canvas #deptChart></canvas>
            </div>
          </div>

          <!-- Doctor Workload Chart -->
          <div class="bg-card rounded-xl border p-4 flex flex-col">
            <h3 class="text-sm font-semibold mb-3">Patients per Doctor</h3>
            <div class="relative flex-1 min-h-[160px] max-h-[200px] w-full">
              <canvas #doctorChart></canvas>
            </div>
          </div>
        </div>

        <!-- Department Stats Table -->
        @if (stats()?.departmentStats?.length) {
          <div class="bg-card rounded-xl border">
            <div class="p-4 pb-2">
              <h3 class="text-sm font-semibold">Department Statistics</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b bg-muted/50">
                    <th class="text-left py-2 px-3 font-medium text-muted-foreground">Department</th>
                    <th class="text-left py-2 px-3 font-medium text-muted-foreground">Code</th>
                    <th class="text-left py-2 px-3 font-medium text-muted-foreground">Patients</th>
                    <th class="text-left py-2 px-3 font-medium text-muted-foreground">Beds</th>
                    <th class="text-left py-2 px-3 font-medium text-muted-foreground">Occupied</th>
                    <th class="text-left py-2 px-3 font-medium text-muted-foreground">Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  @for (dept of stats()?.departmentStats; track dept.departmentId) {
                    <tr class="border-b hover:bg-muted/50 transition-colors">
                      <td class="py-2 px-3 font-medium">{{ dept.departmentName }}</td>
                      <td class="py-2 px-3 font-mono text-[10px]">{{ dept.departmentCode }}</td>
                      <td class="py-2 px-3">{{ dept.patientCount }}</td>
                      <td class="py-2 px-3">{{ dept.bedCount }}</td>
                      <td class="py-2 px-3">{{ dept.occupiedBeds }}</td>
                      <td class="py-2 px-3">
                        <div class="flex items-center gap-2">
                          <div class="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div class="h-full rounded-full transition-all"
                              [class]="dept.occupancyRate >= 90 ? 'bg-destructive' : dept.occupancyRate >= 70 ? 'bg-warning' : 'bg-success'"
                              [style.width.%]="dept.occupancyRate"></div>
                          </div>
                          <span class="text-[10px] text-muted-foreground">{{ dept.occupancyRate }}%</span>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      <!-- Alerts -->
      <div class="bg-card rounded-xl border">
        <div class="p-5 pb-3">
          <h3 class="text-base font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Active Alerts
          </h3>
        </div>
        <div class="px-5 pb-5 space-y-2">
          @for (alert of alerts; track alert.message) {
            <div class="flex items-center gap-3 p-3 rounded-lg"
              [class]="alert.severity === 'critical'
                ? 'bg-destructive/10 border border-destructive/20'
                : 'bg-warning/10 border border-warning/20'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                [class]="alert.severity === 'critical' ? 'text-destructive' : 'text-warning'">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
              <span class="text-sm font-medium flex-1">{{ alert.message }}</span>
              <span class="shrink-0 text-xs px-2 py-0.5 rounded-full border"
                [class]="alert.severity === 'critical'
                  ? 'border-destructive/30 text-destructive'
                  : 'border-warning/30 text-warning'">
                {{ alert.severity }}
              </span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('deptChart') deptChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doctorChart') doctorChartRef!: ElementRef<HTMLCanvasElement>;

  kpis = signal<KpiCard[]>([]);
  stats = signal<DashboardStats | null>(null);
  hasFullDashboard = false;
  isDoctor = false;

  alerts = [
    { message: 'ICU occupancy above threshold', severity: 'critical' as const },
    { message: 'Critical patient waiting for bed assignment', severity: 'critical' as const },
    { message: 'Emergency Department at high capacity', severity: 'warning' as const },
  ];

  constructor(
    private dashboardService: DashboardService,
    private auth: AuthService
  ) {
    this.hasFullDashboard = this.auth.hasPermission('dashboard:full');
    this.isDoctor = this.auth.currentRole() === 'DOCTOR';
  }

  ngOnInit() {
    const source = this.isDoctor
      ? this.dashboardService.getDoctorStats()
      : this.dashboardService.getStats();

    source.subscribe({
      next: (stats) => {
        this.stats.set(stats);
        const iconBed = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>';
        const iconUsers = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
        const iconHeart = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
        const iconActivity = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>';
        const iconDept = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>';

        this.kpis.set([
          { title: this.isDoctor ? 'My Patients' : 'Total Beds', value: this.isDoctor ? stats.totalPatients : stats.totalBeds, icon: this.isDoctor ? iconUsers : iconBed, trend: '+2%', up: true, color: 'text-primary' },
          { title: 'Occupied Beds', value: stats.occupiedBeds, icon: iconUsers, trend: '+5%', up: true, color: 'text-destructive' },
          { title: 'Available Beds', value: stats.availableBeds, icon: iconActivity, trend: '-3%', up: false, color: 'text-success' },
          { title: 'ICU Usage', value: stats.icuUsagePercent + '%', icon: iconHeart, trend: '+8%', up: true, color: 'text-warning' },
          { title: this.isDoctor ? 'Critical' : 'Departments', value: this.isDoctor ? stats.criticalPatients : stats.totalDepartments, icon: iconDept, trend: '0%', up: true, color: 'text-primary' },
        ]);
      },
      error: () => {
        this.kpis.set([
          { title: 'Total Beds', value: 0, icon: '', trend: '0%', up: true, color: 'text-primary' },
          { title: 'Occupied Beds', value: 0, icon: '', trend: '0%', up: true, color: 'text-destructive' },
          { title: 'Available Beds', value: 0, icon: '', trend: '0%', up: false, color: 'text-success' },
          { title: 'ICU Usage', value: '0%', icon: '', trend: '0%', up: true, color: 'text-warning' },
          { title: 'Departments', value: 0, icon: '', trend: '0%', up: true, color: 'text-primary' },
        ]);
      }
    });
  }

  ngAfterViewInit() {
    if (this.hasFullDashboard) {
      setTimeout(() => {
        this.createDeptChart();
        this.createDoctorChart();
      }, 300);
    }
  }

  private createDeptChart() {
    if (!this.deptChartRef || !this.stats()?.departmentStats?.length) return;
    const deptStats = this.stats()!.departmentStats!;
    new Chart(this.deptChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: deptStats.map(d => d.departmentCode),
        datasets: [
          { label: 'Total Beds', data: deptStats.map(d => d.bedCount), backgroundColor: 'hsl(217, 91%, 60%)', borderRadius: 4 },
          { label: 'Occupied', data: deptStats.map(d => d.occupiedBeds), backgroundColor: 'hsl(0, 72%, 51%)', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: 'hsl(214, 32%, 91%)' } } },
      },
    });
  }

  private createDoctorChart() {
    if (!this.doctorChartRef || !this.stats()?.doctorWorkloads?.length) return;
    const workloads = this.stats()!.doctorWorkloads!;
    const colors = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(280, 70%, 55%)'];
    new Chart(this.doctorChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: workloads.map(w => w.doctorName),
        datasets: [{ data: workloads.map(w => w.patientCount), backgroundColor: colors.slice(0, workloads.length), borderWidth: 0 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' } }, cutout: '55%' },
    });
  }
}
