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
        <h1 class="text-xl font-bold text-foreground">Dashboard</h1>
        <p class="text-muted-foreground text-xs">
          {{ hasFullDashboard ? 'Real-time hospital overview' : 'Limited dashboard view' }}
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
          <!-- Line Chart -->
          <div class="lg:col-span-2 bg-card rounded-xl border p-4 flex flex-col">
            <h3 class="text-sm font-semibold mb-3">Bed Usage Over Time</h3>
            <div class="relative flex-1 min-h-[220px] max-h-[260px] w-full">
              <canvas #lineChart></canvas>
            </div>
          </div>

          <!-- Pie Chart -->
          <div class="bg-card rounded-xl border p-4 flex flex-col">
            <h3 class="text-sm font-semibold mb-3">Bed Distribution</h3>
            <div class="relative flex-1 min-h-[160px] max-h-[200px] w-full">
              <canvas #pieChart></canvas>
            </div>
            <div class="flex flex-wrap gap-2 mt-3 justify-center">
              @for (item of pieLabels; track item.name) {
                <div class="flex items-center gap-1 text-[10px]">
                  <div class="h-2 w-2 rounded-full" [style.backgroundColor]="item.color"></div>
                  {{ item.name }}
                </div>
              }
            </div>
          </div>
        </div>
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
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;

  kpis = signal<KpiCard[]>([]);
  hasFullDashboard = false;

  alerts = [
    { message: 'No ICU beds available in Ward A', severity: 'critical' as const },
    { message: 'Critical patient waiting for bed assignment', severity: 'critical' as const },
    { message: 'Ward B at 95% capacity', severity: 'warning' as const },
  ];

  pieLabels = [
    { name: 'ICU', color: 'hsl(217, 91%, 60%)' },
    { name: 'Normal', color: 'hsl(142, 71%, 45%)' },
    { name: 'Emergency', color: 'hsl(0, 72%, 51%)' },
    { name: 'Pediatric', color: 'hsl(38, 92%, 50%)' },
  ];

  constructor(
    private dashboardService: DashboardService,
    private auth: AuthService
  ) {
    this.hasFullDashboard = this.auth.hasPermission('dashboard:full');
  }

  ngOnInit() {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.kpis.set([
          {
            title: 'Total Beds', value: stats.totalBeds,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>',
            trend: '+2%', up: true, color: 'text-primary'
          },
          {
            title: 'Occupied Beds', value: stats.occupiedBeds,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            trend: '+5%', up: true, color: 'text-destructive'
          },
          {
            title: 'Available Beds', value: stats.availableBeds,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>',
            trend: '-3%', up: false, color: 'text-success'
          },
          {
            title: 'ICU Usage', value: stats.icuUsagePercent + '%',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
            trend: '+8%', up: true, color: 'text-warning'
          },
          {
            title: 'Total Wards', value: stats.totalWards,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
            trend: '0%', up: true, color: 'text-primary'
          },
        ]);
      },
      error: () => {
        // Fallback mock data
        this.kpis.set([
          { title: 'Total Beds', value: 0, icon: '', trend: '0%', up: true, color: 'text-primary' },
          { title: 'Occupied Beds', value: 0, icon: '', trend: '0%', up: true, color: 'text-destructive' },
          { title: 'Available Beds', value: 0, icon: '', trend: '0%', up: false, color: 'text-success' },
          { title: 'ICU Usage', value: '0%', icon: '', trend: '0%', up: true, color: 'text-warning' },
          { title: 'Total Wards', value: 0, icon: '', trend: '0%', up: true, color: 'text-primary' },
        ]);
      }
    });
  }

  ngAfterViewInit() {
    if (this.hasFullDashboard) {
      setTimeout(() => {
        this.createLineChart();
        this.createPieChart();
      }, 100);
    }
  }

  private createLineChart() {
    if (!this.lineChartRef) return;
    new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Occupied',
            data: [170, 180, 175, 190, 185, 187, 192],
            borderColor: 'hsl(0, 72%, 51%)',
            backgroundColor: 'hsla(0, 72%, 51%, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 0,
          },
          {
            label: 'Available',
            data: [80, 70, 75, 60, 65, 63, 58],
            borderColor: 'hsl(142, 71%, 45%)',
            backgroundColor: 'hsla(142, 71%, 45%, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: {
          x: { grid: { color: 'hsl(214, 32%, 91%)' } },
          y: { grid: { color: 'hsl(214, 32%, 91%)' } },
        },
      },
    });
  }

  private createPieChart() {
    if (!this.pieChartRef) return;
    new Chart(this.pieChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['ICU', 'Normal', 'Emergency', 'Pediatric'],
        datasets: [{
          data: [40, 150, 35, 25],
          backgroundColor: [
            'hsl(217, 91%, 60%)',
            'hsl(142, 71%, 45%)',
            'hsl(0, 72%, 51%)',
            'hsl(38, 92%, 50%)',
          ],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '60%',
      },
    });
  }
}
