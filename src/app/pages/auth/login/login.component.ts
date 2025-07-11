import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public loginError!: string;
  public bloqueadoHasta: Date | null = null;
  public tiempoRestante: string= '';
  contadorInterval: any = null;
  public intentosRestantes: number | null = null;
  public porcentajeProgreso: number | null = null;
  private tiempoBloqueo: number = 0;
  @ViewChild('email') emailModel!: NgModel;
  @ViewChild('password') passwordModel!: NgModel;



  public loginForm: { email: string; password: string } = {
    email: '',
    password: '',
  };

  formatFecha(fechaISO: string): string {
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

  iniciarContador(fechaBloqueoISO: string): void {
    this.bloqueadoHasta = new Date(fechaBloqueoISO);

    if (this.contadorInterval) {
      clearInterval(this.contadorInterval);
    }

    const inicio = new Date().getTime();
    const fin = this.bloqueadoHasta.getTime();
    this.tiempoBloqueo = fin - inicio;

    this.contadorInterval = setInterval(() => {
      const ahora = new Date().getTime();
      const fin = this.bloqueadoHasta!.getTime();
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
      this.porcentajeProgreso = 100 -(diferencia / this.tiempoBloqueo) * 100;
    }, 1000);
  }

  constructor(
    private router: Router, 
    private authService: AuthService
  ) {}


  verificarEstadoBloqueo(): void {
    if (!this.loginForm.email) return;

    this.authService.verificarBloqueo(this.loginForm.email).subscribe({
      next: (res) => {
        if (res.message.includes('bloqueado hasta:')) {
          const fechaISO = res.message.split('bloqueado hasta:')[1].trim();
          this.bloqueadoHasta = new Date(fechaISO);
          this.iniciarContador(fechaISO);
        }
      },
      error: () => {}
    });
  }

  ngOnInit(): void {
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
      if (!this.emailModel.valid) {
      this.emailModel.control.markAsTouched();
    }
    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
    }
    if (this.emailModel.valid && this.passwordModel.valid) {
      this.authService.login(this.loginForm).subscribe({
      next: () => this.router.navigateByUrl('/app/dashboard'),
      error: (err: any) => {
      console.log('Error completo: ', err);

      const msg = err?.error?.message || err?.error?.description || 'Error desconocido';

      if (msg.includes('bloqueado hasta:')) {
        const partes = msg.split('bloqueado hasta:');
        const fechaISO = partes[1]?.trim();
        const fecha = this.formatFecha(fechaISO);

        this.loginError = `El usuario está bloqueado hasta: ${fecha}`;
        this.bloqueadoHasta = new Date(fechaISO);
        this.iniciarContador(fechaISO);
        localStorage.setItem('bloqueadoHasta', fechaISO);
        localStorage.setItem('email', this.loginForm.email); // ← AQUI
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
            this.loginError = 'El correo electronico ingresado, no existe en el sistema. Por favor, intente de nuevo.';
            this.bloqueadoHasta = null;
            this.intentosRestantes = null;
            this.tiempoRestante = '';
          }
        }
      });
    } 
  }
}
