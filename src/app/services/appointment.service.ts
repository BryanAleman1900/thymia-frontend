
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAppointment, IResponse } from '../interfaces';


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'api/appointments'; 

  constructor(private http: HttpClient) {}

 
  getAppointmentsByPatient(patientId: number): Observable<IResponse<IAppointment[]>> {
    return this.http.get<IResponse<IAppointment[]>>(`${this.apiUrl}/patient/${patientId}`);
  }

  getAppointmentsByDoctor(doctorId: number): Observable<IResponse<IAppointment[]>> {
    return this.http.get<IResponse<IAppointment[]>>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  deleteAppointment(id: number): Observable<IResponse<void>> {
    return this.http.delete<IResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getCalendarAppointments(start: Date, end: Date): Observable<IAppointment[]> {
    return this.http.get<IAppointment[]>(
      `${this.apiUrl}?start=${start.toISOString()}&end=${end.toISOString()}`
    );
  }

  createAppointment(appointment: Partial<IAppointment>): Observable<IResponse<IAppointment>> {
    return this.http.post<IResponse<IAppointment>>(this.apiUrl, appointment);
  }

  updateAppointment(id: number, changes: Partial<IAppointment>): Observable<IResponse<IAppointment>> {
    return this.http.patch<IResponse<IAppointment>>(`${this.apiUrl}/${id}`, changes);
  }
}