import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = '/api/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(start: Date, end: Date): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      params: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http.post(this.apiUrl, appointment);
  }

  updateAppointment(id: string, changes: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, changes);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}