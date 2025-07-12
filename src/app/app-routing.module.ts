import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar.component';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  {
    path: 'calendar',
    component: CalendarComponent,
    canActivate: [RoleGuard],
    data: { roles: ['paciente', 'profesional'] } // roles permitidos
  },
  
  { path: '**', redirectTo: '/calendar' } // Ruta por defecto
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
