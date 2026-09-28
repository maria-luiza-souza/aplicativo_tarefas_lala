import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAIvmTZLHVThtANwCSCJ7FrvTcaAMB1fGI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aplicativo-tarefas-lala.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aplicativo-tarefas-lala',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aplicativo-tarefas-lala.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '584923643345',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:584923643345:web:71cdfdc27147abc24df4f0'
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

void setPersistence(auth, browserLocalPersistence);
