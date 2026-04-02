import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BedService } from '../../services/bed.service';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { Bed } from '../../models/bed.model';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-beds',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold">Beds Management</h1>
        <p class="text-sm text-muted-foreground">
          {{ canManage ? 'Manage bed assignments' : 'View bed availability' }}
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        <select [(ngModel)]="typeFilter"
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Types</option>
          <option value="ICU">ICU</option>
          <option value="NORMAL">Normal</option>
        </select>
        <select [(ngModel)]="statusFilter"
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
        </select>
        <select [(ngModel)]="wardFilter"
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Wards</option>
          @for (w of wards(); track w) {
            <option [value]="w">{{ w }}</option>
          }
        </select>
      </div>

      <!-- Bed Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        @for (bed of filteredBeds(); track bed.id) {
          <div class="bg-card rounded-xl border hover:shadow-md transition-all border-l-4"
            [class]="bed.status === 'AVAILABLE' ? 'border-l-success' : 'border-l-destructive'">
            <div class="p-4">
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-foreground">{{ bed.bedNumber }}</span>
                <span class="text-xs px-2 py-1 rounded-full border"
                  [class]="bed.type === 'ICU' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'">
                  {{ bed.type }}
                </span>
              </div>

              <div class="flex items-center gap-2 mb-2">
                <div class="h-2.5 w-2.5 rounded-full"
                  [class]="bed.status === 'AVAILABLE' ? 'bg-success animate-pulse-soft' : 'bg-destructive'"></div>
                <span class="text-sm capitalize text-muted-foreground">{{ bed.status.toLowerCase() }}</span>
              </div>

              @if (getPatientForBed(bed)) {
                <div class="flex items-center gap-2 mt-3 pt-3 border-t">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span class="text-sm text-foreground flex-1">{{ getPatientForBed(bed)?.name }}</span>
                </div>
              } @else if (bed.status === 'AVAILABLE') {
                <div class="flex items-center gap-2 mt-3 pt-3 border-t">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>
                  <span class="text-sm text-success">Ready for assignment</span>
                </div>
              }

              <div class="text-xs text-muted-foreground mt-2">{{ bed.room?.ward || 'N/A' }} — {{ bed.room?.name || '' }}</div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class BedsComponent implements OnInit {
  beds = signal<Bed[]>([]);
  patients = signal<Patient[]>([]);
  wards = signal<string[]>([]);
  typeFilter = 'all';
  statusFilter = 'all';
  wardFilter = 'all';
  canManage = false;

  constructor(
    private bedService: BedService,
    private patientService: PatientService,
    private auth: AuthService
  ) {
    this.canManage = this.auth.hasPermission('bed:manage');
  }

  ngOnInit() {
    this.bedService.getAll().subscribe(beds => {
      this.beds.set(beds);
      const wardSet = new Set(beds.map(b => b.room?.ward).filter(Boolean) as string[]);
      this.wards.set([...wardSet]);
    });
    this.patientService.getAll().subscribe(patients => this.patients.set(patients));
  }

  filteredBeds() {
    return this.beds().filter(b => {
      if (this.typeFilter !== 'all' && b.type !== this.typeFilter) return false;
      if (this.statusFilter !== 'all' && b.status !== this.statusFilter) return false;
      if (this.wardFilter !== 'all' && b.room?.ward !== this.wardFilter) return false;
      return true;
    });
  }

  getPatientForBed(bed: Bed): Patient | undefined {
    return this.patients().find(p => p.bed?.id === bed.id);
  }
}
