import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { SystemSettings } from '../../models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4 animate-fade-in">
      <div>
        <h1 class="text-xl font-bold">System Settings</h1>
        <p class="text-xs text-muted-foreground">Configure system limits and behavior</p>
      </div>

      @if (settings()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Resource Limits -->
          <div class="bg-card rounded-xl border p-5 space-y-4">
            <h3 class="text-sm font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Resource Limits
            </h3>

            <div class="space-y-1.5">
              <label class="text-xs font-medium">Maximum Users</label>
              <input [(ngModel)]="settings()!.maxUsers" type="number" min="1"
                class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              <p class="text-[10px] text-muted-foreground">Maximum number of users allowed in the system</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium">Maximum Beds</label>
              <input [(ngModel)]="settings()!.maxBeds" type="number" min="1"
                class="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              <p class="text-[10px] text-muted-foreground">Maximum number of beds across all departments</p>
            </div>
          </div>

          <!-- Alert & Behavior -->
          <div class="bg-card rounded-xl border p-5 space-y-4">
            <h3 class="text-sm font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Alerts & Behavior
            </h3>

            <div class="space-y-1.5">
              <label class="text-xs font-medium">Alert Threshold (%)</label>
              <div class="flex items-center gap-3">
                <input [(ngModel)]="settings()!.alertThreshold" type="range" min="50" max="100"
                  class="flex-1 h-1.5 rounded-full accent-primary" />
                <span class="text-xs font-mono font-bold text-primary min-w-[2.5rem] text-right">{{ settings()!.alertThreshold }}%</span>
              </div>
              <p class="text-[10px] text-muted-foreground">Trigger alerts when occupancy exceeds this threshold</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium">Allow Overbooking</label>
              <div class="flex items-center gap-2">
                <button (click)="settings()!.allowOverbooking = !settings()!.allowOverbooking"
                  class="relative h-5 w-9 rounded-full transition-colors"
                  [class]="settings()!.allowOverbooking ? 'bg-primary' : 'bg-muted'">
                  <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                    [class]="settings()!.allowOverbooking ? 'translate-x-4' : 'translate-x-0.5'"></span>
                </button>
                <span class="text-xs text-muted-foreground">{{ settings()!.allowOverbooking ? 'Enabled' : 'Disabled' }}</span>
              </div>
              <p class="text-[10px] text-muted-foreground">Allow assigning beds beyond room capacity</p>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button (click)="saveSettings()"
            [disabled]="saving()"
            class="bg-primary text-primary-foreground font-medium py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors text-xs disabled:opacity-50 flex items-center gap-2">
            @if (saving()) {
              <svg class="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Saving...
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Settings
            }
          </button>
        </div>

        @if (successMessage()) {
          <div class="bg-success/10 border border-success/20 rounded-lg p-3 text-xs text-success font-medium animate-fade-in">
            ✅ {{ successMessage() }}
          </div>
        }
      }
    </div>
  `
})
export class SettingsComponent implements OnInit {
  settings = signal<SystemSettings | null>(null);
  saving = signal(false);
  successMessage = signal('');

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getSettings().subscribe({
      next: (data) => this.settings.set(data),
      error: () => {}
    });
  }

  saveSettings() {
    if (!this.settings()) return;
    this.saving.set(true);
    this.successMessage.set('');
    this.settingsService.updateSettings(this.settings()!).subscribe({
      next: (data) => {
        this.settings.set(data);
        this.saving.set(false);
        this.successMessage.set('Settings saved successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => this.saving.set(false)
    });
  }
}
