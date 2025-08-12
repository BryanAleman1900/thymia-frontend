import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { FaceioService } from '../../services/faceio.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { IRoleType } from '../../interfaces';

import { AdminUserPanelComponent } from '../../components/admin-user-panel/admin-user-panel.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, AdminUserPanelComponent, MatSnackBarModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  public profileService = inject(ProfileService);
  public faceio = inject(FaceioService);
  private snackBar = inject(MatSnackBar);
  private auth = inject(AuthService);

  constructor() {
    this.profileService.getUserInfoSignal();
  }

  public get isAdmin(): boolean {
    return this.auth.hasRole(IRoleType.admin) || this.auth.isSuperAdmin();
  }

  public get showActivateFaceIDButton(): boolean {
    const u = this.profileService.user$();
    return !u?.faceIdValue || u.faceIdValue.trim() === '';
  }

  public enableFaceID(): void {
    this.faceio.enroll().then((facialId: string) => {
      this.profileService.registerFaceID(facialId);
    }).catch((err: any) => {
      console.error('Error al registrar Face ID con FaceIO:', err);

      const snackBarRef = this.snackBar.open(
        'Error al registrar Face ID. ¿Reintentar?', 'Sí',
        { duration: 6000, panelClass: ['faceid-error-snackbar'] }
      );

      snackBarRef.onAction().subscribe(() => this.enableFaceID());
    });
  }
}
