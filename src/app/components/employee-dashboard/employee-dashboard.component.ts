import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models/user.model';
import { LeaveFormComponent } from '../leave-form/leave-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-dashboard',
  template: `
    <nav class="navbar navbar-dark" style="background-color: var(--employee-nav-bg)">
      <div class="container-fluid">
        <button class="btn btn-outline-light" (click)="logout()">Logout</button>
        <span class="navbar-text">Welcome, {{ username }}</span>
      </div>
    </nav>

    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>My Leave History</h2>
        <button class="btn btn-primary" (click)="openLeaveForm()">Apply Leave</button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Leave ID</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let leave of leaves">
              <td>{{ leave.id.substring(0, 8) }}</td>
              <td>{{ leave.type }}</td>
              <td>{{ leave.startDate | date }}</td>
              <td>{{ leave.endDate | date }}</td>
              <td>{{ leave.reason }}</td>
              <td>
                <span [ngClass]="'status-' + leave.status.toLowerCase()">
                  <i class="fas" [ngClass]="{
                    'fa-clock': leave.status === 'Pending',
                    'fa-check': leave.status === 'Approved',
                    'fa-times': leave.status === 'Rejected'
                  }"></i>
                  {{ leave.status }}
                </span>
              </td>
              <td>
                <button *ngIf="leave.status === 'Pending'" class="btn btn-sm btn-danger" (click)="cancelLeave(leave.id)">
                  Cancel
                </button>
              </td>
            </tr>
            <tr *ngIf="leaves.length === 0">
              <td colspan="7" class="text-center">No leave records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for leave form -->
    <div *ngIf="showLeaveForm" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <app-leave-form 
          (close)="closeLeaveForm()" 
          (submit)="onLeaveSubmit($event)">
        </app-leave-form>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, LeaveFormComponent, FormsModule, ReactiveFormsModule, DatePipe]
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  username = '';
  leaves: Leave[] = [];
  showLeaveForm = false;
  private subscription: Subscription = new Subscription();
  private currentUserId: string = '';

  constructor(private authService: AuthService, private leaveService: LeaveService, private router: Router) {}

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.username = user.username;
      this.currentUserId = user.id;

      // ✅ Call the new loadLeavesForEmployee()
      await this.leaveService.loadLeavesForEmployee();

      // Subscribe to observable for real-time updates
      this.subscription = this.leaveService.leaves$.subscribe(allLeaves => {
        this.leaves = allLeaves.filter(leave => leave.employeeId === this.currentUserId && leave.isActive);
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openLeaveForm() {
    this.showLeaveForm = true;
  }

  closeLeaveForm() {
    this.showLeaveForm = false;
  }

  onLeaveSubmit(leaveData: Omit<Leave, 'id' | 'status' | 'isActive'>) {
    this.leaveService.addLeave({ ...leaveData, employeeId: this.currentUserId });
    this.closeLeaveForm();
  }

  cancelLeave(leaveId: string) {
    this.leaveService.cancelLeave(leaveId);
  }
}
