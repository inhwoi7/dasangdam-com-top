import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjVvbY26QczBG81th00HxriHZkyiiPY50",
  authDomain: "dasangdam.firebaseapp.com",
  projectId: "dasangdam",
  storageBucket: "dasangdam.firebasestorage.app",
  messagingSenderId: "870374448736",
  appId: "1:870374448736:web:238f8a2e8a5d5470ab2d05",
  measurementId: "G-S51L4W52NK",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();