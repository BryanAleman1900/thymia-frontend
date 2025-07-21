import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { IAppointment, IUser } from '../../../interfaces';
import { UserService } from '../../../services/user.service';
import { GoogleCalendarService } from '../../../services/google-calendar.service';

@Component({
  selector: 'app-appointment-form',
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule
  ],
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