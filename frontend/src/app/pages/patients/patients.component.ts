import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { DepartmentService } from '../../services/department.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Patient, PatientCondition, PatientStatus, PriorityLevel } from '../../models/patient.model';
import { Department } from '../../models/department.model';
import { AiSummaryResponse } from '../../models/ai-summary.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">Patients</h1>
          <p class="text-xs text-muted-foreground">{{ isDoctor ? 'Your assigned patients' : 'Manage patient records' }}</p>
        </div>
        @if (canCreate) {
          <button (click)="showDialog.set(true)"
            class="bg-primary text-primary-foreground font-medium py-1.5 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Patient
          </button>
        }
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative flex-1 max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input [(ngModel)]="searchTerm" placeholder="Search patients..."
            class="w-full rounded-lg border border-input bg-background pl-8 pr-2 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select [(ngModel)]="departmentFilter"
          class="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Departments</option>
          @for (d of departments(); track d.id) {
            <option [value]="d.id">{{ d.code }}</option>
          }
        </select>
        <select [(ngModel)]="statusFilter"
          class="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs w-36 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Status</option>
          <option value="ADMITTED">Admitted</option>
          <option value="UNDER_TREATMENT">Under Treatment</option>
          <option value="DISCHARGED">Discharged</option>
        </select>
      </div>

      <!-- Table Card -->
      <div class="bg-card rounded-xl border">
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Age</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Condition</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Priority</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Department</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Doctor</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Bed</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                <th class="text-right py-2 px-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredPatients(); track p.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors cursor-pointer" (click)="openDetail(p)">
                  <td class="py-2 px-3 font-medium">{{ p.fullName }}</td>
                  <td class="py-2 px-3">{{ p.age }}</td>
                  <td class="py-2 px-3">
                    <span class="text-[10px] px-2 py-0.5 rounded-full border" [class]="conditionClass(p.condition)">
                      {{ p.condition }}
                    </span>
                  </td>
                  <td class="py-2 px-3">
                    <span class="text-[10px] px-2 py-0.5 rounded-full border" [class]="priorityClass(p.priorityLevel)">
                      {{ p.priorityLevel || 'MEDIUM' }}
                    </span>
                  </td>
                  <td class="py-2 px-3">
                    <span class="text-[10px] font-mono">{{ p.department?.code || '—' }}</span>
                  </td>
                  <td class="py-2 px-3 text-muted-foreground">{{ p.assignedDoctor?.fullName || '—' }}</td>
                  <td class="py-2 px-3">{{ p.bed?.bedNumber || 'Unassigned' }}</td>
                  <td class="py-2 px-3">
                    <span class="text-[10px] px-2 py-0.5 rounded-full border" [class]="statusClass(p.status)">
                      {{ formatStatus(p.status) }}
                    </span>
                  </td>
                  <td class="py-2 px-3 text-right" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-end gap-1">
                      @if (canUpdateCondition && p.condition !== 'CRITICAL') {
                        <button (click)="markCritical(p.id!)" title="Mark as Critical"
                          class="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        </button>
                      }
                      @if (canAssignBed && !p.bed && p.status !== 'DISCHARGED') {
                        <button (click)="allocateBed(p.id!)" title="Assign Bed"
                          class="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>
                        </button>
                      }
                      @if (canDischarge && p.status !== 'DISCHARGED') {
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
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <h2 class="text-base font-semibold mb-3">Add New Patient</h2>
            <form (ngSubmit)="addPatient()" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="col-span-2 space-y-1.5">
                  <label class="text-xs font-medium">Full Name *</label>
                  <input [(ngModel)]="newPatient.fullName" name="fullName" required placeholder="Patient name"
                    class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium">Age *</label>
                  <input [(ngModel)]="newPatient.age" name="age" type="number" required placeholder="Age"
                    class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium">Condition *</label>
                  <select [(ngModel)]="newPatient.condition" name="condition"
                    class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="NORMAL">Normal</option>
                    <option value="SERIOUS">Serious</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium">Priority Level</label>
                  <select [(ngModel)]="newPatient.priorityLevel" name="priorityLevel"
                    class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium">Department</label>
                  <select [(ngModel)]="newPatient.departmentId" name="departmentId"
                    class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                    <option [ngValue]="null">Select Department</option>
                    @for (d of departments(); track d.id) {
                      <option [ngValue]="d.id">{{ d.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-span-2 space-y-1.5">
                  <label class="text-xs font-medium">Assigned Doctor</label>
                  <select [(ngModel)]="newPatient.assignedDoctorId" name="assignedDoctorId"
                    class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                    <option [ngValue]="null">Select Doctor</option>
                    @for (doc of doctors(); track doc.id) {
                      <option [ngValue]="doc.id">{{ doc.fullName }}</option>
                    }
                  </select>
                </div>
                <div class="col-span-2 space-y-1.5">
                  <label class="text-xs font-medium">Medical Notes</label>
                  <textarea [(ngModel)]="newPatient.medicalNotes" name="medicalNotes" rows="2" placeholder="Notes..."
                    class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
                </div>
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

      <!-- Patient Detail Modal -->
      @if (selectedPatient()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="selectedPatient.set(null)">
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-2xl p-5 animate-fade-in max-h-[85vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">Patient Details</h2>
              <button (click)="selectedPatient.set(null)" class="p-1 rounded-lg hover:bg-muted transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <h3 class="font-semibold">{{ selectedPatient()!.fullName }}</h3>
                  <p class="text-xs text-muted-foreground">Age: {{ selectedPatient()!.age }} · {{ selectedPatient()!.gender || 'N/A' }}</p>
                </div>
                <div class="ml-auto flex gap-1.5">
                  <span class="text-[10px] px-2 py-0.5 rounded-full border" [class]="conditionClass(selectedPatient()!.condition)">{{ selectedPatient()!.condition }}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full border" [class]="priorityClass(selectedPatient()!.priorityLevel)">{{ selectedPatient()!.priorityLevel || 'MEDIUM' }}</span>
                </div>
              </div>

              <div class="space-y-1">
                <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Department</p>
                <p class="text-xs font-medium">{{ selectedPatient()!.department?.name || 'Not assigned' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Assigned Doctor</p>
                <p class="text-xs font-medium">{{ selectedPatient()!.assignedDoctor?.fullName || 'Not assigned' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Bed</p>
                <p class="text-xs font-medium">{{ selectedPatient()!.bed?.bedNumber || 'Unassigned' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                <p class="text-xs font-medium">{{ formatStatus(selectedPatient()!.status) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Admission Date</p>
                <p class="text-xs font-medium">{{ selectedPatient()!.admissionDate | date:'medium' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</p>
                <p class="text-xs font-medium">{{ selectedPatient()!.phone || 'N/A' }}</p>
              </div>

              @if (selectedPatient()!.medicalNotes) {
                <div class="col-span-2 space-y-1">
                  <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Medical Notes</p>
                  <div class="text-xs bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">{{ selectedPatient()!.medicalNotes }}</div>
                </div>
              }
            </div>

            <div class="flex gap-2 pt-4 mt-4 border-t">
              <button (click)="generateAiSummary(selectedPatient()!.id!)"
                class="flex-1 py-1.5 px-3 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                🤖 AI Summary
              </button>
              <button (click)="selectedPatient.set(null)"
                class="flex-1 py-1.5 px-3 rounded-lg border border-input text-xs font-medium hover:bg-muted transition-colors">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- AI Summary Modal -->
      @if (showAiSummary()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showAiSummary.set(false)">
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-2xl p-5 animate-fade-in max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
            @if (aiSummary()) {
              <div class="space-y-4">
                <div>
                  <h2 class="text-lg font-semibold">AI Clinical Summary</h2>
                  <p class="text-xs text-muted-foreground">{{ aiSummary()?.patientName }}</p>
                </div>
                <div class="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div>
                    <h3 class="text-xs font-semibold text-primary mb-2">Clinical Summary</h3>
                    <p class="text-xs text-foreground leading-relaxed">{{ aiSummary()?.clinicalSummary }}</p>
                  </div>
                  <div>
                    <h3 class="text-xs font-semibold text-primary mb-2">Recommendations</h3>
                    <div class="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{{ aiSummary()?.recommendations }}</div>
                  </div>
                  <div class="pt-2 border-t border-border">
                    <p class="text-[10px] text-muted-foreground">Generated: {{ aiSummary()?.generatedAt }}</p>
                  </div>
                </div>
                <button (click)="showAiSummary.set(false)"
                  class="w-full py-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">Close</button>
              </div>
            } @else {
              <div class="flex items-center justify-center py-8">
                <div class="text-center">
                  <div class="inline-block animate-spin">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                  </div>
                  <p class="text-xs text-muted-foreground mt-3">Generating AI summary...</p>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class PatientsComponent implements OnInit {
  patients = signal<Patient[]>([]);
  departments = signal<Department[]>([]);
  doctors = signal<any[]>([]);
  searchTerm = '';
  departmentFilter = 'all';
  statusFilter = 'all';
  showDialog = signal(false);
  showAiSummary = signal(false);
  aiSummary = signal<AiSummaryResponse | null>(null);
  selectedPatient = signal<Patient | null>(null);
  newPatient: any = { fullName: '', age: 0, condition: 'NORMAL', priorityLevel: 'MEDIUM', departmentId: null, assignedDoctorId: null, medicalNotes: '' };

  canCreate = false;
  canDelete = false;
  canUpdateCondition = false;
  canAssignBed = false;
  canDischarge = false;
  isDoctor = false;

  constructor(
    private patientService: PatientService,
    private departmentService: DepartmentService,
    private userService: UserService,
    private auth: AuthService
  ) {
    this.canCreate = this.auth.hasPermission('patient:create');
    this.canDelete = this.auth.hasPermission('patient:delete');
    this.canUpdateCondition = this.auth.hasPermission('patient:update_condition');
    this.canAssignBed = this.auth.hasPermission('patient:assign_bed');
    this.canDischarge = this.auth.hasPermission('patient:discharge');
    this.isDoctor = this.auth.currentRole() === 'DOCTOR';
  }

  ngOnInit() {
    this.loadPatients();
    this.departmentService.getAll().subscribe({ next: (d) => this.departments.set(d), error: () => {} });
    this.userService.getAll().subscribe({
      next: (users) => this.doctors.set(users.filter((u: any) => u.role === 'DOCTOR')),
      error: () => {}
    });
  }

  loadPatients() {
    const source = this.isDoctor ? this.patientService.getMyPatients() : this.patientService.getAll();
    source.subscribe({ next: (data) => this.patients.set(data), error: () => {} });
  }

  filteredPatients() {
    return this.patients().filter(p => {
      const term = this.searchTerm.toLowerCase();
      if (term && !p.fullName?.toLowerCase().includes(term)) return false;
      if (this.departmentFilter !== 'all' && p.department?.id !== +this.departmentFilter) return false;
      if (this.statusFilter !== 'all' && p.status !== this.statusFilter) return false;
      return true;
    });
  }

  conditionClass(condition: PatientCondition): string {
    const map: Record<PatientCondition, string> = {
      NORMAL: 'bg-success/15 text-success border-success/30',
      SERIOUS: 'bg-warning/15 text-warning border-warning/30',
      CRITICAL: 'bg-destructive/15 text-destructive border-destructive/30',
    };
    return map[condition] || '';
  }

  priorityClass(priority?: PriorityLevel): string {
    const map: Record<string, string> = {
      LOW: 'bg-muted text-muted-foreground border-border',
      MEDIUM: 'bg-primary/10 text-primary border-primary/20',
      HIGH: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return map[priority || 'MEDIUM'] || '';
  }

  statusClass(status?: PatientStatus): string {
    const map: Record<string, string> = {
      ADMITTED: 'bg-primary/10 text-primary border-primary/20',
      UNDER_TREATMENT: 'bg-warning/10 text-warning border-warning/20',
      DISCHARGED: 'bg-muted text-muted-foreground border-border',
    };
    return map[status || 'ADMITTED'] || '';
  }

  formatStatus(status?: PatientStatus): string {
    const map: Record<string, string> = { ADMITTED: 'Admitted', UNDER_TREATMENT: 'Under Treatment', DISCHARGED: 'Discharged' };
    return map[status || 'ADMITTED'] || status || 'Admitted';
  }

  openDetail(patient: Patient) {
    this.selectedPatient.set(patient);
  }

  addPatient() {
    this.patientService.create(this.newPatient).subscribe({
      next: () => {
        this.showDialog.set(false);
        this.newPatient = { fullName: '', age: 0, condition: 'NORMAL', priorityLevel: 'MEDIUM', departmentId: null, assignedDoctorId: null, medicalNotes: '' };
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
    this.patientService.updateCondition(id, 'CRITICAL').subscribe(() => this.loadPatients());
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

  generateAiSummary(id: number) {
    this.showAiSummary.set(true);
    this.aiSummary.set(null);
    this.patientService.getAiSummary(id).subscribe({
      next: (data) => this.aiSummary.set(data),
      error: () => { alert('Failed to generate AI summary.'); this.showAiSummary.set(false); }
    });
  }
}
