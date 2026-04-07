import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="h-screen flex w-full overflow-hidden bg-background">
      <app-sidebar class="block h-full flex-shrink-0" [collapsed]="sidebarCollapsed()" (toggleCollapse)="sidebarCollapsed.set(!sidebarCollapsed())" />
      <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <app-topbar (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())" />
        <main class="flex-1 p-4 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);
}
