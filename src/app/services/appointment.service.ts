import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface AppointmentDTO {
  patientId: number;
  professionalId: number;
  date: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8080/api/appointments';

  constructor(private http: HttpClient) {}

  createAppointment(appointment: AppointmentDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}`, appointment);
  }

  getAvailableSlots(professionalId: number, date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/available?professionalId=${professionalId}&date=${date}`);
  }

  // Métodos adicionales según necesidades futuras...
}
