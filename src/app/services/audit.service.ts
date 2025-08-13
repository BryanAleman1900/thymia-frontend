import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/';

export interface AuditLog {
  id: number;
  user: { id: number; name: string; email: string; } | null;
  action: string;
  loginTime: string | Date;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  getLoginLogs(
    page: number = 1,
    size: number = 10
  ): Observable<Page<AuditLog>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<AuditLog>>('admin/audit/logins', { params });
  }
}