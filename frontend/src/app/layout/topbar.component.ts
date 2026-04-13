import { Component, OnInit, output, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/notification.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [DatePipe],
  template: `
    <header class="h-12 border-b bg-card flex items-center justify-between px-3 shrink-0">
      <div class="flex items-center gap-1.5">
        <!-- Sidebar Toggle -->
        <button (click)="toggleSidebar.emit()" class="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
        <span class="text-xs font-medium text-muted-foreground hidden sm:inline">
          Hospital Resource & Bed Management
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Notification Bell -->
        <div class="relative">
          <button (click)="toggleNotifications()" class="relative p-1.5 rounded-lg hover:bg-muted transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            @if (notificationService.unreadCount() > 0) {
              <span class="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] text-white flex items-center justify-center font-bold">
                {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
              </span>
            }
          </button>

          <!-- Notification Dropdown -->
          @if (showNotifications()) {
            <div class="absolute right-0 top-10 w-80 bg-card rounded-xl border shadow-2xl z-50 animate-fade-in">
              <div class="flex items-center justify-between p-3 border-b">
                <h3 class="text-xs font-semibold">Notifications</h3>
                @if (notificationService.unreadCount() > 0) {
                  <button (click)="markAllRead()" class="text-[10px] text-primary hover:underline">Mark all read</button>
                }
              </div>
              <div class="max-h-72 overflow-y-auto">
                @for (n of notificationService.notifications().slice(0, 10); track n.id) {
                  <div class="p-3 border-b hover:bg-muted/50 transition-colors cursor-pointer"
                    [class]="n.read ? 'opacity-60' : ''"
                    (click)="markRead(n)">
                    <div class="flex items-start gap-2">
                      <div class="h-2 w-2 rounded-full mt-1 shrink-0"
                        [class]="getNotifColor(n.type)"></div>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs leading-relaxed">{{ n.message }}</p>
                        <p class="text-[10px] text-muted-foreground mt-0.5">{{ n.createdAt | date:'short' }}</p>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="p-6 text-center text-xs text-muted-foreground">No notifications</div>
                }
              </div>
            </div>
          }
        </div>

        <!-- User Info -->
        <div class="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
          <div class="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="hidden sm:flex flex-col items-start text-left">
            <span class="text-xs font-medium leading-none">{{ auth.currentUser() || 'User' }}</span>
            <span class="text-[9px] px-1.5 py-0 mt-0.5 rounded-full border"
              [class]="roleBadgeClass">
              {{ auth.currentRole() || 'GUEST' }}
            </span>
          </div>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent implements OnInit {
  toggleSidebar = output<void>();
  showNotifications = signal(false);

  constructor(
    public auth: AuthService,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.notificationService.startPolling();
    }
  }

  toggleNotifications() {
    this.showNotifications.set(!this.showNotifications());
    if (this.showNotifications()) {
      this.notificationService.loadNotifications();
    }
  }

  markRead(notification: Notification) {
    if (!notification.read && notification.id) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        this.notificationService.loadUnreadCount();
        this.notificationService.loadNotifications();
      });
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notificationService.loadUnreadCount();
      this.notificationService.loadNotifications();
    });
  }

  getNotifColor(type: string): string {
    const map: Record<string, string> = {
      CRITICAL_ALERT: 'bg-destructive',
      PATIENT_ASSIGNED: 'bg-primary',
      BED_CHANGE: 'bg-warning',
      SYSTEM_ALERT: 'bg-muted-foreground',
    };
    return map[type] || 'bg-primary';
  }

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
