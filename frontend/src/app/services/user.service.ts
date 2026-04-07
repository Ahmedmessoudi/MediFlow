import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppUser, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = '/api/users';
  private readonly AUTH_API = '/api/auth';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.API);
  }

  create(request: RegisterRequest): Observable<AppUser> {
    return this.http.post<AppUser>(this.API, request);
  }

  update(id: number, request: any): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.API}/${id}`, request);
  }

  toggleActive(id: number): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.API}/${id}/toggle-active`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
