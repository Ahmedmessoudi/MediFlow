import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bed } from '../models/bed.model';

@Injectable({ providedIn: 'root' })
export class BedService {
  private readonly API = 'http://localhost:8080/api/beds';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bed[]> {
    return this.http.get<Bed[]>(this.API);
  }

  getAvailable(): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.API}/available`);
  }

  getById(id: number): Observable<Bed> {
    return this.http.get<Bed>(`${this.API}/${id}`);
  }

  create(bed: Bed): Observable<Bed> {
    return this.http.post<Bed>(this.API, bed);
  }

  update(id: number, bed: Bed): Observable<Bed> {
    return this.http.put<Bed>(`${this.API}/${id}`, bed);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
