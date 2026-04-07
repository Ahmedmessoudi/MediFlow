import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AppUser, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            Admin Panel
          </h1>
          <p class="text-xs text-muted-foreground">Manage system users</p>
        </div>
        <button (click)="showDialog.set(true)"
          class="bg-primary text-primary-foreground font-medium py-1.5 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add User
        </button>
      </div>

      <!-- Users Table -->
      <div class="bg-card rounded-xl border overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="text-left py-2 px-3 font-medium text-muted-foreground">Username</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground">Role</th>
              <th class="text-right py-2 px-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr class="border-b hover:bg-muted/50 transition-colors">
                <td class="py-2 px-3 font-medium">{{ u.username }}</td>
                <td class="py-2 px-3">
                  <span class="text-[10px] px-2 py-0.5 rounded-full border" [class]="roleClass(u.role)">
                    {{ u.role }}
                  </span>
                </td>
                <td class="py-2 px-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button (click)="deleteUser(u.id!)" title="Delete"
                      class="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Add User Dialog -->
      @if (showDialog()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showDialog.set(false)">
          <div class="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in" (click)="$event.stopPropagation()">
            <h2 class="text-lg font-semibold mb-4">Add New User</h2>
            <form (ngSubmit)="addUser()" class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Username</label>
                <input [(ngModel)]="newUser.username" name="username" required placeholder="Username"
                  class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Password</label>
                <input [(ngModel)]="newUser.password" name="password" type="password" required placeholder="Password"
                  class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Role</label>
                <select [(ngModel)]="newUser.role" name="role"
                  class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="ADMIN">Admin</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                </select>
              </div>
              <div class="flex gap-2">
                <button type="button" (click)="showDialog.set(false)"
                  class="flex-1 py-2 px-4 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit"
                  class="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Create User</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminComponent implements OnInit {
  users = signal<AppUser[]>([]);
  showDialog = signal(false);
  newUser = { username: '', password: '', role: 'RECEPTIONIST' };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe(users => this.users.set(users));
  }

  roleClass(role: UserRole): string {
    const map: Record<string, string> = {
      ADMIN: 'bg-primary/15 text-primary border-primary/30',
      DOCTOR: 'bg-success/15 text-success border-success/30',
      NURSE: 'bg-warning/15 text-warning border-warning/30',
      RECEPTIONIST: 'bg-muted text-muted-foreground border-border',
    };
    return map[role] || '';
  }

  addUser() {
    this.userService.create(this.newUser).subscribe({
      next: () => {
        this.showDialog.set(false);
        this.newUser = { username: '', password: '', role: 'RECEPTIONIST' };
        this.loadUsers();
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.delete(id).subscribe(() => this.loadUsers());
    }
  }
}
