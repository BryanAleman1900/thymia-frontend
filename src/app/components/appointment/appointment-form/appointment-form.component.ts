import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../interfaces';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  isEditMode = false;
  patients: IUser[] = [];
  doctors: IUser[] = [];
  allUsers: IUser[] = [];
  selectedGuests: IUser[] = [];
  isLoading = true;
  timeOptions: string[] = this.generateTimeOptions();
  minDate: Date = new Date();

  
  private fb = inject(FormBuilder);

  constructor(
    private appointmentService: AppointmentService,
    private userService: UserService,
    public dialogRef: MatDialogRef<AppointmentFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.appointmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      startDate: [null, Validators.required],
      startTime: ['', Validators.required],
      endDate: [null, Validators.required],
      endTime: ['', Validators.required],
      description: ['', Validators.maxLength(500)],
      patientId: [null, Validators.required],
      doctorId: [null, Validators.required],
      guestIds: [[]]
    });

    if (data.id) {
      this.isEditMode = true;
      this.patchForm(data);
    }
  }

  private generateTimeOptions(): string[] {
    const options = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        options.push(
          `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        );
      }
    }
    return options;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    
    forkJoin({
      patients: this.userService.getPatients().pipe(
        catchError(() => of({ data: [] }))
      ),
      users: this.userService.getAll().pipe(
        catchError(() => of({ data: [] }))
      )
    }).subscribe({
      next: ({patients, users}) => {
        this.patients = patients.data;
        this.allUsers = users.data;
        this.doctors = this.allUsers.filter(user => 
          user.role?.name === 'ROLE_DOCTOR' || 
          user.authorities?.some(auth => auth.authority === 'ROLE_DOCTOR')
        );
        this.isLoading = false;
        
        if (this.isEditMode) {
          this.loadGuestSelection();
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.showError('Error al cargar usuarios');
        this.isLoading = false;
      }
    });
  }

  loadGuestSelection(): void {
    const guestIds = this.appointmentForm.get('guestIds')?.value || [];
    this.selectedGuests = this.allUsers.filter(user => 
      user.id && guestIds.includes(user.id)
    );
  }

  patchForm(data: any): void {
    const formattedData = {
      ...data,
      startTime: this.formatDateTime(data.startTime),
      endTime: this.formatDateTime(data.endTime),
      patientId: data.patient?.id,
      doctorId: data.doctor?.id,
      guestIds: data.guests?.map((g: IUser) => g.id) || []
    };

    this.appointmentForm.patchValue(formattedData);
    this.selectedGuests = data.guests || [];
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid || this.isLoading) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.formatDateTimeForSubmission();

    const formValue = this.appointmentForm.value;
    const appointmentData = {
      ...formValue,
      patient: { id: formValue.patientId },
      doctor: { id: formValue.doctorId },
      guests: formValue.guestIds.map((id: number) => ({ id }))
    };

    this.isLoading = true;
    const operation = this.isEditMode
      ? this.appointmentService.updateAppointment(this.data.id, appointmentData)
      : this.appointmentService.createAppointment(appointmentData);

    operation.subscribe({
      next: () => {
        this.showSuccess(this.isEditMode ? 'Cita actualizada' : 'Cita creada');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error saving appointment:', err);
        this.showError('Error al guardar la cita');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onDelete(): void {
    if (!this.isEditMode || !confirm('¿Estás seguro de eliminar esta cita?')) return;

    this.isLoading = true;
    this.appointmentService.deleteAppointment(this.data.id).subscribe({
      next: () => {
        this.showSuccess('Cita eliminada');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error deleting appointment:', err);
        this.showError('Error al eliminar la cita');
        this.isLoading = false;
      }
    });
  }

  compareUsers(user1: IUser, user2: IUser): boolean {
    return user1?.id === user2?.id;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { 
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { 
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const endDateControl = this.appointmentForm.get('endDate');
      if (!endDateControl?.value || endDateControl.value < event.value) {
        endDateControl?.setValue(event.value);
      }
    }
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  formatDateTimeForSubmission(): void {
    const formValue = this.appointmentForm.value;
    const startDateTime = this.combineDateAndTime(formValue.startDate, formValue.startTime);
    const endDateTime = this.combineDateAndTime(formValue.endDate, formValue.endTime);
    
    this.appointmentForm.patchValue({
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString()
    });
  }
}