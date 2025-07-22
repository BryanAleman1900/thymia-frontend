import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private timeoutId: any;
  private boundReset!: () => void;

  private readonly timeoutMs = 5000; // 2 minutos

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  initListener(): void {
    console.log('[InactivityService] Listener iniciado');
    this.boundReset = this.resetTimeout.bind(this);
    this.resetTimeout();

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, this.boundReset);
    });
  }

  private resetTimeout(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.stopListener();
          this.authService.logout();
          this.router.navigate(['/login']);
          alert('Sesión cerrada por inactividad.');
        });
      }, this.timeoutMs);
    });
  }

  stopListener(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.boundReset) {
      const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.removeEventListener(event, this.boundReset);
      });
      console.log('[InactivityService] Listener detenido');
    } else {
      console.warn('[InactivityService] No hay listener activo para detener');
    }
  }
}
