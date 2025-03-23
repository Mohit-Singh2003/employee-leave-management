import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body p-4">
              <h2 class="text-center mb-4 fw-bold">Login</h2>
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    formControlName="email"
                    [ngClass]="{'is-invalid': submitted && f['email'].errors}"
                  >
                  <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
                    <div *ngIf="f['email'].errors['required']">Email is required</div>
                    <div *ngIf="f['email'].errors['email']">Enter a valid email</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    formControlName="password"
                    [ngClass]="{'is-invalid': submitted && f['password'].errors}"
                  >
                  <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
                    Password is required
                  </div>
                </div>
                
                <button type="submit" class="btn btn-primary w-100 py-2">
                  Login
                </button>
              </form>
              
              <div class="text-center mt-4">
                <p class="mb-0">
                  Not registered yet? <a [routerLink]="['/signup']" class="login-link">Sign up here</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 10px;
      border: none;
    }
    
    .form-control:focus, .form-select:focus {
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    }
    
    .btn-primary {
      background-color: #0d6efd;
      border-color: #0d6efd;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #0b5ed7;
      border-color: #0b5ed7;
    }
    
    .invalid-feedback {
      font-size: 80%;
      color: #dc3545;
      display: block;
    }
    
    .login-link {
      color: #0d6efd;
      text-decoration: none;
      font-weight: 500;
    }
    
    .login-link:hover {
      text-decoration: underline;
    }
  `],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
})
export class LoginComponent {
  loginForm!: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).then((isAuthenticated) => {
      if (isAuthenticated) {
        const user = this.authService.getCurrentUser();
        if (user?.role === 'manager') {
          this.router.navigate(['/manager']);
        } else if (user?.role === 'employee') {
          this.router.navigate(['/employee']);
        }
      } else {
        alert('Invalid credentials');
      }
    }).catch((error) => {
      console.error('Login failed', error);
      alert('An error occurred during login');
    });
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
}
