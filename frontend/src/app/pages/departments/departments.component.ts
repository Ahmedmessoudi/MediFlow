import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../services/department.service';
import { AuthService } from '../../services/auth.service';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">Departments</h1>
          <p class="text-xs text-muted-foreground">Manage hospital departments</p>
        </div>
        @if (canManage) {
          <button (click)="showDialog.set(true)"
            class="bg-primary text-primary-foreground font-medium py-1.5 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Department
          </button>
        }
      </div>

      <!-- Department Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        @for (dept of departments(); track dept.id) {
          <div class="bg-card rounded-xl border hover:shadow-md transition-all p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono font-bold">
                {{ dept.code }}
              </span>
              @if (canManage) {
                <div class="flex gap-1">
                  <button (click)="editDepartment(dept)" class="p-1 rounded hover:bg-muted transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                  <button (click)="deleteDepartment(dept.id!)" class="p-1 rounded hover:bg-destructive/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              }
            </div>
            <h3 class="font-semibold text-sm text-foreground">{{ dept.name }}</h3>
            <p class="text-xs text-muted-foreground mt-1 line-clamp-2">{{ dept.description || 'No description' }}</p>
          </div>
        }
      </div>

      @if (departments().length === 0) {
        <div class="text-center py-12 text-muted-foreground text-sm">No departments found</div>
      }

      <!-- Add/Edit Dialog -->
      @if (showDialog()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeDialog()">
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-md p-5 animate-fade-in" (click)="$event.stopPropagation()">
            <h2 class="text-base font-semibold mb-3">{{ editingId ? 'Edit' : 'Add' }} Department</h2>
            <form (ngSubmit)="saveDepartment()" class="space-y-3">
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Name</label>
                <input [(ngModel)]="form.name" name="name" required placeholder="e.g. Cardiology Department"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Code</label>
                <input [(ngModel)]="form.code" name="code" required placeholder="e.g. DEP-CARD"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium">Description</label>
                <textarea [(ngModel)]="form.description" name="description" rows="3" placeholder="Department description..."
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
              </div>
              <div class="flex gap-2 pt-2">
                <button type="button" (click)="closeDialog()"
                  class="flex-1 py-1.5 px-3 rounded-lg border border-input text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit"
                  class="flex-1 bg-primary text-primary-foreground py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
                  {{ editingId ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class DepartmentsComponent implements OnInit {
  departments = signal<Department[]>([]);
  showDialog = signal(false);
  editingId: number | null = null;
  form: Department = { name: '', code: '', description: '' };
  canManage = false;

  constructor(private departmentService: DepartmentService, private auth: AuthService) {
    this.canManage = this.auth.hasPermission('department:manage');
  }

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.getAll().subscribe({
      next: (data) => this.departments.set(data),
      error: () => {}
    });
  }

  editDepartment(dept: Department) {
    this.editingId = dept.id!;
    this.form = { ...dept };
    this.showDialog.set(true);
  }

  saveDepartment() {
    if (this.editingId) {
      this.departmentService.update(this.editingId, this.form).subscribe({
        next: () => { this.closeDialog(); this.loadDepartments(); }
      });
    } else {
      this.departmentService.create(this.form).subscribe({
        next: () => { this.closeDialog(); this.loadDepartments(); }
      });
    }
  }

  deleteDepartment(id: number) {
    if (confirm('Delete this department?')) {
      this.departmentService.delete(id).subscribe(() => this.loadDepartments());
    }
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editingId = null;
    this.form = { name: '', code: '', description: '' };
  }
}
