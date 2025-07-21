import { Injectable, inject, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IUser } from '../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseService<IUser> {
  protected override source: string = 'users/me';

  private userSignal = signal<IUser>({});
  private snackBar = inject(MatSnackBar);

  get user$() {
    return this.userSignal;
  }

  getUserInfoSignal() {
    this.findAll().subscribe({
      next: (response: any) => {
        this.userSignal.set(response);
      },
      error: (error: any) => {
        this.snackBar.open(
          `Error getting user profile info: ${error.message}`,
          'Close',
          {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  //registrar rostro
  registerFaceID(facialId: string) {
    const customPath = 'face-id/register'; 
    const body = { facialId: facialId };

    this.addCustomSource(customPath, body).subscribe({
      next: () => {
        this.snackBar.open(
          'Rostro registrado con éxito',
          'Cerrar',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        this.snackBar.open(
          `Error al registrar rostro: ${error.message}`,
          'Cerrar',
          {
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }
}
