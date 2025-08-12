import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/';

export interface AuditLog {
  id: number;
  user: { id: number; name: string; email: string; } | null;
  action: string;
  loginTime: string | Date;
  formattedMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  getLoginLogs(
    page: number = 1,
    size: number = 10,
    action?: string,
    userId?: string | number,
    startDate?: string,
    endDate?: string
  ): Observable<Page<AuditLog>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    const endpoint='admin/audit/logins';
    if (action) params = params.set('action', action);
    if (userId !== undefined && userId !== null && userId !== '') {
      params = params.set('userId', userId.toString());
    }
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<Page<AuditLog>>(endpoint, { params });
  }
}