import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, IUser } from '../interfaces';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AlertService } from './alert.service';
import { HttpParams } from '@angular/common/http';

type RoleName = 'USER' | 'THERAPIST';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<IUser> {
  protected override source: string = 'users';

  private userListSignal = signal<IUser[]>([]);
  get users$() {
    return this.userListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 10,       
    totalPages: 1,
    totalElements: 0,
    pageNumber: 1,
    pageSize: 10,
  };
  public query = ''; 

  private alertService: AlertService = inject(AlertService);

  list(opts?: { page?: number; size?: number; q?: string; sortBy?: string; sortDir?: 'asc' | 'desc' })
    : Observable<{ data: IUser[]; meta: any }> {

    const page = opts?.page ?? this.search.page ?? 1;
    const size = opts?.size ?? this.search.size ?? 10;
    const q = (opts?.q ?? this.query ?? '').trim();
    const sortBy = opts?.sortBy ?? 'createdAt';
    const sortDir = opts?.sortDir ?? 'desc';

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('q', q);

    return this.http.get<{ data: IUser[]; meta: any }>(`${this.source}`, { params }).pipe(
      tap((response) => {
        this.userListSignal.set(response.data || []);
        if (response.meta) {
          this.search.page = response.meta.pageNumber ?? page;
          this.search.pageNumber = response.meta.pageNumber ?? page;
          this.search.size = response.meta.pageSize ?? size;
          this.search.pageSize = response.meta.pageSize ?? size;
          this.search.totalPages = response.meta.totalPages ?? 1;
          this.search.totalElements = response.meta.totalElements ?? 0;
        } else {
          this.search.page = page;
          this.search.size = size;
          this.search.totalPages = 1;
          this.search.totalElements = (response.data || []).length;
        }
        this.query = q;
      }),
      catchError(err => {
        this.alertService.displayAlert('error', 'Error al cargar usuarios', 'center', 'top', ['error-snackbar']);
        return throwError(() => err);
      })
    );
  }

  getAll(): Observable<{ data: IUser[] }> {
    return this.http.get<{ data: IUser[] }>(`${this.source}`).pipe(
      tap(response => {
        this.userListSignal.set(response.data);
      }),
      catchError(err => {
        this.alertService.displayAlert('error', 'Error al cargar usuarios', 'center', 'top', ['error-snackbar']);
        return throwError(() => err);
      })
    );
  }

  save(user: IUser) {
    this.add(user).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.list({ page: this.search.page, size: this.search.size, q: this.query }).subscribe();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred adding the user','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(user: IUser) {
    this.editCustomSource(`${user.id}`, user).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.list({ page: this.search.page, size: this.search.size, q: this.query }).subscribe();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred updating the user','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(user: IUser) {
    this.delCustomSource(`${user.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        const willBeEmpty = this.users$().length <= 1 && (this.search.page ?? 1) > 1;
        const nextPage = willBeEmpty ? (this.search.page! - 1) : this.search.page!;
        this.list({ page: nextPage, size: this.search.size, q: this.query }).subscribe();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'No se pudo eliminar el usuario','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  changeRole(userId: number, targetRole: RoleName) {
    this.http.put<any>(`${this.source}/${userId}/role`, { role: targetRole }).pipe(
      tap((response: any) => {
        const msg = response?.message ?? `Rol actualizado a ${targetRole}`;
        this.alertService.displayAlert('success', msg, 'center', 'top', ['success-snackbar']);
        this.list({ page: this.search.page, size: this.search.size, q: this.query }).subscribe();
      }),
      catchError((err: any) => {
        this.alertService.displayAlert('error', 'No se pudo cambiar el rol','center', 'top', ['error-snackbar']);
        console.error('changeRole error', err);
        return throwError(() => err);
      })
    ).subscribe();
  }
}
