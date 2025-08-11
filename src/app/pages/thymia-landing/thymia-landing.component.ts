import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-thymia',
  templateUrl: './thymia-landing.component.html',
  styleUrls: ['./thymia-landing.component.scss'],
  standalone: true
})
export class ThymiaLandingComponent {
  constructor(private router: Router) {}

    navigateToLogin() {
    this.router.navigateByUrl('/login');
  }


  navigateToNexus() {
    this.router.navigateByUrl('/landing');
  }
}
