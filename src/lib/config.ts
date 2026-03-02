import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Konfigurasi Firebase (Project: koys-92fd5)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDiTqLeDYwp99OexM8o7DW__7Kqtzeb-vA",
  authDomain: "koys-92fd5.firebaseapp.com",
  projectId: "koys-92fd5",
  storageBucket: "koys-92fd5.firebasestorage.app",
  messagingSenderId: "60255465436",
  appId: "1:60255465436:web:7805540a6f475a69d2a919"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Konfigurasi Gemini (Key dari screenshot Google AI Studio)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "AlzaSyDBkE3uq0UbwXZ5xLEVcg1PMtl1MgZ8lpg");
export const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });