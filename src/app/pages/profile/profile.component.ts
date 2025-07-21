import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { FaceioService } from '../../services/faceio.service';

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

  constructor() {
    this.profileService.getUserInfoSignal();
  }

  //Activar Face ID
  public enableFaceID(): void {
    this.faceio.enroll().then((facialId: string) => {
      this.profileService.registerFaceID(facialId);
    }).catch((err: any) => {
      console.error('Error al registrar Face ID con FaceIO:', err);
    });
  }
}
