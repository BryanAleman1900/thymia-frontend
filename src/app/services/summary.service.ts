import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CallSummary {
  roomId: string;
  transcript: string;
  emotionCounts: { [emotion: string]: number };
  segments: Array<{
    id: number;
    text: string;
    timestamp: string;
    user?: any;
  }>;
  emotions: Array<{
    id: number;
    emotion: string;
    timestamp: string;
    user?: any;
  }>;
}

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private http = inject(HttpClient);

  getSummary(roomId: string): Observable<CallSummary> {
    return this.http.get<CallSummary>(`calls/${roomId}/summary`);
  }
}
