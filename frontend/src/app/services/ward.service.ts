import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ward } from '../models/ward.model';

@Injectable({ providedIn: 'root' })
export class WardService {
  private readonly API = '/api/wards';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Ward[]> {
    return this.http.get<Ward[]>(this.API);
  }

  getById(id: number): Observable<Ward> {
    return this.http.get<Ward>(`${this.API}/${id}`);
  }

  create(ward: Ward): Observable<Ward> {
    return this.http.post<Ward>(this.API, ward);
  }

  update(id: number, ward: Ward): Observable<Ward> {
    return this.http.put<Ward>(`${this.API}/${id}`, ward);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
