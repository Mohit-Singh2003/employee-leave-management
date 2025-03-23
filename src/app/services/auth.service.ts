import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config'; // Assuming you have Firebase config imported here

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Login a user
  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (userDoc.exists()) {
        const { role, username } = userDoc.data() as { role: 'employee' | 'manager'; username: string };

        const user: User = {
          id: userCredential.user.uid,
          username,
          role
        };

        // Update the BehaviorSubject and localStorage
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));

        return true;
      } else {
        console.error('User data not found in Firestore');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        alert('User not found');
      } else if (error.code === 'auth/wrong-password') {
        alert('Wrong password');
      } else {
        alert('An error occurred during login');
      }
      return false;
    }
  }

  // Get current logged-in user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Logout the user
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Register a new user
  async register(email: string, password: string, role: 'employee' | 'manager'): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = {
        id: userCredential.user.uid,
        username: email.split('@')[0], // Derive username from email
        role,
      };

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.id), user);

      // Update the BehaviorSubject and localStorage
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      alert('An error occurred during registration');
      return false;
    }
  }

  // Fix the signup method by linking it to the register method
  signup(email: string, password: string, role: 'employee' | 'manager'): Promise<boolean> {
    return this.register(email, password, role);
  }
}
