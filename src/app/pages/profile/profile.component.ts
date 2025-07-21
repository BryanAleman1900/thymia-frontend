import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { FaceioService } from '../../services/faceio.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  public profileService = inject(ProfileService);
  public faceio = inject(FaceioService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.profileService.getUserInfoSignal();
  }

  // Activar Face ID con manejo de error y opción de reintentar
  public enableFaceID(): void {
    this.faceio.enroll().then((facialId: string) => {
      this.profileService.registerFaceID(facialId);
    }).catch((err: any) => {
      console.error('Error al registrar Face ID con FaceIO:', err);

      const snackBarRef = this.snackBar.open(
        'Error al registrar Face ID. ¿Reintentar?', 'Sí',
        {
          duration: 6000,
          panelClass: ['faceid-error-snackbar']
        }
      );

      snackBarRef.onAction().subscribe(() => {
        this.enableFaceID(); // Reintenta el registro
      });
    });
  }
}
