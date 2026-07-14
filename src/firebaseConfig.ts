/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCfKnEYd3kuXMsF5Ep523chGzGn1g3uKaM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "big-project-f512b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "big-project-f512b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "big-project-f512b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "382267144899",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:382267144899:web:c6a9eb89715e1c57474076"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
