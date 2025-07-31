import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CalendarOptions, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentService } from '../../services/appointment.service';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentFormComponent } from '../../components/appointment/appointment-form/appointment-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  extendedProps: {
    description: string;
    patient: any;
    doctor: any;
    guests: any[];
  };
}

interface AppointmentData {
  id?: string;
  title?: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  patient?: any;
  doctor?: any;
  guests?: any[];
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule, 
    MatIconModule,
    CommonModule
  ],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: any;  // Tipo any temporal para evitar errores

  private appointmentService = inject(AppointmentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true, 
    selectable: true,
    events: this.loadEvents.bind(this),
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    eventBackgroundColor: '#3788d8',
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: true }
  };

  ngOnInit(): void {}

  loadEvents(info: { start: Date; end: Date }, callback: (events: CalendarEvent[]) => void) {
    this.appointmentService.getAppointments(info.start, info.end).subscribe({
      next: (events) => {
        const formattedEvents: CalendarEvent[] = events.map(event => ({
          id: event.id.toString(),
          title: event.title,
          start: event.startTime,
          end: event.endTime,
          extendedProps: {
            description: event.description || '',
            patient: event.patient || null,
            doctor: event.doctor || null,
            guests: event.guests || []
          }
        }));
        callback(formattedEvents);
      },
      error: (err) => {
        this.showError('Error al cargar citas');
        callback([]);
      }
    });
  }

  handleDateClick(arg: DateClickArg) {
  this.openAppointmentForm({
    startTime: new Date(arg.dateStr), 
    endTime: new Date(new Date(arg.dateStr).getTime() + 60 * 60 * 1000) 
  });
}

  handleEventClick(info: EventClickArg) {
    const event = info.event as unknown as CalendarEvent;
    this.openAppointmentForm({
      id: event.id,
      title: event.title,
      startTime: new Date(event.start as Date),
      endTime: event.end ? new Date(event.end) : new Date(new Date(event.start as Date).getTime() + 60 * 60 * 1000),
      description: event.extendedProps.description,
      patient: event.extendedProps.patient,
      doctor: event.extendedProps.doctor,
      guests: event.extendedProps.guests
    });
  }

  handleEventDrop(dropInfo: EventDropArg) {
    const event = dropInfo.event as unknown as CalendarEvent;
    this.appointmentService.updateAppointment(event.id, {
      startTime: event.start,
      endTime: event.end
    }).subscribe({
      next: () => this.showSuccess('Cita reagendada'),
      error: () => {
        this.refreshCalendar();
        this.showError('Error al actualizar cita');
      }
    });
  }

 handleEventResize(resizeInfo: EventResizeDoneArg) {
  const event = resizeInfo.event as unknown as CalendarEvent;

  this.appointmentService.updateAppointment(event.id, {
    startTime: event.start,
    endTime: event.end
  }).subscribe({
    next: () => this.showSuccess('Cita redimensionada'),
    error: () => {
      this.refreshCalendar();
      this.showError('Error al actualizar cita redimensionada');
    }
  });
}

  openAppointmentForm(data?: AppointmentData) {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '600px',
      data: data || { startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000) }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshCalendar();
        this.showSuccess(result.message);
      }
    });
  }

  refreshCalendar() {
    this.calendarComponent?.getApi()?.refetchEvents();
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
  }
}