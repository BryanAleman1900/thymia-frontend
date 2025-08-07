import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IFeedback } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'api/feedbacks';

  constructor(private http: HttpClient) {}

  createFeedback(appointmentId: number, comments: string, rating: number): Observable<IFeedback> {
    return this.http.post<IFeedback>(this.apiUrl, {
      appointmentId,
      comments,
      rating
    });
  }

  getAppointmentFeedbacks(appointmentId: number): Observable<IFeedback[]> {
    return this.http.get<IFeedback[]>(`${this.apiUrl}/by-appointment/${appointmentId}`);
  }
}