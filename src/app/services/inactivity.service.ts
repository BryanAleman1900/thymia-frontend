import { Injectable, NgZone } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { NavigationService } from './navigation.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private timeoutId: any;
  private boundReset!: () => void;
  private readonly timeoutMs: number = environment.inactivityTimeoutMs;

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    private ngZone: NgZone
  ) {}

  initListener(): void {
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
          this.navigationService.goToLogin();
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
    }
  }
}