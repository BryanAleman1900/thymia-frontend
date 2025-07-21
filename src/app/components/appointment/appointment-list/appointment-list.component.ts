import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { IAppointment } from '../../../interfaces';

@Component({
  selector: 'app-appointment-list',
  standalone: true, // <-- Añade esto
  imports: [ // <-- Añade estos módulos
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
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