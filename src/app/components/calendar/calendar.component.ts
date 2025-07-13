
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  googleCalendarUrl: SafeResourceUrl = '' as SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.loadCalendar();
  }

  loadCalendar(): void {
    const calendarSrc = 'https://calendar.google.com/calendar/embed?src=thymiaoficial%40gmail.com&ctz=America%2FCosta_Rica';
    this.googleCalendarUrl = this.sanitizer.bypassSecurityTrustResourceUrl(calendarSrc);
  }
}