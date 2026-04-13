import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { EquipmentService } from '../../services/equipment.service';
import { BedService } from '../../services/bed.service';
import { DepartmentService } from '../../services/department.service';
import { AuthService } from '../../services/auth.service';
import { Room } from '../../models/room.model';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { Bed } from '../../models/bed.model';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">Rooms & Equipment</h1>
          <p class="text-xs text-muted-foreground">Manage hospital resources</p>
        </div>
        @if (canManageRooms && activeTab() === 'rooms') {
          <button (click)="showRoomDialog.set(true)"
            class="bg-primary text-primary-foreground font-medium py-1.5 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Room
          </button>
        }
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button (click)="activeTab.set('rooms')"
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          [class]="activeTab() === 'rooms' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'">
          Rooms
        </button>
        <button (click)="activeTab.set('equipment')"
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          [class]="activeTab() === 'equipment' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'">
          Equipment
        </button>
      </div>

      <!-- Rooms Table -->
      @if (activeTab() === 'rooms') {
        <div class="bg-card rounded-xl border overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Room</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Department</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Capacity</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Occupied</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Available</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Occupancy</th>
              </tr>
            </thead>
            <tbody>
              @for (r of roomsWithOccupancy(); track r.room.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="py-2 px-3 font-medium">{{ r.room.name }}</td>
                  <td class="py-2 px-3">
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {{ r.room.department?.code || 'N/A' }}
                    </span>
                  </td>
                  <td class="py-2 px-3">{{ r.room.capacity }}</td>
                  <td class="py-2 px-3">{{ r.occupied }}</td>
                  <td class="py-2 px-3 text-success font-medium">{{ r.room.capacity - r.occupied }}</td>
                  <td class="py-2 px-3">
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div class="h-full rounded-full transition-all"
                          [class]="r.pct >= 90 ? 'bg-destructive' : r.pct >= 70 ? 'bg-warning' : 'bg-success'"
                          [style.width.%]="r.pct">
                        </div>
                      </div>
                      <span class="text-[10px] text-muted-foreground">{{ r.pct }}%</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Equipment Table -->
      @if (activeTab() === 'equipment') {
        <div class="bg-card rounded-xl border overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Type</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Room</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (eq of equipment(); track eq.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="py-2 px-3 font-medium">{{ eq.name }}</td>
                  <td class="py-2 px-3">{{ eq.type }}</td>
                  <td class="py-2 px-3 text-muted-foreground">{{ eq.room?.name || 'Unassigned' }}</td>
                  <td class="py-2 px-3">
                    <span class="text-[10px] px-2 py-0.5 rounded-full border" [class]="statusClass(eq.status)">
                      {{ eq.status === 'IN_USE' ? 'in-use' : 'available' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Add Room Dialog -->
      @if (showRoomDialog()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showRoomDialog.set(false)">
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-md p-5 animate-fade-in" (click)="$event.stopPropagation()">
            <h2 class="text-base font-semibold mb-3">Add New Room</h2>
            <form (ngSubmit)="addRoom()" class="space-y-3">
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Room Name</label>
                <input [(ngModel)]="newRoom.name" name="name" required placeholder="e.g. Room 401"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Department</label>
                <select [(ngModel)]="newRoom.departmentId" name="departmentId" required
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                  <option [ngValue]="null">Select Department</option>
                  @for (d of departments(); track d.id) {
                    <option [ngValue]="d.id">{{ d.name }}</option>
                  }
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Capacity</label>
                <input [(ngModel)]="newRoom.capacity" name="capacity" type="number" min="1" required placeholder="Max beds"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="flex gap-2 pt-2">
                <button type="button" (click)="showRoomDialog.set(false)"
                  class="flex-1 py-1.5 px-3 rounded-lg border border-input text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit"
                  class="flex-1 bg-primary text-primary-foreground py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">Add Room</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class RoomsComponent implements OnInit {
  activeTab = signal<'rooms' | 'equipment'>('rooms');
  rooms = signal<Room[]>([]);
  beds = signal<Bed[]>([]);
  equipment = signal<Equipment[]>([]);
  departments = signal<Department[]>([]);
  showRoomDialog = signal(false);
  newRoom: any = { name: '', departmentId: null, capacity: 1 };
  canManageRooms = false;

  constructor(
    private roomService: RoomService,
    private equipmentService: EquipmentService,
    private bedService: BedService,
    private departmentService: DepartmentService,
    private auth: AuthService
  ) {
    this.canManageRooms = this.auth.hasPermission('room:manage');
  }

  ngOnInit() {
    this.roomService.getAll().subscribe(r => this.rooms.set(r));
    this.bedService.getAll().subscribe(b => this.beds.set(b));
    this.equipmentService.getAll().subscribe(e => this.equipment.set(e));
    this.departmentService.getAll().subscribe(d => this.departments.set(d));
  }

  roomsWithOccupancy() {
    return this.rooms().map(room => {
      const roomBeds = this.beds().filter(b => b.room?.id === room.id);
      const occupied = roomBeds.filter(b => b.status === 'OCCUPIED').length;
      const pct = room.capacity > 0 ? Math.round((occupied / room.capacity) * 100) : 0;
      return { room, occupied, pct };
    });
  }

  statusClass(status: EquipmentStatus): string {
    return status === 'IN_USE'
      ? 'bg-destructive/15 text-destructive border-destructive/30'
      : 'bg-success/15 text-success border-success/30';
  }

  addRoom() {
    const room = {
      name: this.newRoom.name,
      capacity: this.newRoom.capacity,
      department: { id: this.newRoom.departmentId }
    };
    this.roomService.create(room as any).subscribe({
      next: () => {
        this.showRoomDialog.set(false);
        this.newRoom = { name: '', departmentId: null, capacity: 1 };
        this.roomService.getAll().subscribe(r => this.rooms.set(r));
      }
    });
  }
}
