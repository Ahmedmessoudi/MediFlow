import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { Patient, PatientCondition } from '../../models/patient.model';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">Patients</h1>
          <p class="text-xs text-muted-foreground">Manage patient records</p>
        </div>
        @if (canCreate) {
          <button (click)="showDialog.set(true)"
            class="bg-primary text-primary-foreground font-medium py-1.5 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Patient
          </button>
        }
      </div>

      <!-- Table Card -->
      <div class="bg-card rounded-xl border">
        <div class="p-3 pb-2">
          <div class="relative max-w-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input [(ngModel)]="searchTerm" placeholder="Search patients..."
              class="w-full rounded-lg border border-input bg-background pl-8 pr-2 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Age</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Condition</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Bed</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                <th class="text-right py-2 px-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredPatients(); track p.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="py-2 px-3 font-medium">{{ p.name }}</td>
                  <td class="py-2 px-3">{{ p.age }}</td>
                  <td class="py-2 px-3">
                    <span class="text-[10px] px-2 py-0.5 rounded-full border" [class]="conditionClass(p.condition)">
                      {{ p.condition }}
                    </span>
                  </td>
                  <td class="py-2 px-3">{{ p.bed?.bedNumber || 'Unassigned' }}</td>
                  <td class="py-2 px-3">{{ p.dischargeDate ? 'Discharged' : 'Admitted' }}</td>
                  <td class="py-2 px-3 text-right">
                    <div class="flex items-center justify-end gap-1">
                      @if (canUpdateCondition && p.condition !== 'CRITICAL') {
                        <button (click)="markCritical(p.id!)" title="Mark as Critical"
                          class="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        </button>
                      }
                      @if (canAssignBed && !p.bed && !p.dischargeDate) {
                        <button (click)="allocateBed(p.id!)" title="Assign Bed"
                          class="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>
                        </button>
                      }
                      @if (canDischarge && !p.dischargeDate) {
                        <button (click)="discharge(p.id!)" title="Discharge"
                          class="p-1.5 rounded-lg hover:bg-warning/10 text-warning transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        </button>
                      }
                      @if (canDelete) {
                        <button (click)="deletePatient(p.id!)" title="Delete"
                          class="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Patient Dialog -->
      @if (showDialog()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showDialog.set(false)">
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-md p-5 animate-fade-in" (click)="$event.stopPropagation()">
            <h2 class="text-base font-semibold mb-3">Add New Patient</h2>
            <form (ngSubmit)="addPatient()" class="space-y-3">
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Full Name</label>
                <input [(ngModel)]="newPatient.name" name="name" required placeholder="Patient name"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Age</label>
                <input [(ngModel)]="newPatient.age" name="age" type="number" required placeholder="Age"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Condition</label>
                <select [(ngModel)]="newPatient.condition" name="condition"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="NORMAL">Normal</option>
                  <option value="SERIOUS">Serious</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div class="flex gap-2 pt-2">
                <button type="button" (click)="showDialog.set(false)"
                  class="flex-1 py-1.5 px-3 rounded-lg border border-input text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit"
                  class="flex-1 bg-primary text-primary-foreground py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">Add Patient</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class PatientsComponent implements OnInit {
  patients = signal<Patient[]>([]);
  searchTerm = '';
  showDialog = signal(false);
  newPatient: Patient = { name: '', age: 0, condition: 'NORMAL' };

  canCreate = false;
  canDelete = false;
  canUpdateCondition = false;
  canAssignBed = false;
  canDischarge = false;

  constructor(
    private patientService: PatientService,
    private auth: AuthService
  ) {
    this.canCreate = this.auth.hasPermission('patient:create');
    this.canDelete = this.auth.hasPermission('patient:delete');
    this.canUpdateCondition = this.auth.hasPermission('patient:update_condition');
    this.canAssignBed = this.auth.hasPermission('patient:assign_bed');
    this.canDischarge = this.auth.hasPermission('patient:discharge');
  }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.patientService.getAll().subscribe({
      next: (data) => this.patients.set(data),
      error: () => {}
    });
  }

  filteredPatients() {
    const term = this.searchTerm.toLowerCase();
    return this.patients().filter(p => p.name.toLowerCase().includes(term));
  }

  conditionClass(condition: PatientCondition): string {
    const map: Record<PatientCondition, string> = {
      NORMAL: 'bg-success/15 text-success border-success/30',
      SERIOUS: 'bg-warning/15 text-warning border-warning/30',
      CRITICAL: 'bg-destructive/15 text-destructive border-destructive/30',
    };
    return map[condition] || '';
  }

  addPatient() {
    this.patientService.create(this.newPatient).subscribe({
      next: () => {
        this.showDialog.set(false);
        this.newPatient = { name: '', age: 0, condition: 'NORMAL' };
        this.loadPatients();
      }
    });
  }

  deletePatient(id: number) {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.patientService.delete(id).subscribe(() => this.loadPatients());
    }
  }

  markCritical(id: number) {
    this.patientService.markCritical(id).subscribe(() => this.loadPatients());
  }

  allocateBed(id: number) {
    this.patientService.allocateBed(id).subscribe({
      next: () => this.loadPatients(),
      error: (err) => alert(err.error?.message || 'No beds available!')
    });
  }

  discharge(id: number) {
    this.patientService.discharge(id).subscribe(() => this.loadPatients());
  }
}
