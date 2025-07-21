import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentFormComponent } from '../../components/appointment/appointment-form/appointment-form.component';
import { AppointmentListComponent } from '../../components/appointment/appointment-list/appointment-list.component';
import { IAppointment, IUser } from '../../interfaces';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AppointmentFormComponent,
    AppointmentListComponent 
  ],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})

export class AppointmentComponent implements OnInit {
  appointments: IAppointment[] = [];
  currentUser: IUser | null = null;
  isDoctor = false;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private dialog: MatDialog
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
      next: (response: any) => {
        this.appointments = response.data || [];
      },
      error: (err) => console.error('Error loading appointments:', err)
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '600px',
      data: { doctorId: this.currentUser?.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onAppointmentCreated(result);
      }
    });
  }

  onAppointmentCreated(newAppointment: IAppointment): void {
    this.appointments = [...this.appointments, newAppointment];
  }

  onAppointmentDeleted(deletedId: number): void {
    this.appointments = this.appointments.filter(a => a.id !== deletedId);
  }
}