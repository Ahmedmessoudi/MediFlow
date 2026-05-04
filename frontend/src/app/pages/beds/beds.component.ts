import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BedService } from '../../services/bed.service';
import { DepartmentService } from '../../services/department.service';
import { PatientService } from '../../services/patient.service';
import { RoomService } from '../../services/room.service';
import { AuthService } from '../../services/auth.service';
import { Bed } from '../../models/bed.model';
import { Department } from '../../models/department.model';
import { Patient } from '../../models/patient.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-beds',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">Beds Management</h1>
          <p class="text-xs text-muted-foreground">
            {{ canManage ? 'Manage bed assignments' : 'View bed availability' }}
          </p>
        </div>
        @if (canManage) {
          <button (click)="openAddDialog()"
            class="bg-primary text-primary-foreground font-medium py-1.5 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Bed
          </button>
        }
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        <select [(ngModel)]="typeFilter"
          class="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Types</option>
          <option value="ICU">ICU</option>
          <option value="NORMAL">Normal</option>
        </select>
        <select [(ngModel)]="statusFilter"
          class="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
        </select>
        <select [(ngModel)]="departmentFilter"
          class="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Departments</option>
          @for (d of departments(); track d.id) {
            <option [value]="d.id">{{ d.name }}</option>
          }
        </select>
      </div>

      <!-- Bed Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        @for (bed of filteredBeds(); track bed.id) {
          <div class="bg-card rounded-xl border hover:shadow-md transition-all border-l-4 cursor-pointer"
            [class]="bed.status === 'AVAILABLE' ? 'border-l-success' : 'border-l-destructive'"
            (click)="openDetail(bed)">
            <div class="p-3">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm text-foreground">{{ bed.bedNumber }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full border"
                  [class]="bed.type === 'ICU' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'">
                  {{ bed.type }}
                </span>
              </div>

              <div class="flex items-center gap-1.5 mb-2">
                <div class="h-2 w-2 rounded-full"
                  [class]="bed.status === 'AVAILABLE' ? 'bg-success animate-pulse-soft' : 'bg-destructive'"></div>
                <span class="text-xs capitalize text-muted-foreground">{{ bed.status.toLowerCase() }}</span>
              </div>

              @if (getPatientForBed(bed)) {
                <div class="flex items-center gap-1.5 mt-2 pt-2 border-t">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span class="text-xs text-foreground flex-1">{{ getPatientForBed(bed)?.fullName }}</span>
                </div>
              } @else if (bed.status === 'AVAILABLE') {
                <div class="flex items-center gap-1.5 mt-2 pt-2 border-t">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>
                  <span class="text-xs text-success">Ready for assignment</span>
                </div>
              }

              <div class="text-[10px] text-muted-foreground mt-1.5">{{ bed.room?.department?.name || 'N/A' }} — {{ bed.room?.name || '' }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Bed Detail Modal -->
      @if (selectedBed()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="selectedBed.set(null)">
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-md p-5 animate-fade-in" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">Bed Details</h2>
              <button (click)="selectedBed.set(null)" class="p-1 rounded-lg hover:bg-muted transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div class="h-10 w-10 rounded-full flex items-center justify-center"
                  [class]="selectedBed()!.status === 'AVAILABLE' ? 'bg-success/10' : 'bg-destructive/10'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    [class]="selectedBed()!.status === 'AVAILABLE' ? 'text-success' : 'text-destructive'">
                    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-lg">{{ selectedBed()!.bedNumber }}</h3>
                  <div class="flex gap-1.5 mt-0.5">
                    <span class="text-[10px] px-2 py-0.5 rounded-full border"
                      [class]="selectedBed()!.type === 'ICU' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'">
                      {{ selectedBed()!.type }}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full border"
                      [class]="selectedBed()!.status === 'AVAILABLE' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'">
                      {{ selectedBed()!.status }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Room</p>
                  <p class="text-xs font-medium">{{ selectedBed()!.room?.name || 'N/A' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Department</p>
                  <p class="text-xs font-medium">{{ selectedBed()!.room?.department?.name || 'N/A' }}</p>
                </div>
              </div>

              @if (getPatientForBed(selectedBed()!)) {
                <div class="p-3 rounded-lg border bg-muted/30">
                  <p class="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Current Patient</p>
                  <p class="text-sm font-semibold">{{ getPatientForBed(selectedBed()!)!.fullName }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ getPatientForBed(selectedBed()!)!.condition }} ·
                    Age {{ getPatientForBed(selectedBed()!)!.age }}
                  </p>
                </div>
              }

              <button (click)="selectedBed.set(null)"
                class="w-full py-1.5 px-3 rounded-lg border border-input text-xs font-medium hover:bg-muted transition-colors">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Add Bed Dialog -->
      @if (showAddDialog()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeAddDialog()">
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-md p-5 animate-fade-in" (click)="$event.stopPropagation()">
            <h2 class="text-base font-semibold mb-3">Add Bed</h2>
            <form (ngSubmit)="createBed()" class="space-y-3">
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Bed Number *</label>
                <input [(ngModel)]="newBed.bedNumber" name="bedNumber" required placeholder="e.g. A-105"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="text-xs font-medium">Type *</label>
                  <select [(ngModel)]="newBed.type" name="type"
                    class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="NORMAL">Normal</option>
                    <option value="ICU">ICU</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium">Status *</label>
                  <select [(ngModel)]="newBed.status" name="status"
                    class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                  </select>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Department *</label>
                <select [(ngModel)]="newBed.departmentId" name="departmentId" (ngModelChange)="onNewBedDepartmentChange()"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                  <option [ngValue]="null">Select Department</option>
                  @for (d of departments(); track d.id) {
                    <option [ngValue]="d.id">{{ d.name }}</option>
                  }
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Room *</label>
                <select [(ngModel)]="newBed.roomId" name="roomId" [disabled]="!newBed.departmentId"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                  <option [ngValue]="null">Select Room</option>
                  @for (r of getRoomsForDepartment(newBed.departmentId); track r.id) {
                    <option [ngValue]="r.id">{{ r.name }}</option>
                  }
                </select>
                @if (newBed.departmentId && getRoomsForDepartment(newBed.departmentId).length === 0) {
                  <p class="text-[10px] text-muted-foreground">No rooms available for this department.</p>
                }
              </div>
              <div class="flex gap-2 pt-2">
                <button type="button" (click)="closeAddDialog()"
                  class="flex-1 py-1.5 px-3 rounded-lg border border-input text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit"
                  class="flex-1 bg-primary text-primary-foreground py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">Create Bed</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class BedsComponent implements OnInit {
  beds = signal<Bed[]>([]);
  patients = signal<Patient[]>([]);
  departments = signal<Department[]>([]);
  rooms = signal<Room[]>([]);
  selectedBed = signal<Bed | null>(null);
  typeFilter = 'all';
  statusFilter = 'all';
  departmentFilter = 'all';
  canManage = false;
  showAddDialog = signal(false);
  newBed: any = {
    bedNumber: '',
    type: 'NORMAL',
    status: 'AVAILABLE',
    departmentId: null,
    roomId: null,
  };

  constructor(
    private bedService: BedService,
    private departmentService: DepartmentService,
    private patientService: PatientService,
    private roomService: RoomService,
    private auth: AuthService
  ) {
    this.canManage = this.auth.hasPermission('bed:manage');
  }

  ngOnInit() {
    this.loadBeds();
    this.departmentService.getAll().subscribe(depts => this.departments.set(depts));
    this.roomService.getAll().subscribe(rooms => this.rooms.set(rooms));
    this.patientService.getAll().subscribe(patients => this.patients.set(patients));
  }

  loadBeds() {
    this.bedService.getAll().subscribe(beds => this.beds.set(beds));
  }

  filteredBeds() {
    return this.beds().filter(b => {
      if (this.typeFilter !== 'all' && b.type !== this.typeFilter) return false;
      if (this.statusFilter !== 'all' && b.status !== this.statusFilter) return false;
      if (this.departmentFilter !== 'all' && b.room?.department?.id !== +this.departmentFilter) return false;
      return true;
    });
  }

  getPatientForBed(bed: Bed): Patient | undefined {
    return this.patients().find(p => p.bed?.id === bed.id);
  }

  openDetail(bed: Bed) {
    this.selectedBed.set(bed);
  }

  getRoomsForDepartment(departmentId: number | null): Room[] {
    if (!departmentId) return [];
    return this.rooms().filter(r => r.department?.id === departmentId);
  }

  onNewBedDepartmentChange() {
    this.newBed.roomId = null;
  }

  openAddDialog() {
    this.showAddDialog.set(true);
  }

  closeAddDialog() {
    this.showAddDialog.set(false);
    this.newBed = {
      bedNumber: '',
      type: 'NORMAL',
      status: 'AVAILABLE',
      departmentId: null,
      roomId: null,
    };
  }

  createBed() {
    const bedNumber = (this.newBed.bedNumber || '').trim();
    if (!bedNumber || !this.newBed.roomId) {
      alert('Please fill in bed number, department, and room.');
      return;
    }

    const payload: Bed = {
      bedNumber,
      type: this.newBed.type,
      status: this.newBed.status,
      room: { id: this.newBed.roomId } as Room,
    };

    this.bedService.create(payload).subscribe({
      next: () => {
        this.closeAddDialog();
        this.loadBeds();
      },
      error: (err) => alert(err.error?.message || 'Failed to create bed')
    });
  }
}
