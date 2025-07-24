import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'api/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(start: Date, end: Date): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      params: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  }

  createAppointment(data: any) {
  const body =
    `title=${encodeURIComponent(data.title)}&` +
    `startTime=${encodeURIComponent(data.startTime)}&` +
    `endTime=${encodeURIComponent(data.endTime)}&` +
    `description=${encodeURIComponent(data.description || '')}&` +
    `patientId=${encodeURIComponent(data.patientId)}&` +
    `doctorId=${encodeURIComponent(data.doctorId)}&` +
    data.guestIds.map((id: number) => `guestIds=${encodeURIComponent(id)}`).join('&');

  return this.http.post('api/appointments', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}


  updateAppointment(id: string, changes: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, changes);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}