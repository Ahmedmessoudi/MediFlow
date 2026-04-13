import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { BedsComponent } from './pages/beds/beds.component';
import { DepartmentsComponent } from './pages/departments/departments.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AdminComponent } from './pages/admin/admin.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'patients', component: PatientsComponent, canActivate: [authGuard] },
      { path: 'beds', component: BedsComponent, canActivate: [authGuard] },
      { path: 'departments', component: DepartmentsComponent, canActivate: [authGuard] },
      { path: 'rooms', component: RoomsComponent, canActivate: [authGuard] },
      { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
      { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
    ]
  },
  { path: '**', component: NotFoundComponent },
];
