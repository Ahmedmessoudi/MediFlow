import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { Client } from '@stomp/stompjs';
import { Notification } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly API = '/api/notifications';
  private stompClient: Client | null = null;

  unreadCount = signal(0);
  notifications = signal<Notification[]>([]);

  constructor(
    private http: HttpClient, 
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  loadNotifications(): void {
    this.http.get<Notification[]>(this.API).subscribe({
      next: (data) => this.notifications.set(data),
      error: () => {}
    });
  }

  loadUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.API}/unread/count`).subscribe({
      next: (data) => this.unreadCount.set(data.count),
      error: () => {}
    });
  }

  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.API}/unread`);
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.API}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.API}/read-all`, {});
  }

  /**
   * Connect to WebSocket for real-time notifications
   */
  startPolling(): void {
    // Initial fetch
    this.loadUnreadCount();
    this.loadNotifications();

    // Fallback polling for robustness
    setInterval(() => {
      this.loadUnreadCount();
    }, 30000);

    // Initialize WebSocket if in browser
    if (isPlatformBrowser(this.platformId)) {
      this.initWebSocket();
    }
  }

  private initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // This assumes backend and frontend are mapped proxy (or same host)
    // In dev, Angular proxy routes /ws to backend
    const wsUrl = `${protocol}//${host}/ws`;

    this.stompClient = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket for notifications', frame);
      this.stompClient?.subscribe('/topic/notifications', (message) => {
        if (message.body) {
          try {
            const newNotif = JSON.parse(message.body) as Notification;
            const currentRole = this.auth.currentRole();
            // Check if notification is for current user
            if (newNotif.targetRoles === 'ALL' || (currentRole && newNotif.targetRoles.includes(currentRole))) {
               this.notifications.update(n => [newNotif, ...n]);
               this.unreadCount.update(c => c + 1);
               // Simple toast effect handled directly in DOM for immediate feedback
               this.showToast(newNotif.message, newNotif.type);
            }
          } catch(e) {
            console.error('Error parsing notification', e);
          }
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('WebSocket Error', frame.headers['message']);
    };

    this.stompClient.activate();
  }

  private showToast(message: string, type: string) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-[9999] p-4 rounded-xl shadow-2xl border text-sm font-medium animate-fade-in flex items-center gap-3 bg-card`;
    
    // Set colors based on type
    let colorClass = 'text-primary bg-primary/10';
    if (type === 'CRITICAL_ALERT') colorClass = 'text-destructive bg-destructive/10';
    if (type === 'BED_CHANGE') colorClass = 'text-warning bg-warning/10';

    toast.innerHTML = `
      <div class="h-2 w-2 rounded-full ${colorClass.split(' ')[1].replace('/10', '')}"></div>
      <span class="text-foreground">${message}</span>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  }
}
