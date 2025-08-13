import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true
})
export class LandingComponent {
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

    setTimeout(() => tryScroll(), 0);
  }

  navigateToLogin() {
    this.router.navigateByUrl('/login');
  }
}
