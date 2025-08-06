import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss'],
  standalone: true,
  imports: [
  CommonModule,
  ReactiveFormsModule,
  RouterModule
]

})
export class ScheduleAppointmentComponent {
  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    patientId: [null, Validators.required],
    guestIds: this.fb.array([])
  });

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  get guestIds(): FormArray {
    return this.form.get('guestIds') as FormArray;
  }

  addGuestId(id: number) {
    this.guestIds.push(this.fb.control(id));
  }

  removeGuestId(index: number) {
    this.guestIds.removeAt(index);
  }

  submit() {
    if (this.form.invalid) return;

    const { patientId, guestIds, ...rest } = this.form.value;

    const payload = {
    ...rest,
    patient: { id: patientId },
    guests: (guestIds ?? []).map(id => ({ id }))
    };

    this.appointmentService.createAppointment(payload).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => console.error(err)
    });
  }
  getGuestControl(index: number): FormControl {
  return this.guestIds.at(index) as FormControl;
}
}
