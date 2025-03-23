import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body p-4">
              <h2 class="text-center mb-4 fw-bold">Sign Up</h2>
              
              <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    formControlName="email"
                    [ngClass]="{'is-invalid': (submitted || formControls['email'].touched) && formControls['email'].errors}"
                  >
                  <div *ngIf="(submitted || formControls['email'].touched) && formControls['email'].errors" class="invalid-feedback">
                    <div *ngIf="formControls['email'].errors['required']">Email is required</div>
                    <div *ngIf="formControls['email'].errors['email']">Please enter a valid email address</div>
                    <div *ngIf="formControls['email'].errors['minlength']">Email must be at least 5 characters</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    formControlName="password"
                    [ngClass]="{'is-invalid': (submitted || formControls['password'].touched) && formControls['password'].errors}"
                  >
                  <div *ngIf="(submitted || formControls['password'].touched) && formControls['password'].errors" class="invalid-feedback">
                    <div *ngIf="formControls['password'].errors['required']">Password is required</div>
                    <div *ngIf="formControls['password'].errors['minlength']">
                      Password must be at least {{formControls['password'].errors['minlength'].requiredLength}} characters
                    </div>
                    <div *ngIf="formControls['password'].errors['pattern']">
                      Password must contain at least one letter and one number
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword" 
                    formControlName="confirmPassword"
                    [ngClass]="{'is-invalid': (submitted || formControls['confirmPassword'].touched) && formControls['confirmPassword'].errors}"
                  >
                  <div *ngIf="(submitted || formControls['confirmPassword'].touched) && formControls['confirmPassword'].errors" class="invalid-feedback">
                    <div *ngIf="formControls['confirmPassword'].errors['required']">
                      Confirm Password is required
                    </div>
                    <div *ngIf="formControls['confirmPassword'].errors['mustMatch']">
                      Passwords must match
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label for="role" class="form-label">Role</label>
                  <select 
                    class="form-select" 
                    id="role" 
                    formControlName="role"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-primary w-100 py-2"
                >
                  Sign Up
                </button>
              </form>
              
              <div class="text-center mt-4">
                <p class="mb-0">
                  Already a user? <a [routerLink]="['/login']" class="login-link">Login here</a>
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
    
    .btn-primary:disabled {
      opacity: 0.65;
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
export class SignupComponent {
  signupForm!: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {
    this.initializeForm();
  }

  get formControls() {
    return this.signupForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.signupForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.formControls).forEach(key => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const { email, password, role } = this.signupForm.value;

    this.authService.signup(email, password, role)
      .then(() => {
        const route = role === 'manager' ? '/manager' : '/employee';
        this.router.navigate([route]);
      })
      .catch((error: any) => {
        alert(error.message);
      });
  }

  private initializeForm(): void {
    this.signupForm = this.formBuilder.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.minLength(5)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', Validators.required],
      role: ['employee']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if password and confirm password match
  private passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.errors && !confirmPassword.errors['mustMatch']) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mustMatch: true });
      return { mustMatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }
}