import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly API = 'http://localhost:8080/api/patients';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.API);
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.API}/${id}`);
  }

  create(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.API, patient);
  }

  update(id: number, patient: Patient): Observable<Patient> {
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

  markCritical(id: number): Observable<Patient> {
    return this.http.put<Patient>(`${this.API}/${id}/mark-critical`, {});
  }
}
