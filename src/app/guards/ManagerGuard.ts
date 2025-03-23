import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ManagerGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'manager') {
      return true;
    }

    // Redirect to login or a "not authorized" page
    this.router.navigate(['/login']); // Or a /not-authorized route
    return false;
  }
}