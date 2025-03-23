import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Leave } from '../../models/user.model';

@Component({
  selector: 'app-leave-form',
  template: `
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Apply for Leave</h5>
        <button type="button" class="btn-close" (click)="onClose()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="type" class="form-label">Leave Type</label>
            <select class="form-select" id="type" formControlName="type">
              <option value="">Select Type</option>
              <option value="Parental">Parental Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Paid">Paid Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Earned">Earned Leave</option>
            </select>
            <div *ngIf="submitted && f['type'].errors?.['required']" class="text-danger">
              Leave type is required
            </div>
          </div>

          <div class="mb-3">
            <label for="startDate" class="form-label">Start Date</label>
            <input
              type="date"
              class="form-control"
              id="startDate"
              formControlName="startDate"
              [min]="today"
            >
            <div *ngIf="submitted && f['startDate'].errors?.['required']" class="text-danger">
              Start date is required
            </div>
            <div *ngIf="submitted && f['startDate'].errors?.['pastDateError']" class="text-danger">
              Start date must not be in the past
            </div>
          </div>

          <div class="mb-3">
            <label for="endDate" class="form-label">End Date</label>
            <input
              type="date"
              class="form-control"
              id="endDate"
              formControlName="endDate"
              [min]="f['startDate'].value || today"
            >
            <div *ngIf="submitted && f['endDate'].errors?.['required']" class="text-danger">
              End date is required
            </div>
            <div *ngIf="submitted && f['endDate'].errors?.['dateSequenceError']" class="text-danger">
              End date must be after start date
            </div>
          </div>

          <div class="mb-3">
            <label for="reason" class="form-label">Reason</label>
            <textarea
              class="form-control"
              id="reason"
              rows="3"
              formControlName="reason"
            ></textarea>
            <div *ngIf="submitted && f['reason'].errors?.['required']" class="text-danger">
              Reason is required
            </div>
            <div *ngIf="submitted && f['reason'].errors?.['minlength']" class="text-danger">
              Reason must be at least 9 characters long
            </div>
            <small class="text-muted">{{f['reason'].value?.length || 0}}/9 characters minimum</small>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onClose()">Close</button>
            <button type="submit" class="btn btn-primary" [disabled]="leaveForm.invalid">Submit</button>
          </div>
        </form>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LeaveFormComponent {
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Omit<Leave, 'id' | 'status' | 'isActive'>>();

  leaveForm: FormGroup;
  submitted = false;
  today = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder) {
    this.leaveForm = this.fb.group({
      type: ['', Validators.required],
      startDate: ['', [Validators.required, this.pastDateValidator()]],
      endDate: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(9)]]
    }, { validators: this.dateSequenceValidator });
  }

  get f() {
    return this.leaveForm.controls;
  }

  pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const inputDate = new Date(control.value);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      if (inputDate < currentDate) {
        return { pastDateError: true };
      }
      return null;
    };
  }

  dateSequenceValidator(group: FormGroup): ValidationErrors | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      if (endDateObj < startDateObj) {
        group.get('endDate')?.setErrors({ dateSequenceError: true });
        return { dateSequenceError: true };
      }
    }
    return null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.leaveForm.invalid) {
      return;
    }

    // Convert string dates to Date objects
    const formValue = this.leaveForm.value;
    const leaveData = {
      ...formValue,
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate)
    };

    this.submit.emit(leaveData);
  }

  onClose() {
    this.close.emit();
  }
}