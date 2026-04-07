import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserRole, ROLE_DEFAULT_ROUTE } from '../../models/user.model';

interface RoleOption {
  role: UserRole;
  label: string;
  desc: string;
  iconPath: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center gradient-medical p-4 relative">
      <!-- Background circles -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5"></div>
        <div class="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-white/5"></div>
      </div>

      <!-- Login Card -->
      <div class="w-full max-w-sm shadow-2xl border-0 rounded-xl bg-card animate-fade-in relative z-10">
        <!-- Header -->
        <div class="text-center pb-2 pt-6 px-6">
          <div class="mx-auto mb-4 h-24 w-24 flex items-center justify-center">
            <img src="/logo.png" alt="MediFlow Logo" class="h-24 w-24 object-contain drop-shadow-md" />
          </div>
          <h1 class="text-xl font-bold text-foreground">MediFlow</h1>
          <p class="text-muted-foreground text-xs">Hospital Resource & Bed Management</p>
        </div>

        <!-- Form -->
        <div class="px-6 pb-6 pt-2">
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Role Selector -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Sign in as</label>
              <div class="grid grid-cols-2 gap-2">
                @for (opt of roleOptions; track opt.role) {
                  <button
                    type="button"
                    (click)="selectedRole.set(opt.role)"
                    class="flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer"
                    [class]="selectedRole() === opt.role
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      [class]="selectedRole() === opt.role ? 'text-primary' : 'text-muted-foreground'">
                      <path [attr.d]="opt.iconPath"/>
                    </svg>
                    <div>
                      <div class="text-xs font-medium leading-none">{{ opt.label }}</div>
                      <div class="text-[10px] text-muted-foreground mt-0.5">{{ opt.desc }}</div>
                    </div>
                  </button>
                }
              </div>
            </div>

            <!-- Username -->
            <div class="space-y-1.5">
              <label for="username" class="text-xs font-medium text-foreground">Username</label>
              <input
                id="username"
                [(ngModel)]="username"
                name="username"
                class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your username"
              />
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label for="password" class="text-xs font-medium text-foreground">Password</label>
              <div class="relative">
                <input
                  id="password"
                  [(ngModel)]="password"
                  name="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-8"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  (click)="showPassword.set(!showPassword())"
                >
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <!-- Error -->
            @if (error()) {
              <div class="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-2 rounded-lg">
                {{ error() }}
              </div>
            }

            <!-- Submit -->
            <button
              type="submit"
              class="w-full mt-2 bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs text-sm"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="flex items-center justify-center gap-1.5 text-xs">
                  <svg class="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Signing in...
                </span>
              } @else {
                <span class="text-xs">Sign In as {{ getRoleLabel() }}</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = 'admin';
  password = 'admin';
  showPassword = signal(false);
  selectedRole = signal<UserRole>('ADMIN');
  loading = signal(false);
  error = signal('');

  roleOptions: RoleOption[] = [
    { role: 'ADMIN', label: 'Admin', desc: 'Full system access', iconPath: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' },
    { role: 'DOCTOR', label: 'Doctor', desc: 'Patient care & diagnostics', iconPath: 'M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3' },
    { role: 'NURSE', label: 'Nurse', desc: 'Bed assignment & patient care', iconPath: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' },
    { role: 'RECEPTIONIST', label: 'Receptionist', desc: 'Patient registration', iconPath: 'M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  getRoleLabel(): string {
    return this.roleOptions.find(r => r.role === this.selectedRole())?.label || '';
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');

    // Use the credentials matching the selected role from seeder
    const credentials: Record<UserRole, { username: string; password: string }> = {
      ADMIN: { username: 'admin', password: 'admin' },
      DOCTOR: { username: 'dr.smith', password: 'doctor' },
      NURSE: { username: 'nurse.jones', password: 'nurse' },
      RECEPTIONIST: { username: 'receptionist01', password: 'reception' },
    };

    const cred = { username: this.username, password: this.password };

    this.auth.login(cred).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate([ROLE_DEFAULT_ROUTE[res.role as UserRole]]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Invalid credentials. Please try again.');
      }
    });
  }
}
