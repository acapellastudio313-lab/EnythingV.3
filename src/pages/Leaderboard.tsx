import { useState, useEffect } from 'react';
import { User, LeaderboardEntry, ElectionStatus } from '../types';
import { Trophy, Medal, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion'; // Gunakan framer-motion agar aman di Vercel
import { db } from '../lib/config'; // Mengambil koneksi Firebase yang sudah kita buat
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';

export default function Leaderboard({ user }: { user: User }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [nonVoters, setNonVoters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNonVoters, setShowNonVoters] = useState(false);

  // 1. Sinkronisasi Otomatis dengan Firestore
  useEffect(() => {
    // Ambil data kandidat & urutkan berdasarkan vote terbanyak secara real-time
    const qLeaderboard = query(collection(db, "candidates"), orderBy("vote_count", "desc"));
    const unsubscribeLeaderboard = onSnapshot(qLeaderboard, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaderboardEntry[];
      setLeaderboard(data);
      setLoading(false);
    });

    // Ambil data user yang belum memilih (hasVoted == false)
    const qNonVoters = query(collection(db, "users"), where("hasVoted", "==", false));
    const unsubscribeNonVoters = onSnapshot(qNonVoters, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setNonVoters(data);
    });

    return () => {
      unsubscribeLeaderboard();
      unsubscribeNonVoters();
    };
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat klasemen real-time...</div>;

  const totalVotes = leaderboard.reduce((acc, curr) => acc + curr.vote_count, 0);

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Header Stats */}
      <div className="p-4 md:p-8 bg-emerald-600 text-white sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
            <Trophy className="w-5 h-5 md:w-8 md:h-8 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-lg md:text-3xl font-extrabold tracking-tight">Klasemen Sementara</h2>
            <p className="text-emerald-100 text-[10px] md:text-base opacity-90 text-sm">Pemilihan Agen Perubahan 2026</p>
          </div>
        </div>
        
        <div className="mt-3 flex flex-col gap-3 bg-emerald-700/50 p-4 rounded-2xl border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200 text-xs uppercase font-medium">Total Suara Masuk</p>
              <p className="text-2xl font-bold">{totalVotes}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-200 text-xs uppercase font-medium">Belum Memilih</p>
              <button 
                onClick={() => setShowNonVoters(!showNonVoters)}
                className="text-2xl font-bold hover:text-yellow-300 transition-colors flex items-center gap-2"
              >
                {nonVoters.length}
                <ArrowUpRight className={clsx("w-4 h-4 transition-transform", showNonVoters && "rotate-90")} />
              </button>
            </div>
          </div>

          {showNonVoters && nonVoters.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3 border-t border-emerald-500/30">
              <div className="flex flex-wrap gap-2">
                {nonVoters.map(voter => (
                  <div key={voter.id} className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-lg">
                    <img src={voter.avatar} className="w-5 h-5 rounded-full" />
                    <span className="text-xs">{voter.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-3 md:p-6 max-w-3xl mx-auto space-y-3">
        {leaderboard.map((entry, index) => {
          const percentage = totalVotes > 0 ? Math.round((entry.vote_count / totalVotes) * 100) : 0;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border",
                index === 0 ? "border-yellow-400 ring-1 ring-yellow-400/20" : "border-slate-200"
              )}
            >
              <div className="w-8 text-center font-bold text-slate-400">
                {index < 3 ? <Medal className={clsx("w-6 h-6 mx-auto", index === 0 ? "text-yellow-500" : index === 1 ? "text-slate-400" : "text-amber-600")} /> : `#${index + 1}`}
              </div>
              <img src={entry.avatar} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-slate-100" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-1">
                  <h3 className="font-bold truncate text-slate-800">{entry.name}</h3>
                  <span className="font-black text-emerald-600">{percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${percentage}%` }} 
                    className={clsx("h-full", index === 0 ? "bg-yellow-400" : "bg-emerald-500")} 
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{entry.vote_count} suara masuk</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}