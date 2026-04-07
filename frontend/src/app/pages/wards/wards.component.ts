import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WardService } from '../../services/ward.service';
import { RoomService } from '../../services/room.service';
import { BedService } from '../../services/bed.service';
import { EquipmentService } from '../../services/equipment.service';
import { Ward } from '../../models/ward.model';
import { Room } from '../../models/room.model';
import { Bed } from '../../models/bed.model';
import { Equipment } from '../../models/equipment.model';

@Component({
  selector: 'app-wards',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">Wards Management</h1>
          <p class="text-xs text-muted-foreground">Manage hospital hierarchy: Wards → Rooms → Beds</p>
        </div>
        <button (click)="openAddDialog()"
          class="bg-primary text-primary-foreground font-medium py-1.5 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add {{ getEntityName() }}
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button (click)="activeTab.set('wards')"
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          [class]="activeTab() === 'wards' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'">
          Wards
        </button>
        <button (click)="activeTab.set('rooms')"
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          [class]="activeTab() === 'rooms' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'">
          Rooms
        </button>
        <button (click)="activeTab.set('beds')"
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          [class]="activeTab() === 'beds' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'">
          Beds
        </button>
        <button (click)="activeTab.set('equipment')"
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          [class]="activeTab() === 'equipment' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'">
          Equipment
        </button>
      </div>

      <!-- Dynamic Table based on Active Tab -->
      <div class="bg-card rounded-xl border">

        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-muted/50 border-b">
                @for (header of getHeaders(); track header) {
                  <th class="py-2 px-3 font-medium text-muted-foreground"
                      [class.text-right]="header === 'Actions'"
                      [class.text-left]="header !== 'Actions'">
                    {{ header }}
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              <!-- Wards -->
              @if (activeTab() === 'wards') {
                @for (w of wards(); track w.id) {
                  <tr class="border-b hover:bg-muted/50 transition-colors">
                    <td class="py-2 px-3 font-medium">{{ w.name }}</td>
                    <td class="py-2 px-3 text-muted-foreground truncate max-w-xs">{{ w.description || '-' }}</td>
                    <td class="py-2 px-3">
                      <div class="flex items-center justify-end gap-1">
                        <button (click)="editWard(w)" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button (click)="deleteWard(w.id!)" class="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }

              <!-- Rooms -->
              @if (activeTab() === 'rooms') {
                @for (r of rooms(); track r.id) {
                  <tr class="border-b hover:bg-muted/50 transition-colors">
                    <td class="py-2 px-3 font-medium">{{ r.name }}</td>
                    <td class="py-2 px-3">{{ r.ward?.name || 'Unassigned' }}</td>
                    <td class="py-2 px-3">{{ r.capacity }}</td>
                    <td class="py-2 px-3">
                      <div class="flex items-center justify-end gap-1">
                        <button (click)="editRoom(r)" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button (click)="deleteRoom(r.id!)" class="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }

              <!-- Beds -->
              @if (activeTab() === 'beds') {
                @for (b of beds(); track b.id) {
                  <tr class="border-b hover:bg-muted/50 transition-colors">
                    <td class="py-2 px-3 font-medium">{{ b.bedNumber }}</td>
                    <td class="py-2 px-3">{{ b.type }}</td>
                    <td class="py-2 px-3">
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full border"
                        [class]="b.status === 'AVAILABLE' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'">
                        {{ b.status }}
                      </span>
                    </td>
                    <td class="py-2 px-3">{{ b.room?.name || 'Unassigned' }}</td>
                    <td class="py-2 px-3">
                      <div class="flex items-center justify-end gap-1">
                        <button (click)="editBed(b)" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button (click)="deleteBed(b.id!)" class="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }

              <!-- Equipment -->
              @if (activeTab() === 'equipment') {
                @for (e of equipment(); track e.id) {
                  <tr class="border-b hover:bg-muted/50 transition-colors">
                    <td class="py-2 px-3 font-medium">{{ e.name }}</td>
                    <td class="py-2 px-3">{{ e.type }}</td>
                    <td class="py-2 px-3">
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full border"
                        [class]="e.status === 'AVAILABLE' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'">
                        {{ e.status }}
                      </span>
                    </td>
                    <td class="py-2 px-3">{{ e.ward?.name || '-' }}</td>
                    <td class="py-2 px-3">{{ e.room?.name || '-' }}</td>
                    <td class="py-2 px-3">
                      <div class="flex items-center justify-end gap-1">
                        <button (click)="editEquipment(e)" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button (click)="deleteEquipment(e.id!)" class="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
          
          <!-- Empty State -->
          @if (getCurrentArrayLength() === 0) {
            <div class="py-8 text-center text-muted-foreground text-xs">
              No {{ activeTab() }} found.
            </div>
          }
        </div>
      </div>

      <!-- Add/Edit Dialog -->
      @if (showDialog()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeDialog()">
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-md p-5 animate-fade-in" (click)="$event.stopPropagation()">
            <h2 class="text-base font-semibold mb-3">{{ isEditing ? 'Edit' : 'Add' }} {{ getEntityName() }}</h2>
            
            <form (ngSubmit)="submitDialog()" class="space-y-3">
              
              <!-- WARD FORM -->
              @if (activeTab() === 'wards') {
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-muted-foreground uppercase">Ward Name</label>
                  <input [(ngModel)]="wardForm.name" name="name" required
                    class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-muted-foreground uppercase">Description</label>
                  <textarea [(ngModel)]="wardForm.description" name="desc"
                    class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring rows-2"></textarea>
                </div>
              }

              <!-- ROOM FORM -->
              @if (activeTab() === 'rooms') {
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-muted-foreground uppercase">Room Name</label>
                  <input [(ngModel)]="roomForm.name" name="name" required
                    class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-muted-foreground uppercase">Ward</label>
                  <select [(ngModel)]="roomForm.wardId" name="wardId" required
                    class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring">
                    <option [ngValue]="null">Select Ward...</option>
                    @for (w of wards(); track w.id) {
                      <option [ngValue]="w.id">{{ w.name }}</option>
                    }
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-muted-foreground uppercase">Capacity</label>
                  <input [(ngModel)]="roomForm.capacity" name="capacity" type="number" required min="1"
                    class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring" />
                </div>
              }

              <!-- BED FORM -->
              @if (activeTab() === 'beds') {
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-muted-foreground uppercase">Bed Number</label>
                  <input [(ngModel)]="bedForm.bedNumber" name="bedNumber" required
                    class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-muted-foreground uppercase">Type</label>
                    <select [(ngModel)]="bedForm.type" name="type" required
                      class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring">
                      <option value="NORMAL">NORMAL</option>
                      <option value="ICU">ICU</option>
                    </select>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-muted-foreground uppercase">Status</label>
                    <select [(ngModel)]="bedForm.status" name="status" required
                      class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring">
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="OCCUPIED">OCCUPIED</option>
                    </select>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-muted-foreground uppercase">Room</label>
                  <select [(ngModel)]="bedForm.roomId" name="roomId" required
                    class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring">
                    <option [ngValue]="null">Select Room...</option>
                    @for (r of rooms(); track r.id) {
                      <option [ngValue]="r.id">{{ r.name }} ({{ r.ward?.name }})</option>
                    }
                  </select>
                </div>
              }

              <!-- EQUIPMENT FORM -->
              @if (activeTab() === 'equipment') {
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-muted-foreground uppercase">Name</label>
                  <input [(ngModel)]="eqForm.name" name="name" required
                    class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-muted-foreground uppercase">Type</label>
                    <input [(ngModel)]="eqForm.type" name="type" required
                      class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-muted-foreground uppercase">Status</label>
                    <select [(ngModel)]="eqForm.status" name="status" required
                      class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring">
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="IN_USE">IN_USE</option>
                    </select>
                  </div>
                </div>
                
                <p class="text-[10px] text-muted-foreground pt-1">Link to Ward OR Room (optional):</p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-muted-foreground uppercase">Ward</label>
                    <select [(ngModel)]="eqForm.wardId" name="wardId"
                      class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring">
                      <option [ngValue]="null">None</option>
                      @for (w of wards(); track w.id) {
                        <option [ngValue]="w.id">{{ w.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-muted-foreground uppercase">Room</label>
                    <select [(ngModel)]="eqForm.roomId" name="roomId"
                      class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-ring">
                      <option [ngValue]="null">None</option>
                      @for (r of rooms(); track r.id) {
                        <option [ngValue]="r.id">{{ r.name }}</option>
                      }
                    </select>
                  </div>
                </div>
              }

              <!-- Actions -->
              <div class="flex gap-2 pt-3">
                <button type="button" (click)="closeDialog()"
                  class="flex-1 py-1.5 px-3 rounded-md border border-input text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit"
                  class="flex-1 bg-primary text-primary-foreground py-1.5 px-3 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class WardsComponent implements OnInit {
  activeTab = signal<'wards' | 'rooms' | 'beds' | 'equipment'>('wards');
  showDialog = signal(false);
  isEditing = false;
  editingId: number | null = null;

  wards = signal<Ward[]>([]);
  rooms = signal<Room[]>([]);
  beds = signal<Bed[]>([]);
  equipment = signal<Equipment[]>([]);

  // Forms state
  wardForm: Partial<Ward> = { name: '', description: '' };
  roomForm: { name: string; capacity: number; wardId: number | null } = { name: '', capacity: 1, wardId: null };
  bedForm: { bedNumber: string; type: any; status: any; roomId: number | null } = { bedNumber: '', type: 'NORMAL', status: 'AVAILABLE', roomId: null };
  eqForm: { name: string; type: string; status: any; wardId: number | null; roomId: number | null } = { name: '', type: '', status: 'AVAILABLE', wardId: null, roomId: null };

  constructor(
    private wardService: WardService,
    private roomService: RoomService,
    private bedService: BedService,
    private equipmentService: EquipmentService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.wardService.getAll().subscribe(data => this.wards.set(data));
    this.roomService.getAll().subscribe(data => this.rooms.set(data));
    this.bedService.getAll().subscribe(data => this.beds.set(data));
    this.equipmentService.getAll().subscribe(data => this.equipment.set(data));
  }

  getHeaders(): string[] {
    switch (this.activeTab()) {
      case 'wards': return ['Wards', 'Description', 'Actions'];
      case 'rooms': return ['Room', 'Ward', 'Capacity', 'Actions'];
      case 'beds': return ['Bed Number', 'Type', 'Status', 'Room', 'Actions'];
      case 'equipment': return ['Name', 'Type', 'Status', 'Linked Ward', 'Linked Room', 'Actions'];
    }
  }

  getEntityName(): string {
    const tab = this.activeTab();
    return tab.charAt(0).toUpperCase() + tab.slice(1, tab.length - (tab === 'equipment' ? 0 : 1));
  }

  getCurrentArrayLength(): number {
    switch (this.activeTab()) {
      case 'wards': return this.wards().length;
      case 'rooms': return this.rooms().length;
      case 'beds': return this.beds().length;
      case 'equipment': return this.equipment().length;
    }
  }

  openAddDialog() {
    this.isEditing = false;
    this.editingId = null;
    this.resetForms();
    this.showDialog.set(true);
  }

  closeDialog() {
    this.showDialog.set(false);
  }

  resetForms() {
    this.wardForm = { name: '', description: '' };
    this.roomForm = { name: '', capacity: 1, wardId: null };
    this.bedForm = { bedNumber: '', type: 'NORMAL', status: 'AVAILABLE', roomId: null };
    this.eqForm = { name: '', type: '', status: 'AVAILABLE', wardId: null, roomId: null };
  }

  /* --- WARD ACTIONS --- */
  editWard(item: Ward) {
    this.isEditing = true;
    this.editingId = item.id!;
    this.wardForm = { name: item.name, description: item.description };
    this.showDialog.set(true);
  }
  deleteWard(id: number) {
    if (confirm('Are you sure you want to delete this ward?')) {
      this.wardService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert(err.error?.message || 'Cannot delete ward.')
      });
    }
  }

  /* --- ROOM ACTIONS --- */
  editRoom(item: Room) {
    this.isEditing = true;
    this.editingId = item.id!;
    this.roomForm = { name: item.name, capacity: item.capacity, wardId: item.ward?.id || null };
    this.showDialog.set(true);
  }
  deleteRoom(id: number) {
    if (confirm('Delete this room?')) {
      this.roomService.delete(id).subscribe(() => this.loadData());
    }
  }

  /* --- BED ACTIONS --- */
  editBed(item: Bed) {
    this.isEditing = true;
    this.editingId = item.id!;
    this.bedForm = { bedNumber: item.bedNumber, type: item.type, status: item.status, roomId: item.room?.id || null };
    this.showDialog.set(true);
  }
  deleteBed(id: number) {
    if (confirm('Delete this bed?')) {
      this.bedService.delete(id).subscribe(() => this.loadData());
    }
  }

  /* --- EQUIPMENT ACTIONS --- */
  editEquipment(item: Equipment) {
    this.isEditing = true;
    this.editingId = item.id!;
    this.eqForm = { name: item.name, type: item.type, status: item.status, wardId: item.ward?.id || null, roomId: item.room?.id || null };
    this.showDialog.set(true);
  }
  deleteEquipment(id: number) {
    if (confirm('Delete this equipment?')) {
      this.equipmentService.delete(id).subscribe(() => this.loadData());
    }
  }

  /* --- SUBMIT --- */
  submitDialog() {
    const tab = this.activeTab();
    let obs$: any;

    if (tab === 'wards') {
      const payload = this.wardForm as Ward;
      obs$ = this.isEditing ? this.wardService.update(this.editingId!, payload) : this.wardService.create(payload);
    } else if (tab === 'rooms') {
      const payload: Room = { 
        name: this.roomForm.name, 
        capacity: this.roomForm.capacity, 
        ward: this.roomForm.wardId ? { id: this.roomForm.wardId } : null 
      };
      obs$ = this.isEditing ? this.roomService.update(this.editingId!, payload) : this.roomService.create(payload);
    } else if (tab === 'beds') {
      const payload: Bed = {
        bedNumber: this.bedForm.bedNumber,
        type: this.bedForm.type,
        status: this.bedForm.status,
        room: this.bedForm.roomId ? { id: this.bedForm.roomId } as Room : null
      };
      obs$ = this.isEditing ? this.bedService.update(this.editingId!, payload) : this.bedService.create(payload);
    } else if (tab === 'equipment') {
      const payload: Equipment = {
        name: this.eqForm.name,
        type: this.eqForm.type,
        status: this.eqForm.status,
        ward: this.eqForm.wardId ? { id: this.eqForm.wardId } : null,
        room: this.eqForm.roomId ? { id: this.eqForm.roomId } : null
      };
      obs$ = this.isEditing ? this.equipmentService.update(this.editingId!, payload) : this.equipmentService.create(payload);
    }

    if (obs$) {
      obs$.subscribe({
        next: () => {
          this.closeDialog();
          this.loadData();
        },
        error: (err: any) => alert(err.error?.message || 'An error occurred')
      });
    }
  }
}
