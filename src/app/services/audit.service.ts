import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/';
import { environment } from '../../environments/environment';

export interface AuditLog {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  action: string;
  loginTime: string;
  formattedMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}/admin/audit`;

  constructor(private http: HttpClient) {}

  getLoginLogs(
    page: number = 0,
    size: number = 10,
    action?: string,
    userId?: number,
    startDate?: string,
    endDate?: string
  ): Observable<Page<AuditLog>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (action) params = params.set('action', action);
    if (userId) params = params.set('userId', userId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<Page<AuditLog>>(`${this.apiUrl}/logins`, { params });
  }
}