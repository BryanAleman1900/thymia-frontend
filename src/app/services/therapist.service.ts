import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Therapist } from '../interfaces';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TherapistService {
  constructor(private http: HttpClient) {}
  list(): Observable<Therapist[]> {

    return this.http.get<Therapist[]>('api/journal/therapists').pipe(
      tap(list => console.log('therapists:', list)),
      catchError(err => {
        console.error('therapists error', err.status, err.error);

        return of([] as Therapist[]);
      })
    );
  }
}
