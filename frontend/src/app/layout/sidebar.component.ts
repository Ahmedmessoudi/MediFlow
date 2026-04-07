import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface NavItem {
  title: string;
  url: string;
  icon: string;
}

const ALL_ITEMS: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: 'layout-dashboard' },
  { title: 'Patients', url: '/patients', icon: 'users' },
  { title: 'Beds', url: '/beds', icon: 'bed-double' },
  { title: 'Wards Management', url: '/wards', icon: 'hospital' },
  { title: 'Rooms & Equipment', url: '/rooms', icon: 'building-2' },
  { title: 'Admin', url: '/admin', icon: 'shield' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="flex flex-col bg-sidebar text-sidebar-foreground border-r-0 transition-all duration-300 shrink-0 h-full"
      [class.w-52]="!collapsed()"
      [class.w-14]="collapsed()"
    >
      <!-- Logo -->
      <div class="flex items-center gap-1.5 px-3 py-3 border-b border-sidebar-border">
        <div class="h-6 w-6 shrink-0 aspect-square">
          <img src="/logo.png" alt="Logo" class="h-6 w-6 object-contain aspect-square" />
        </div>
        @if (!collapsed()) {
          <span class="text-base font-bold text-sidebar-foreground tracking-tight">MediFlow</span>
        }
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 pt-2 px-2 space-y-1">
        @for (item of visibleItems; track item.url) {
          <a
            [routerLink]="item.url"
            routerLinkActive="bg-sidebar-accent text-sidebar-primary font-medium"
            class="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            [title]="collapsed() ? item.title : ''"
          >
            <span class="shrink-0" [innerHTML]="getIcon(item.icon)"></span>
            @if (!collapsed()) {
              <span>{{ item.title }}</span>
            }
          </a>
        }
      </nav>

      <!-- Footer -->
      <div class="px-2 py-3 border-t border-sidebar-border">
        <button
          (click)="onLogout()"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          @if (!collapsed()) {
            <span>Logout</span>
          }
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  collapsed = input(false);
  toggleCollapse = output<void>();

  visibleItems: NavItem[] = [];

  constructor(private auth: AuthService) {
    const allowed = this.auth.getAllowedRoutes();
    this.visibleItems = ALL_ITEMS.filter(item => allowed.includes(item.url));
  }

  onLogout() {
    this.auth.logout();
  }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      'layout-dashboard': '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
      'users': '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      'bed-double': '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>',
      'hospital': '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      'building-2': '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
      'shield': '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    };
    return icons[name] || '';
  }
}
