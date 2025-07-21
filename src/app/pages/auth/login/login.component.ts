import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, NgZone } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FaceioService } from '../../../services/faceio.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public loginError!: string;
  public faceIDActive = false;
  public showFaceIDMessage = true;

  @ViewChild('email') emailModel!: NgModel;
  @ViewChild('password') passwordModel!: NgModel;

  public loginForm = {
    email: '',
    password: '',
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private faceio: FaceioService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Inicializar Google
    setTimeout(() => {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: '82191624415-m9dki2mc78iuloiig6oo6cn0s8mg1sf6.apps.googleusercontent.com',
          callback: this.handleGoogleCallback.bind(this),
        });

        google.accounts.id.renderButton(
          document.getElementById('googleBtn'),
          { theme: 'outline', size: 'large' }
        );
      } else {
        console.error('Google SDK no está disponible');
      }
    }, 0);
  }

  public handleLogin(event: Event) {
    event.preventDefault();
    if (!this.emailModel.valid) this.emailModel.control.markAsTouched();
    if (!this.passwordModel.valid) this.passwordModel.control.markAsTouched();

    if (this.emailModel.valid && this.passwordModel.valid) {
      this.authService.login(this.loginForm).subscribe({
        next: () => this.ngZone.run(() => this.router.navigateByUrl('/app/dashboard')),
        error: (err: any) => (this.loginError = err.error.description),
      });
    }
  }

  // Google login
  public handleGoogleCallback(response: any) {
    const idToken = response.credential;
    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => this.ngZone.run(() => this.router.navigateByUrl('/app/dashboard')),
      error: () => (this.loginError = 'Google login failed'),
    });
  }

  // Face ID login
  public activateBiometric(): void {
    this.faceIDActive = true;
    this.showFaceIDMessage = true;

    // Ocultar el mensaje facial luego de 3 segundos
    setTimeout(() => {
      this.showFaceIDMessage = false;
    }, 3000);

    this.faceio.authenticate().then((facialId: string) => {
      this.authService.loginWithFacialId(facialId).subscribe({
        next: () => this.ngZone.run(() => this.router.navigateByUrl('/app/dashboard')),
        error: (err: any) => {
          console.error(err);
          this.loginError = 'Biometric login failed';
          this.faceIDActive = false;
          this.showFaceIDMessage = true; // Mostrar mensaje en nuevo intento
        }
      });
    }).catch((err) => {
      console.error(err);
      this.loginError = 'No se pudo autenticar con Face ID';
      this.faceIDActive = false;
      this.showFaceIDMessage = true; // Mostrar mensaje en nuevo intento
    });
  }
}
