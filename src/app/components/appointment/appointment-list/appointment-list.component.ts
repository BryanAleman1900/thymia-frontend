// src/app/components/appointment/appointment-list/appointment-list.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IAppointment } from '../../../interfaces';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
  providers: [DatePipe]
})
export class AppointmentListComponent {
  @Input() appointments: IAppointment[] = [];
  @Input() isDoctor = false;
  @Output() delete = new EventEmitter<number>();

  constructor(private datePipe: DatePipe) {}

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'medium') || '';
  }

  onDelete(appointmentId: number): void {
    if (confirm('¿Estás seguro de eliminar esta cita?')) {
      this.delete.emit(appointmentId);
    }
  }
}