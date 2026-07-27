import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasFirebaseKeys = 
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID && 
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;

let app;
let auth: any = null;
let db: any = null;
let isMockEnabled = true;

if (hasFirebaseKeys) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isMockEnabled = false;
    console.log("ResQVerse: Firebase initialized successfully.");
  } catch (error) {
    console.warn("ResQVerse: Firebase failed to initialize. Falling back to Mock/Demo Mode:", error);
    isMockEnabled = true;
  }
} else {
  console.log("ResQVerse: No Firebase credentials detected. Operating in Mock/Demo Mode.");
}

export { auth, db, isMockEnabled };
export default app;
