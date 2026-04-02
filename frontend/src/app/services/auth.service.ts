import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse, LoginRequest, RegisterRequest,
  UserRole, Permission, ROLE_PERMISSIONS, ROLE_ROUTES, ROLE_DEFAULT_ROUTE
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'mediflow_token';
  private readonly USER_KEY = 'mediflow_user';
  private readonly ROLE_KEY = 'mediflow_role';

  currentUser = signal<string | null>(this.getStoredUser());
  currentRole = signal<UserRole | null>(this.getStoredRole());
  isLoggedIn = computed(() => !!this.currentUser() && !!this.getToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, request).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, request).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.currentUser.set(null);
    this.currentRole.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): UserRole | null {
    return this.currentRole();
  }

  getDefaultRoute(): string {
    const role = this.currentRole();
    return role ? ROLE_DEFAULT_ROUTE[role] : '/login';
  }

  hasPermission(permission: Permission): boolean {
    const role = this.currentRole();
    if (!role) return false;
    return ROLE_PERMISSIONS[role].includes(permission);
  }

  canAccessRoute(route: string): boolean {
    const role = this.currentRole();
    if (!role) return false;
    return ROLE_ROUTES[role].includes(route);
  }

  getAllowedRoutes(): string[] {
    const role = this.currentRole();
    if (!role) return [];
    return ROLE_ROUTES[role];
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, res.username);
    localStorage.setItem(this.ROLE_KEY, res.role);
    this.currentUser.set(res.username);
    this.currentRole.set(res.role as UserRole);
  }

  private getStoredUser(): string | null {
    return localStorage.getItem(this.USER_KEY);
  }

  private getStoredRole(): UserRole | null {
    const role = localStorage.getItem(this.ROLE_KEY);
    return role as UserRole | null;
  }
}
