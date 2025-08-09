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
import { JournalComponent } from './pages/journal/journal.component';
import { WellnessHistoryComponent } from './pages/wellness/wellness-history.component';
//import { AdminDashboardComponent } from './pages/admin-dashboard/admin.service';



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
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'app',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate:[AdminRoleGuard],
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
            IRoleType.user
          ],
          name: 'Dashboard',
          showInSidebar: true
        }
      },
      //{
      //  path: 'landingpage',
      //  loadComponent: () => import('./pages/landingpage/landing.component').then(m => m.LandingComponent)
      //},

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
        path: 'profile',
        component: ProfileComponent,
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'profile',
          showInSidebar: false
        }
      },
      {
      path: 'emotion-detector',
      component: EmotionDetectorComponent
      },
      {
        path: 'appointment',
        component: AppointmentComponent,
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Appointment',
          showInSidebar: true
        }
      }
    ],
  },
];
