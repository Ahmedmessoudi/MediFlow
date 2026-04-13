import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly API = '/api/departments';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.API);
  }

  getById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.API}/${id}`);
  }

  getByCode(code: string): Observable<Department> {
    return this.http.get<Department>(`${this.API}/code/${code}`);
  }

  create(department: Department): Observable<Department> {
    return this.http.post<Department>(this.API, department);
  }

  update(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.API}/${id}`, department);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
