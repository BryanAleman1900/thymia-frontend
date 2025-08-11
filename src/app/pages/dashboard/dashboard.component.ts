import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  constructor(private router: Router) {}

    goToWellnessHistory() {
    this.router.navigate(['/app/wellness']);
  }

  goToJournal() {
  this.router.navigate(['/app/journal']);
}

  goToVideoCall(): void {
    this.router.navigate(['/app/call']);
  }
}
