import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly API = 'http://localhost:8080/api/rooms';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.API);
  }

  create(room: Room): Observable<Room> {
    return this.http.post<Room>(this.API, room);
  }

  update(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.API}/${id}`, room);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
