
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

  createAppointment(appointment: IAppointment, accessToken: string): Observable<IResponse<IAppointment>> {
    return this.http.post<IResponse<IAppointment>>(this.apiUrl, appointment, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }

  getAppointmentsByPatient(patientId: number): Observable<IResponse<IAppointment[]>> {
    return this.http.get<IResponse<IAppointment[]>>(`${this.apiUrl}/patient/${patientId}`);
  }

  getAppointmentsByDoctor(doctorId: number): Observable<IResponse<IAppointment[]>> {
    return this.http.get<IResponse<IAppointment[]>>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  updateAppointment(id: number, appointment: Partial<IAppointment>): Observable<IResponse<IAppointment>> {
    return this.http.put<IResponse<IAppointment>>(`${this.apiUrl}/${id}`, appointment);
  }

  deleteAppointment(id: number): Observable<IResponse<void>> {
    return this.http.delete<IResponse<void>>(`${this.apiUrl}/${id}`);
  }
}