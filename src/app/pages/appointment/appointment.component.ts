import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarModule } from '@fullcalendar/angular';

@Component({
  standalone: true,
  imports: [FullCalendarModule],
  selector: 'app-appointment',
  templateUrl: './appointment.component.html'
})
export class AppointmentComponent {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: []
  };
}