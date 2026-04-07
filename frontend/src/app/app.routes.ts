import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { BedsComponent } from './pages/beds/beds.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { WardsComponent } from './pages/wards/wards.component';
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
      { path: 'wards', component: WardsComponent, canActivate: [authGuard] },
      { path: 'rooms', component: RoomsComponent, canActivate: [authGuard] },
      { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
    ]
  },
  { path: '**', component: NotFoundComponent },
];
