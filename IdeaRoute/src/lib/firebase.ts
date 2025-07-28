import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableNetwork } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export let isFirestoreAvailable = true;

const testFirestoreConnection = async () => {
  try {
    await enableNetwork(db);
    isFirestoreAvailable = true;
  } catch (error: unknown) {
    const errorObj = error as { code?: string; message?: string };
    if (errorObj.code === 'unavailable' || errorObj.message?.includes('offline')) {
      isFirestoreAvailable = false;
    }
  }
};

if (typeof window !== 'undefined') {
  testFirestoreConnection();
}

let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
export { analytics };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'online'
});

googleProvider.addScope('profile');
googleProvider.addScope('email');

export const canUseFirestore = (): boolean => {
  return isFirestoreAvailable;
};

export const showFirestoreSetupInstructions = () => {
  if (typeof window !== 'undefined' && !isFirestoreAvailable) {
    console.warn(`
🔧 SETUP REQUIRED: Enable Firestore Database

Your app is trying to save user data, but Firestore isn't enabled yet.

Quick Fix:
1. Visit: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore
2. Click "Create database"
3. Choose "Start in test mode"
4. Refresh this page

This is a one-time setup step.
    `);
  }
};

export default app;
