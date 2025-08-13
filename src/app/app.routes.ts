import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { SigUpComponent } from './pages/auth/sign-up/signup.component';
import { UsersComponent } from './pages/users/users.component';
import { AuthGuard } from './guards/auth.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GuestGuard } from './guards/guest.guard';
import { IRoleType } from './interfaces';
import { ProfileComponent } from './pages/profile/profile.component';
import { EmotionDetectorComponent } from './pages/emotion-detector/emotion-detector.component';
import { AppointmentComponent } from './pages/appointment/appointment.component';
import { CallComponent } from './pages/call/call.component';
import { JournalComponent } from './pages/journal/journal.component';
import { WellnessHistoryComponent } from './pages/wellness/wellness-history.component';
import { ThymiaLandingComponent } from './pages/thymia-landing/thymia-landing.component';
import { LandingComponent } from './pages/landingpage/landing.component';
import { SharedWithMeComponent } from './pages/journal/shared-with-me.component';


export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'signup',
    component: SigUpComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },
  {
    path: '',
    redirectTo: 'thymia',
    pathMatch: 'full',
  },

  {
          path: 'thymia',
          component: ThymiaLandingComponent,
      },

            {
          path: 'landing',
          component: LandingComponent,
      },

  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'app',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AdminRoleGuard],
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin
          ],
          name: 'Users',
          showInSidebar: true
        }
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.therapist
          ],
          name: 'Dashboard',
          showInSidebar: true
        }
      },

      { path: 'wellness', 
        component: WellnessHistoryComponent, 
        data: {
            authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Historial de Consejos Wellness',
          showInSidebar: true
        }
      },

      {
          path: 'journal',
          component: JournalComponent,
          data: {
            authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Diario emocional',
          showInSidebar: true
        }
      },

      { 
        path: 'shared',
        component: SharedWithMeComponent,
        data: {
            authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user
          ]
          }
      },

      {
        path: 'profile',
        component: ProfileComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.therapist
          ],
          name: 'Profile',
          showInSidebar: false
        }
      },
      {
        path: 'emotion-detector',
        component: EmotionDetectorComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.therapist
          ],
          name: 'Emotion Detector',
          showInSidebar: false 
        }
      },
      {
        path: 'appointment',
        component: AppointmentComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.therapist
          ],
          name: 'Appointment',
          showInSidebar: true
        }
      },
      {
        path: 'call',
        component: CallComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.therapist
          ],
          name: 'Llamada',
          showInSidebar: false
        }
      }
    ],
  },
];