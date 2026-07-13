import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnJ4oo-8GY5rd7vFbtry20xNkmcgOgEUs",
  authDomain: "chatup-new.firebaseapp.com",
  projectId: "chatup-new",
  storageBucket: "chatup-new.appspot.com",
  messagingSenderId: "508139661249",
  appId: "1:508139661249:web:b3848d93ceb1766f3fb140"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);