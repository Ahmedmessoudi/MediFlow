import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly API = '/api/patients';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.API);
  }

  getMyPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.API}/my-patients`);
  }

  getByDepartment(departmentId: number): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.API}/by-department/${departmentId}`);
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.API}/${id}`);
  }

  create(patient: any): Observable<Patient> {
    return this.http.post<Patient>(this.API, patient);
  }

  update(id: number, patient: any): Observable<Patient> {
    return this.http.put<Patient>(`${this.API}/${id}`, patient);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  allocateBed(id: number): Observable<Patient> {
    return this.http.post<Patient>(`${this.API}/${id}/allocate`, {});
  }

  discharge(id: number): Observable<Patient> {
    return this.http.post<Patient>(`${this.API}/${id}/discharge`, {});
  }

  updateCondition(id: number, condition: string): Observable<Patient> {
    return this.http.put<Patient>(`${this.API}/${id}/condition`, { condition });
  }

  getAiSummary(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}/ai-summary`);
  }
}
