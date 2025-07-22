// import { Component, Inject, OnInit } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AppointmentService } from '../../../services/appointment.service';
// import { UserService } from '../../../services/user.service';
// import { IUser } from '../../../interfaces';

// @Component({
//   selector: 'app-appointment-form',
//   templateUrl: './appointment-form.component.html',
//   styleUrls: ['./appointment-form.component.scss']
// })
// export class AppointmentFormComponent implements OnInit {
//   form: FormGroup;
//   patients: IUser[] = [];
//   guests: IUser[] = [];
//   minDate = new Date();

//   constructor(
//     private fb: FormBuilder,
//     private appointmentService: AppointmentService,
//     private userService: UserService,
//     private dialogRef: MatDialogRef<AppointmentFormComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: any
//   ) {
//     this.form = this.fb.group({
//       title: ['', Validators.required],
//       startTime: ['', Validators.required],
//       endTime: ['', Validators.required],
//       description: [''],
//       patientId: ['', Validators.required],
//       guestIds: [[]]
//     });
//   }

//   ngOnInit(): void {
//     this.loadUsers();
//     if (this.data.isEdit) {
//       this.patchForm();
//     }
//   }

//   loadUsers(): void {
//     this.userService.getPatients().subscribe(patients => {
//       this.patients = patients;
//     });
//     this.userService.getAllUsers().subscribe(users => {
//       this.guests = users;
//     });
//   }

//   onSubmit(): void {
//     if (this.form.invalid) return;

//     const formValue = this.form.value;
//     const appointmentData = {
//       ...formValue,
//       startTime: new Date(formValue.startTime).toISOString(),
//       endTime: new Date(formValue.endTime).toISOString()
//     };

//     if (this.data.isEdit) {
//       this.appointmentService.updateAppointment(this.data.eventId, appointmentData)
//         .subscribe(() => this.dialogRef.close('updated'));
//     } else {
//       this.appointmentService.createAppointment(appointmentData)
//         .subscribe(() => this.dialogRef.close('created'));
//     }
//   }
// }