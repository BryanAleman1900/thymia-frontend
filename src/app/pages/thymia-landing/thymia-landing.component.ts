import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-thymia-landing',
  templateUrl: './thymia-landing.component.html',
  styleUrls: ['./thymia-landing.component.scss'],
  standalone: true
})
export class ThymiaLandingComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']); // Cambia esto si tu ruta de acceso es distinta
  }
}
