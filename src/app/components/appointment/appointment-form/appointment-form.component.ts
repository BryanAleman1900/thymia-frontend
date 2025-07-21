// src/app/components/appointment/appointment-form/appointment-form.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IAppointment, IUser } from '../../../interfaces';
import { UserService } from '../../../services/user.service';
import { GoogleCalendarService } from '../../../services/google-calendar.service';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent {
  @Input() doctorId?: number;
  @Output() appointmentCreated = new EventEmitter<IAppointment>();
  
  appointmentForm: FormGroup;
  patients: IUser[] = [];
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private googleService: GoogleCalendarService
  ) {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });

    this.loadPatients();
  }

  async loadPatients() {
    this.patients = await this.userService.getPatients().toPromise();
  }

  async onSubmit() {
    if (this.appointmentForm.invalid || !this.doctorId) return;

    try {
      const accessToken = await this.googleService.signIn();
      const formValue = this.appointmentForm.value;
      
      const appointmentData: IAppointment = {
        patientId: formValue.patientId,
        doctorId: this.doctorId,
        title: formValue.title,
        description: formValue.description,
        startTime: formValue.startTime.toISOString(),
        endTime: formValue.endTime.toISOString()
      };

      // Aquí integrarías con Google Calendar
      const googleEvent = await this.googleService.createEvent({
        summary: formValue.title,
        description: formValue.description,
        start: { dateTime: formValue.startTime.toISOString() },
        end: { dateTime: formValue.endTime.toISOString() }
      }, accessToken);

      appointmentData.googleEventId = googleEvent.id;
      this.appointmentCreated.emit(appointmentData);
      this.appointmentForm.reset();
      
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  }
}