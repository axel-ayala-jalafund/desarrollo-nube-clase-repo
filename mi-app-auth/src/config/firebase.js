import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5hQP8i9KH1tpBXst9UJUlSq7QRamrWl0",
  authDomain: "mi-app-auth-1c0a7.firebaseapp.com",
  projectId: "mi-app-auth-1c0a7",
  storageBucket: "mi-app-auth-1c0a7.firebasestorage.app",
  messagingSenderId: "685555429187",
  appId: "1:685555429187:web:931a7a8c12894531d189f6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
