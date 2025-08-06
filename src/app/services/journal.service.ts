import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JournalEntry } from '../interfaces'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private apiUrl = 'api/journal';

  constructor(private http: HttpClient) {}

  createEntry(content: string): Observable<any> {
    return this.http.post(this.apiUrl, { content });
  }

  getMyEntries(): Observable<JournalEntry[]> {
  return this.http.get<JournalEntry[]>(this.apiUrl);
}
}
