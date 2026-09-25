const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAIiSuBaELX2l9PQzL1n9_2qWz7gOqvsCQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "daily-chess-3ee89.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "daily-chess-3ee89",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "daily-chess-3ee89.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1079684898277",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:1079684898277:web:9cad63c65471dbf6c6e30c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-FGRG9GP14J",
};

export function getFirebaseConfig() {
  return firebaseConfig;
}

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}
