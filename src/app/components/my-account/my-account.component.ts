import { Component, OnInit, HostListener, ElementRef, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { InactivityService } from "../../services/inactivity.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-my-account",
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.scss"],
})
export class MyAccountComponent implements OnInit {
  public userName: string = '';
  public dropdownOpen = false;

  private service = inject(AuthService);
  private inactivityService = inject(InactivityService);
  private eRef = inject(ElementRef);

  constructor(public router: Router) {
    let user = localStorage.getItem('auth_user');
    if(user) {
      this.userName = JSON.parse(user)?.name;
    }
  }

  ngOnInit() {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.inactivityService.stopListener();
    this.service.logout();
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }
}
