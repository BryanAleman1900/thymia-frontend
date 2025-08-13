import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JournalEntry } from '../interfaces'
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { SharedJournalEntry } from '../interfaces/index';

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

  share(id: number, emails: string[]) {
    return this.http.post(`${this.apiUrl}/${id}/share`, { therapistEmails: emails });
  }

  revoke(id: number, email: string) {
    const params = new HttpParams().set('therapistEmail', email);
    return this.http.delete(`${this.apiUrl}/${id}/share`, { params });
  }

  getSharedWithMe() {
    return this.http.get<SharedJournalEntry[]>(`${this.apiUrl}/shared-with-me`);
  }
}

