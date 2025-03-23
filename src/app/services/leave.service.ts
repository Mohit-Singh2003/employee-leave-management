// leave.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Leave } from '../models/user.model';
import { db } from '../firebase.config';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private leaves: Leave[] = [];
  private leavesSubject = new BehaviorSubject<Leave[]>([]);
  public leaves$ = this.leavesSubject.asObservable();

  constructor() {}

  // Load personal leaves (for employees)
  async loadLeavesForEmployee(): Promise<void> {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const { id: userId } = JSON.parse(user) as { id: string };
      const leaveCollectionRef = collection(db, 'leaves');
      const querySnapshot = await getDocs(leaveCollectionRef);

      const userLeaves: Leave[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const leave = {
          ...data,
          id: doc.id,
          startDate: data['startDate'].toDate(),
          endDate: data['endDate'].toDate(),
        } as Leave;

        if (leave.employeeId === userId) {
          userLeaves.push(leave);
        }
      });

      this.leaves = userLeaves;
      this.leavesSubject.next(userLeaves);
    }
  }

  // Load all leaves (for manager dashboard)
  async loadAllLeaves(): Promise<void> {
    const leaveCollectionRef = collection(db, 'leaves');
    const querySnapshot = await getDocs(leaveCollectionRef);

    const allLeaves: Leave[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const leave = {
        ...data,
        id: doc.id,
        startDate: data['startDate'].toDate(),
        endDate: data['endDate'].toDate(),
      } as Leave;
      allLeaves.push(leave);
    });

    this.leaves = allLeaves;
    this.leavesSubject.next(allLeaves);
  }

  // Add a leave request
  async addLeave(leave: Omit<Leave, 'id' | 'status' | 'isActive'>): Promise<void> {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const { id: userId } = JSON.parse(user) as { id: string };
      const newLeave: Leave = {
        ...leave,
        id: uuidv4(),
        employeeId: userId,
        status: 'Pending',
        isActive: true,
      };

      await setDoc(doc(db, 'leaves', newLeave.id), newLeave);
      this.leaves.push(newLeave);
      this.leavesSubject.next([...this.leaves]);
    }
  }

  // Update leave status (Approve / Reject)
  async updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected'): Promise<void> {
    const leave = this.leaves.find((l) => l.id === leaveId);
    if (leave) {
      leave.status = status;
      await setDoc(doc(db, 'leaves', leaveId), leave);
      this.leavesSubject.next([...this.leaves]);
    }
  }

  // Cancel leave
  async cancelLeave(leaveId: string): Promise<void> {
    const leave = this.leaves.find((l) => l.id === leaveId);
    if (leave) {
      leave.isActive = false;
      await setDoc(doc(db, 'leaves', leaveId), leave);
      this.leavesSubject.next([...this.leaves]);
    }
  }
}
