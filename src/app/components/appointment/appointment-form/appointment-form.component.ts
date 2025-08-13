import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { IUser } from '../../../interfaces';
import { catchError, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

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
    CommonModule,
    MatDialogModule
  ],
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  allUsers: IUser[] = [];
  selectedGuests: IUser[] = [];
  doctors: IUser[] = [];
  loadingDoctors = false;
  pendingDoctorId: number | null = null;

  compareById = (a: any, b: any): boolean => {
    return Number(a) === Number(b);
  };

  isLoading = true;
  isEditMode = false;
  timeOptions: string[] = this.generateTimeOptions();
  minDate: Date = new Date();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

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
      guestIds: [[]],
      doctorId: [null, Validators.required]
    }, { validators: this.endAfterStartValidator });

    if (data?.id) {
      this.isEditMode = true;
      this.patchForm(data);
    }
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadDoctors();

    if (this.isEditMode && this.data?.id) {
      this.appointmentService.getById(Number(this.data.id)).subscribe({
        next: (app) => this.patchForm(app),
        error: (err) => console.error('getById error', err)
      });
    }

  }

  private generateTimeOptions(): string[] {
    const options = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        options.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return options;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getByRole('USER').pipe(
      catchError(() => of({ data: [] }))
    ).subscribe({
      next: (res) => {
        const arr = res?.data ?? [];
        const seen = new Set<number>();
        this.allUsers = arr.filter((u: any) => {
          if (!u?.id) return false;
          if (seen.has(u.id)) return false;
          seen.add(u.id);
          return true;
        });
        this.isLoading = false;
        if (this.isEditMode) this.loadGuestSelection();
      },
      error: () => {
        this.allUsers = [];
        this.isLoading = false;
      }
    });
  }

  loadDoctors(): void {
    this.loadingDoctors = true;
    this.userService.getByRole('THERAPIST').pipe(
      catchError(() => of({ data: [] }))
    ).subscribe({
      next: (res) => {
        const arr = res?.data ?? [];
        const seen = new Set<number>();

        this.doctors = arr
          .map((u: any) => ({ ...u, id: Number(u?.id) }))
          .filter((u: any) => {
            if (!Number.isFinite(u.id)) return false;
            if (seen.has(u.id)) return false;
            seen.add(u.id);
            return true;
          });

        this.loadingDoctors = false;

        this.applyPendingDoctor();
      },
      error: () => {
        this.doctors = [];
        this.loadingDoctors = false;
      }
    });
  }

private applyPendingDoctor(): void {
  if (this.pendingDoctorId == null) return;
  const exists = this.doctors.some(d => Number(d.id) === Number(this.pendingDoctorId));
  if (!exists) return;
  const ctrl = this.appointmentForm.get('doctorId');
  setTimeout(() => {
    ctrl?.setValue(Number(this.pendingDoctorId), { emitEvent: false });
    ctrl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }, 0);
}

  endAfterStartValidator(form: FormGroup) {
    const startDate = form.get('startDate')?.value;
    const startTime = form.get('startTime')?.value;
    const endDate = form.get('endDate')?.value;
    const endTime = form.get('endTime')?.value;

    if (startDate && startTime && endDate && endTime) {
      const start = new Date(startDate);
      const [sh, sm] = String(startTime).split(':').map(Number);
      start.setHours(sh, sm, 0, 0);

      const end = new Date(endDate);
      const [eh, em] = String(endTime).split(':').map(Number);
      end.setHours(eh, em, 0, 0);

      if (end <= start) return { endBeforeStart: true };
    }
    return null;
  }

  private splitDateTime(dt: string): { date: Date; time: string } {
    const d = new Date(dt);
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    return { date, time };
  }

  private combineLocal(date: Date, time: string): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const [hh, mm] = String(time).split(':').map((n: string) => n.padStart(2, '0'));
    return `${y}-${m}-${d}T${hh}:${mm}:00`;
  }

  loadGuestSelection(): void {
    const guestIds = this.appointmentForm.get('guestIds')?.value || [];
    this.selectedGuests = this.allUsers.filter(u => u.id && guestIds.includes(u.id));
  }

  patchForm(data: any): void {
    const s = data?.startTime ? this.splitDateTime(data.startTime) : null;
    const e = data?.endTime ? this.splitDateTime(data.endTime) : null;

    const docIdRaw = (data?.doctorId ?? data?.doctor?.id ?? null);
    this.pendingDoctorId = (docIdRaw != null ? Number(docIdRaw) : null);

    this.appointmentForm.patchValue({
      title: data?.title ?? '',
      startDate: s?.date ?? null,
      startTime: s?.time ?? '',
      endDate: e?.date ?? null,
      endTime: e?.time ?? '',
      description: data?.description ?? '',
      guestIds: (data?.guests ?? []).map((g: IUser) => g.id),
      doctorId: this.pendingDoctorId
    });

    this.applyPendingDoctor();
  }


  onSubmit(): void {
    if (this.appointmentForm.invalid || this.isLoading) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const v = this.appointmentForm.value;

    const startStr = this.combineLocal(new Date(v.startDate), String(v.startTime));
    const endStr   = this.combineLocal(new Date(v.endDate),   String(v.endTime));

    const appointmentData = {
      title: String(v.title),
      startTime: startStr,
      endTime: endStr,
      description: v.description || null,
      patientId: this.authService.getUser()?.id as number,
      doctorId: Number(v.doctorId),
      guestIds: (v.guestIds ?? []).map((id: any) => Number(id))
    };

    console.log('create/update appointment payload:', appointmentData);

    this.isLoading = true;

    const operation = this.isEditMode
      ? this.appointmentService.updateAppointment(String(this.data.id), appointmentData)
      : this.appointmentService.createAppointment(appointmentData);

    operation.subscribe({
      next: () => {
        this.showSuccess(this.isEditMode ? 'Cita actualizada' : 'Cita creada');
        this.dialogRef.close({ message: this.isEditMode ? 'Cita actualizada' : 'Cita creada' });
      },
      error: (err) => {
        console.error('Error saving appointment:', err);
        this.showError(err?.error?.message || 'Error al guardar la cita');
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }

  onDelete(): void {
    if (!this.isEditMode || !confirm('¿Estás seguro de eliminar esta cita?')) return;

    this.isLoading = true;
    this.appointmentService.deleteAppointment(this.data.id).subscribe({
      next: () => {
        this.showSuccess('Cita eliminada');
        this.dialogRef.close({ message: 'Cita eliminada' });
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
    this.snackBar.open(message, 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const endDateControl = this.appointmentForm.get('endDate');
      if (!endDateControl?.value || endDateControl.value < event.value) {
        endDateControl?.setValue(event.value);
      }
    }
  }

  displayUser(u: IUser | null | undefined): string {
    if (!u) return 'Usuario';
    if (u.fullName && u.fullName.trim()) return u.fullName;
    const name = [u.name, u.lastname].filter(Boolean).join(' ').trim();
    if (name) return name;
    if (u.email) return u.email;
    return `ID ${u.id ?? ''}`.trim();
  }

  isInvalid(name: string): boolean {
    const c = this.appointmentForm.get(name);
    return !!(c && c.touched && c.invalid);
  }
}