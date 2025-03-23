import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
const firebaseConfig = {
  apiKey: "AIzaSyDV4nPGWcqH8UZgveIdTepywGHrfmGcdwE",
  authDomain: "leave-management-mohit.firebaseapp.com",
  projectId: "leave-management-mohit",
  storageBucket: "leave-management-mohit.firebasestorage.app",
  messagingSenderId: "766881744866",
  appId: "1:766881744866:web:5087fe8e61731e7706dbbb",
  measurementId: "G-ND3QHQBHQ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Initialize Cloud Firestore
const db = getFirestore(app);

// Initialize Cloud Storage
const storage = getStorage(app);

export { auth, db, storage };