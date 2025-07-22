
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

if (process.env.NODE_ENV === 'development') {
    // This check is to avoid errors during server-side rendering.
    if (typeof window !== 'undefined' && location.hostname === 'localhost') {
        try {
            // @ts-ignore - auth.emulatorConfig is private but we can check it
            if (!auth.emulatorConfig) {
                connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
            }
             // @ts-ignore - db._isClientInitialized is private but we can check it
            if (!db._isClientInitialized) {
                 connectFirestoreEmulator(db, '127.0.0.1', 8080);
            }
        } catch (e) {
            console.error("Error connecting to Firebase emulators:", e);
        }
    }
}


if (typeof window !== 'undefined') {
  isSupported().then(yes => yes ? getAnalytics(app) : null);
}

export { app, auth, db };
