import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { IUser } from '../../../../interfaces';
import { LayoutService } from '../../../../services/layout.service';
import { MyAccountComponent } from '../../../my-account/my-account.component';
import { FaceioService } from '../../../../services/faceio.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MyAccountComponent],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent implements OnInit {
  public user?: IUser;

  constructor(
    public layoutService: LayoutService,
    public authService: AuthService,
    private faceioService: FaceioService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }

  public logout(): void {
    this.authService.logout();
    this.faceioService.reset();
    window.location.href = '/login';
  }
}
