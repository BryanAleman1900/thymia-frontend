import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, NgZone } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FaceioService } from '../../../services/faceio.service';
import { InactivityService } from '../../../services/inactivity.service';

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

  public bloqueadoHasta: Date | null = null;
  public tiempoRestante: string = '';
  public intentosRestantes: number | null = null;
  public porcentajeProgreso: number | null = null;
  private tiempoBloqueo: number = 0;
  private contadorInterval: any = null;

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
    private inactivityService: InactivityService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
     this.faceio.reset();
    const waitForGoogle = () => {
      if (typeof google !== 'undefined' && google.accounts?.id) {
        google.accounts.id.initialize({
          client_id: '82191624415-m9dki2mc78iuloiig6oo6cn0s8mg1sf6.apps.googleusercontent.com',
          callback: this.handleGoogleCallback.bind(this),
        });

        const googleBtn = document.getElementById('googleBtn');
        if (googleBtn) {
          google.accounts.id.renderButton(googleBtn, { theme: 'outline', size: 'large' });
        } else {
          console.error('Elemento #googleBtn no encontrado en el DOM');
        }
      } else {
        console.warn('Google SDK aún no disponible, reintentando...');
        setTimeout(waitForGoogle, 100);
      }
    };

    waitForGoogle();

    const emailGuardado = localStorage.getItem('email');
    const fechaBloqueoGuardada = localStorage.getItem('bloqueadoHasta');

    if (fechaBloqueoGuardada && emailGuardado) {
      const fecha = new Date(fechaBloqueoGuardada);

      if (fecha > new Date()) {
        this.authService.verificarBloqueo(emailGuardado).subscribe({
          next: (res) => {
            if (res.message.includes('bloqueado hasta:')) {
              this.bloqueadoHasta = fecha;
              this.iniciarContador(fecha.toISOString());
            } else {
              localStorage.removeItem('bloqueadoHasta');
              localStorage.removeItem('email');
            }
          },
          error: () => {
            localStorage.removeItem('bloqueadoHasta');
            localStorage.removeItem('email');
          }
        });
      } else {
        localStorage.removeItem('bloqueadoHasta');
        localStorage.removeItem('email');
      }
    }
  }

  public handleLogin(event: Event) {
    event.preventDefault();
    if (!this.emailModel.valid) this.emailModel.control.markAsTouched();
    if (!this.passwordModel.valid) this.passwordModel.control.markAsTouched();

    if (this.emailModel.valid && this.passwordModel.valid) {
      this.authService.login(this.loginForm).subscribe({
        next: () => {
          this.ngZone.run(() => this.router.navigateByUrl('/app/dashboard'));
          this.inactivityService.initListener();
        },
        error: (err: any) => {
          const msg = err?.error?.message || err?.error?.description || 'Error desconocido';

          if (msg.includes('bloqueado hasta:')) {
            const partes = msg.split('bloqueado hasta:');
            const fechaISO = partes[1]?.trim();
            const fecha = this.formatFecha(fechaISO);

            this.loginError = `El usuario está bloqueado hasta: ${fecha}`;
            this.bloqueadoHasta = new Date(fechaISO);
            this.iniciarContador(fechaISO);
            localStorage.setItem('bloqueadoHasta', fechaISO);
            localStorage.setItem('email', this.loginForm.email);
            this.intentosRestantes = null;

          } else if (msg.includes('credenciales ingresadas son inválidas')) {
            this.loginError = 'Contraseña Incorrecta.';

            const match = msg.match(/Intentos fallidos:\s*(\d+)/);
            if (match && match[1]) {
              const intentosFallidos = parseInt(match[1]);
              this.intentosRestantes = 4 - intentosFallidos;
            } else {
              this.intentosRestantes = null;
            }

            this.bloqueadoHasta = null;
            this.tiempoRestante = '';

          } else {
            this.loginError = 'El Correo o la Contraseña son incorrectos. Por favor, intente de nuevo.';
            this.bloqueadoHasta = null;
            this.intentosRestantes = null;
            this.tiempoRestante = '';
          }
        }
      });
    }
  }

  public handleGoogleCallback(response: any) {
    const idToken = response.credential;
    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => this.ngZone.run(() => this.router.navigateByUrl('/app/dashboard')),
      error: () => (this.loginError = 'Google login failed'),
    });
  }

  public activateBiometric(): void {
    this.faceIDActive = true;
    this.showFaceIDMessage = true;

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
          this.showFaceIDMessage = true;
        }
      });
    }).catch((err) => {
      console.error(err);
      this.loginError = 'No se pudo autenticar con Face ID';
      this.faceIDActive = false;
      this.showFaceIDMessage = true;
    });
  }

  private iniciarContador(fechaBloqueoISO: string): void {
    this.bloqueadoHasta = new Date(fechaBloqueoISO);
    if (this.contadorInterval) clearInterval(this.contadorInterval);

    const inicio = new Date().getTime();
    const fin = this.bloqueadoHasta.getTime();
    this.tiempoBloqueo = fin - inicio;

    this.contadorInterval = setInterval(() => {
      const ahora = new Date().getTime();
      const diferencia = fin - ahora;

      if (diferencia <= 0) {
        this.tiempoRestante = '';
        clearInterval(this.contadorInterval);
        this.loginError = '';
        this.bloqueadoHasta = null;
        this.porcentajeProgreso = null;
        localStorage.removeItem('bloqueadoHasta');
        return;
      }

      const minutos = Math.floor(diferencia / 60000);
      const segundos = Math.floor((diferencia % 60000) / 1000);
      this.tiempoRestante = `${minutos}m ${segundos < 10 ? '0' : ''}${segundos}s`;
      this.porcentajeProgreso = 100 - (diferencia / this.tiempoBloqueo) * 100;
    }, 1000);
  }

  private formatFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}