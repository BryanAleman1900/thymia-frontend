import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true 
})
export class LandingComponent { 
  constructor(private router: Router) {}
  navigateToThymia() {
    this.router.navigateByUrl('/thymia');
  }
}

