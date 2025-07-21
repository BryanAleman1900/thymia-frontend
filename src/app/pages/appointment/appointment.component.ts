

import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { IAppointment, IResponse, IUser } from '../../interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appointment-page',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentPage implements OnInit {
  appointments: IAppointment[] = [];
  currentUser: IUser | null = null;
  isDoctor = false;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isDoctor = this.currentUser?.authorities?.some(auth => auth.authority === 'ROLE_DOCTOR') || false;
    this.loadAppointments();
  }

  loadAppointments(): void {
    if (!this.currentUser) return;

    const serviceCall = this.isDoctor 
      ? this.appointmentService.getAppointmentsByDoctor(this.currentUser.id!)
      : this.appointmentService.getAppointmentsByPatient(this.currentUser.id!);

    serviceCall.subscribe({
      next: (response: IResponse<IAppointment[]>) => {
        this.appointments = response.data || [];
      },
      error: (err) => console.error('Error loading appointments:', err)
    });
  }

  onAppointmentCreated(newAppointment: IAppointment): void {
    this.appointments = [...this.appointments, newAppointment];
  }

  onAppointmentDeleted(deletedId: number): void {
    this.appointments = this.appointments.filter(a => a.id !== deletedId);
  }
}