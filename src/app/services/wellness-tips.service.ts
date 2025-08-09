import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface WellnessTip {
  id: number;
  title: string;
  content: string;
  category?: string;
  source?: string;
  createdAt: string;      
  firstViewedAt?: string; 
  lastViewedAt?: string;  
  viewCount: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; 
}

@Injectable({ providedIn: 'root' })
export class WellnessTipsService {
  private apiUrl = 'api/wellness';

  constructor(private http: HttpClient) {}

  getMyTips(page = 0, size = 10) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<WellnessTip>>(this.apiUrl, { params });
  }

  viewTip(id: number) {
    return this.http.post<WellnessTip>(`${this.apiUrl}/${id}/view`, {});
  }
}
