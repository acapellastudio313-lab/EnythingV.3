import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { User } from './types';
import { db, initDatabase } from './lib/config'; // Mengambil fungsi otomatisasi
import { collection, onSnapshot, query, where } from 'firebase/firestore';

// Import Components & Pages
import Layout from './components/Layout';
import Home from './pages/Home';
import Candidates from './pages/Candidates';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. JALANKAN OTOMATISASI DATA (SEEDING)
    initDatabase();

    // 2. CEK SESI LOGIN (REAL-TIME DARI FIREBASE)
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const q = query(collection(db, "users"), where("id", "==", Number(storedUserId)));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setUser(snapshot.docs[0].data() as User);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-emerald-500 rounded-full mb-4"></div>
        <p className="text-slate-500 font-medium">Menyiapkan Sistem...</p>
      </div>
    </div>
  );

  // Jika tidak ada user, arahkan ke Login
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      {/* Notifikasi Toaster untuk feedback visual */}
      <Toaster position="top-right" richColors closeButton />
      
      <Layout user={user} onLogout={() => {
        localStorage.removeItem('userId');
        setUser(null);
      }}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/candidates" element={<Candidates user={user} />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/leaderboard" element={<Leaderboard user={user} />} />
          <Route path="/profile" element={<Profile user={user} onUpdateUser={setUser} />} />
          <Route path="/profile/:userId" element={<Profile user={user} onUpdateUser={setUser} />} />
          <Route path="/messages" element={<Messages user={user} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="/post/:postId" element={<PostDetail user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}