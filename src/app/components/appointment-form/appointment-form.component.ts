import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { IUser } from '../../interfaces';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  providers: [AppointmentService, AuthService],
  styleUrls: ['./appointment-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule] 
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm!: FormGroup;
  availableSlots: string[] = [];
  submitting = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      professionalId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  checkAvailability(): void {
    const { professionalId, date } = this.appointmentForm.value;
    if (professionalId && date) {
      this.appointmentService.getAvailableSlots(professionalId, date).subscribe(slots => {
        this.availableSlots = slots;
      });
    }
  }

  submit(): void {
  if (this.appointmentForm.valid) {
    const user = this.authService.getUser();

    if (!user || !user.id) {
      this.message = 'Error: usuario no válido.';
      return;
    }

    const { professionalId, date, time } = this.appointmentForm.value;

    
    if (!this.availableSlots.includes(time)) {
      this.message = 'La hora seleccionada no está disponible.';
      return;
    }

    this.submitting = true;

    this.appointmentService.createAppointment({
      patientId: user.id,
      professionalId,
      date,
      time
    }).subscribe({
      next: () => this.message = 'Cita agendada exitosamente.',
      error: () => this.message = 'Error al agendar la cita.',
      complete: () => this.submitting = false
    });
  }
}

}
