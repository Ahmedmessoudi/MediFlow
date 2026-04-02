import { Component, OnInit, signal } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { EquipmentService } from '../../services/equipment.service';
import { BedService } from '../../services/bed.service';
import { Room } from '../../models/room.model';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { Bed } from '../../models/bed.model';

@Component({
  selector: 'app-rooms',
  standalone: true,
  template: `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold">Rooms & Equipment</h1>
        <p class="text-sm text-muted-foreground">Manage hospital resources</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button (click)="activeTab.set('rooms')"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          [class]="activeTab() === 'rooms' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'">
          Rooms
        </button>
        <button (click)="activeTab.set('equipment')"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          [class]="activeTab() === 'equipment' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'">
          Equipment
        </button>
      </div>

      <!-- Rooms Table -->
      @if (activeTab() === 'rooms') {
        <div class="bg-card rounded-xl border overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="text-left py-3 px-4 font-medium text-muted-foreground">Room</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground">Ward</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground">Capacity</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground">Occupied</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground">Availability</th>
              </tr>
            </thead>
            <tbody>
              @for (r of roomsWithOccupancy(); track r.room.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="py-3 px-4 font-medium">{{ r.room.name }}</td>
                  <td class="py-3 px-4">{{ r.room.ward }}</td>
                  <td class="py-3 px-4">{{ r.room.capacity }}</td>
                  <td class="py-3 px-4">{{ r.occupied }}</td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <div class="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div class="h-full rounded-full transition-all"
                          [class]="r.pct >= 90 ? 'bg-destructive' : r.pct >= 70 ? 'bg-warning' : 'bg-success'"
                          [style.width.%]="r.pct">
                        </div>
                      </div>
                      <span class="text-xs text-muted-foreground">{{ r.pct }}%</span>
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
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (eq of equipment(); track eq.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="py-3 px-4 font-medium">{{ eq.name }}</td>
                  <td class="py-3 px-4">{{ eq.type }}</td>
                  <td class="py-3 px-4">
                    <span class="text-xs px-2 py-1 rounded-full border" [class]="statusClass(eq.status)">
                      {{ eq.status === 'IN_USE' ? 'in-use' : 'available' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
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

  constructor(
    private roomService: RoomService,
    private equipmentService: EquipmentService,
    private bedService: BedService
  ) {}

  ngOnInit() {
    this.roomService.getAll().subscribe(r => this.rooms.set(r));
    this.bedService.getAll().subscribe(b => this.beds.set(b));
    this.equipmentService.getAll().subscribe(e => this.equipment.set(e));
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
}
