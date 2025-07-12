import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { NavbarComponent } from './components/navbar/navbar.component';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Guards
import { RoleGuard } from './guards/role.guard';

// Services
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    AuthService,
    RoleGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

