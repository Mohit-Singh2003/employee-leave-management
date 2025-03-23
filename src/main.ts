import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes, RouterOutlet } from '@angular/router';
import { LoginComponent } from './app/components/login/login.component';
import { SignupComponent } from './app/components/signup/signup.component';
import { AuthGuard } from './app/guards/auth.guard';
import { ManagerGuard } from './app/guards/ManagerGuard';
import { EmployeeGuard } from './app/guards/EmployeeGuard';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // ✅ Import HttpClientModule

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  standalone: true,
  imports: [RouterOutlet] // ✅ Ensure RouterOutlet is imported and added here
})
export class App {}

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '',   redirectTo: '/login', pathMatch: 'full' }, // Redirect to login by default
  { path: 'employee',
    loadComponent: () => import('./app/components/employee-dashboard/employee-dashboard.component')
      .then(m => m.EmployeeDashboardComponent),
    canActivate: [AuthGuard, EmployeeGuard] // Apply EmployeeGuard
  },
  { path: 'manager',
    loadComponent: () => import('./app/components/manager-dashboard/manager-dashboard.component')
      .then(m => m.ManagerDashboardComponent),
    canActivate: [AuthGuard, ManagerGuard] // Apply ManagerGuard
  }
];

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(HttpClientModule),  // ✅ Include HttpClientModule here
    provideRouter(routes)
  ]
})
  .catch(err => console.error(err));
