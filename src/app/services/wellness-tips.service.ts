import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WellnessTipReceipt } from '../interfaces'
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class WellnessTipsService {
  private apiUrl = 'api/wellness';
    
  constructor(private http: HttpClient) {}

  
  getMyTips(page?: number, size?: number) {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page);
    if (size !== undefined) params = params.set('size', size);
    return this.http.get(this.apiUrl, { params });
  }

  viewTip(id: number) {
    return this.http.post(`${this.apiUrl}/${id}/view`, {});
  }
}
