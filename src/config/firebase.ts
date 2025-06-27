import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB3c4rDWrikS3_eq42ST4FPmin-t0vFINc",
  authDomain: "chatbuddy-01.firebaseapp.com",
  projectId: "chatbuddy-01",
  storageBucket: "chatbuddy-01.firebasestorage.app",
  messagingSenderId: "112691866718",
  appId: "1:112691866718:web:d070664965a19d947f18cf",
  measurementId: "G-F9D50XQS68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
