import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Therapist } from '../interfaces';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TherapistService {
  constructor(private http: HttpClient) {}
  list(): Observable<Therapist[]> {
    // Si tu app ya antepone '/api' con un interceptor/baseUrl,
    // cambia la URL a 'journal/therapists'
    return this.http.get<Therapist[]>('/api/journal/therapists').pipe(
      tap(list => console.log('therapists:', list)),
      catchError(err => {
        console.error('therapists error', err.status, err.error);
        // devolvemos [] para que el modal muestre "No hay terapeutas disponibles"
        return of([] as Therapist[]);
      })
    );
  }
}
