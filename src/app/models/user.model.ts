// user.model.ts

export interface User {
  id: string; // Firebase UID
  username: string; // Derived from email or custom username
  role: 'employee' | 'manager'; // Role-based access (employee or manager)
}

export interface Leave {
  id: string; // Firestore document ID
  employeeId: string; // UID of the employee from the User model
  type: 'Parental' | 'Sick' | 'Paid' | 'Casual' | 'Earned'; // Type of leave
  startDate: Date; // Start date of leave (Firebase Timestamp converted to Date)
  endDate: Date; // End date of leave (Firebase Timestamp converted to Date)
  reason: string; // Reason for leave
  status: 'Pending' | 'Approved' | 'Rejected'; // Status of leave request
  isActive: boolean; // To check if the leave is still valid or has been canceled
}
