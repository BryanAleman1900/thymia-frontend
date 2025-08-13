import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'api/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(start: Date, end: Date, patientId?: number): Observable<any[]> {
    const params: any = {
      start: start.toISOString(),
      end: end.toISOString(),
    };
    if (patientId != null) params.patientId = String(patientId);
    return this.http.get<any[]>(this.apiUrl, { params });
  }


  createAppointment(data: any): Observable<any> {
    const payload = {
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      description: data.description ?? null,
      patientId: data.patientId,
      doctorId: data.doctorId,
      guestIds: Array.isArray(data.guestIds) ? data.guestIds : []
    };
    return this.http.post<any>(this.apiUrl, payload);
  }


  updateAppointment(id: string, changes: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, changes);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  joinMeeting(appointmentId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${appointmentId}/join`, {});
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}