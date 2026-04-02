import { Component, output } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
      <div class="flex items-center gap-2">
        <!-- Sidebar Toggle -->
        <button (click)="toggleSidebar.emit()" class="p-2 rounded-lg hover:bg-muted transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
        <span class="text-sm font-medium text-muted-foreground hidden sm:inline">
          Hospital Resource & Bed Management
        </span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Notification Bell -->
        <button class="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <span class="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
        </button>

        <!-- User Info -->
        <div class="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
          <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="hidden sm:flex flex-col items-start text-left">
            <span class="text-sm font-medium leading-none">{{ auth.currentUser() || 'User' }}</span>
            <span class="text-[10px] px-1.5 py-0 mt-0.5 rounded-full border"
              [class]="roleBadgeClass">
              {{ auth.currentRole() || 'GUEST' }}
            </span>
          </div>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  toggleSidebar = output<void>();

  constructor(public auth: AuthService) {}

  get roleBadgeClass(): string {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-primary/15 text-primary border-primary/30',
      'DOCTOR': 'bg-success/15 text-success border-success/30',
      'NURSE': 'bg-warning/15 text-warning border-warning/30',
      'RECEPTIONIST': 'bg-muted text-muted-foreground border-border',
    };
    return colors[this.auth.currentRole() || ''] || '';
  }
}
