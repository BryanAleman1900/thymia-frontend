import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-thymia',
  templateUrl: './thymia-landing.component.html',
  styleUrls: ['./thymia-landing.component.scss'],
  standalone: true
})
export class ThymiaLandingComponent {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  navigateToSection(sectionId: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    const tryScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        return true;
      }
      return false;
    };

    if (tryScroll()) return;

    setTimeout(() => {
      tryScroll();
    }, 0);
  }


  navigateToSignup() {
    this.router.navigateByUrl('/signup');
  }

  navigateToLandingPage() {
    this.router.navigateByUrl('/landing');
  }

  navigateToLogin() {
    this.router.navigateByUrl('/login');
  }
}
