import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
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

// Konfigurasi Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "AlzaSyDBkE3uq0UbwXZ5xLEVcg1PMtl1MgZ8lpg");
export const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/** * FUNGSI OTOMATISASI DATA
 * Jalankan ini sekali untuk mengisi database yang kosong.
 */
export const initDatabase = async () => {
  const colRef = collection(db, "candidates");
  const snapshot = await getDocs(colRef);

  if (snapshot.empty) {
    const mockData = [
      { name: "Agen Alpha", username: "alpha_2026", vote_count: 12, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
      { name: "Agen Beta", username: "beta_pro", vote_count: 8, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" },
      { name: "Agen Gamma", username: "gamma_v3", vote_count: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" }
    ];

    for (const data of mockData) {
      await addDoc(colRef, data);
    }
    console.log