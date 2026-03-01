import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, Search, Code, Swords, Trophy as TrophyIcon, Flame } from 'lucide-react';
import Trophy from '../components/icons/Trophy';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, getUserProfile, getUserRankPosition } from '../services/firebase';
import AnimatedAvatar from '../components/common/AnimatedAvatar';

// ── Types ──
interface LeaderboardUser {
  id: string;
  name: string;
  coderName: string;
  selectedAvatar: string;
  rank: number;
  stats: {
    problemsSolved?: number;
    totalRankPoints?: number;
    rankWins?: number;
    rankMatches?: number;
    currentStreak?: number;
    bestStreak?: number;
    rank?: string;
    [key: string]: any;
  };
}

interface UserRank {
  name: string;
  coderName: string;
  selectedAvatar: string;
  position: number;
  stats: {
    problemsSolved?: number;
    totalRankPoints?: number;
    rankWins?: number;
    currentStreak?: number;
    rank?: string;
    [key: string]: any;
  };
}

const LeaderboardPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [searchTerm, setSearchTerm] = useState('');
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardUser[]>([]);
  const [rankedLeaderboard, setRankedLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'global', label: 'Global', icon: <Users size={16} /> },
    { key: 'ranked', label: 'Ranked', icon: <Swords size={16} /> },
  ];

  useEffect(() => {
    fetchLeaderboards();
  }, [currentUser]);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const [globalRes, rankedRes] = await Promise.all([
        getLeaderboard('global', 20),
        getLeaderboard('rankPoints', 20),
      ]);

      if (globalRes.data) setGlobalLeaderboard(globalRes.data);
      if (rankedRes.data) setRankedLeaderboard(rankedRes.data);

      if (currentUser) {
        const [profileRes, globalRankRes, rankedRankRes] = await Promise.all([
          getUserProfile(currentUser.uid),
          getUserRankPosition(currentUser.uid, 'global'),
          getUserRankPosition(currentUser.uid, 'rankPoints'),
        ]);

        if (profileRes.data) {
          setUserRank({
            name: profileRes.data.name || 'Anonymous',
            coderName: profileRes.data.coderName || '',
            selectedAvatar: profileRes.data.selectedAvatar || 'boy1',
            position: activeTab === 'ranked' ? (rankedRankRes.rank || 0) : (globalRankRes.rank || 0),
            stats: profileRes.data.stats || {},
          });
        }
      }
    } catch (err) {
      console.error('Error loading leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const activeLeaderboard = activeTab === 'ranked' ? rankedLeaderboard : globalLeaderboard;

  const filteredLeaderboard = activeLeaderboard.filter((user) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.coderName.toLowerCase().includes(q)
    );
  });

  const getStatLabel = () => (activeTab === 'ranked' ? 'Rank Points' : 'Problems Solved');
  const getStatValue = (user: LeaderboardUser) =>
    activeTab === 'ranked' ? user.stats?.totalRankPoints || 0 : user.stats?.problemsSolved || 0;

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-amber-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-amber-600';
      default: return 'text-[var(--text-secondary)]';
    }
  };

  // ── Podium (top 3) ──
  const podium = filteredLeaderboard.slice(0, 3);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow relative">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-amber-400 filter blur-[200px] opacity-[0.03]" />
            <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent)] filter blur-[180px] opacity-[0.03]" />
          </div>

          <div className="container-custom relative z-10 py-10">
            {/* ═══ HEADER ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/20">
                    <Crown className="text-amber-400" size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">
                      <span className="bg-gradient-to-r from-amber-400 via-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                        Leaderboard
                      </span>
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)]">See who's on top</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.key
                          ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20'
                          : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ═══ PODIUM ═══ */}
            {!loading && podium.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="mb-8"
              >
                <div className="grid grid-cols-3 gap-3 items-end max-w-2xl mx-auto">
                  {/* 2nd place */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300/40 mb-2">
                      <AnimatedAvatar type={podium[1].selectedAvatar as any} size={64} interval={60000} />
                    </div>
                    <p className="text-sm font-bold truncate max-w-[120px] text-center">{podium[1].name}</p>
                    {podium[1].coderName && <p className="text-[10px] text-[var(--accent)] truncate max-w-[120px]">@{podium[1].coderName}</p>}
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{getStatValue(podium[1]).toLocaleString()}</p>
                    <div className="w-full mt-2 rounded-t-xl bg-gradient-to-t from-gray-400/10 to-gray-300/5 border border-white/[0.06] border-b-0 flex items-end justify-center h-20">
                      <span className="text-2xl font-bold text-gray-300 mb-2">2</span>
                    </div>
                  </div>

                  {/* 1st place */}
                  <div className="flex flex-col items-center">
                    <div className="text-amber-400 mb-1">👑</div>
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/50 mb-2 shadow-lg shadow-amber-400/10">
                      <AnimatedAvatar type={podium[0].selectedAvatar as any} size={80} interval={60000} />
                    </div>
                    <p className="text-base font-bold truncate max-w-[140px] text-center">{podium[0].name}</p>
                    {podium[0].coderName && <p className="text-[10px] text-[var(--accent)] truncate max-w-[140px]">@{podium[0].coderName}</p>}
                    <p className="text-sm text-amber-400 font-semibold mt-0.5">{getStatValue(podium[0]).toLocaleString()}</p>
                    <div className="w-full mt-2 rounded-t-xl bg-gradient-to-t from-amber-400/10 to-amber-400/5 border border-amber-400/15 border-b-0 flex items-end justify-center h-28">
                      <span className="text-3xl font-bold text-amber-400 mb-2">1</span>
                    </div>
                  </div>

                  {/* 3rd place */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-600/30 mb-2">
                      <AnimatedAvatar type={podium[2].selectedAvatar as any} size={64} interval={60000} />
                    </div>
                    <p className="text-sm font-bold truncate max-w-[120px] text-center">{podium[2].name}</p>
                    {podium[2].coderName && <p className="text-[10px] text-[var(--accent)] truncate max-w-[120px]">@{podium[2].coderName}</p>}
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{getStatValue(podium[2]).toLocaleString()}</p>
                    <div className="w-full mt-2 rounded-t-xl bg-gradient-to-t from-amber-700/10 to-amber-600/5 border border-white/[0.06] border-b-0 flex items-end justify-center h-16">
                      <span className="text-2xl font-bold text-amber-600 mb-2">3</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* ═══ MAIN TABLE ═══ */}
              <div className="lg:col-span-8">
                <motion.div
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  {/* Table header bar */}
                  <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrophyIcon size={16} className="text-[var(--accent)]" />
                      <h2 className="text-sm font-bold font-display">Full Rankings</h2>
                      <span className="text-[10px] text-[var(--text-secondary)] bg-white/[0.04] px-2 py-0.5 rounded-full">
                        {filteredLeaderboard.length} players
                      </span>
                    </div>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs focus:outline-none focus:border-[var(--accent)]/40 transition-all w-40"
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="flex justify-center items-center py-16">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-white/[0.06]" />
                          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin" />
                        </div>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/[0.06]">
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest w-16">#</th>
                            <th className="px-3 py-3 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Player</th>
                            <th className="px-3 py-3 text-right text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{getStatLabel()}</th>
                            {activeTab === 'ranked' && (
                              <th className="px-5 py-3 text-right text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hidden sm:table-cell">Wins</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeaderboard.map((user, index) => {
                            const displayRank = user.rank;
                            const isCurrentUser = currentUser && user.id === currentUser.uid;
                            return (
                              <tr
                                key={user.id}
                                className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${
                                  isCurrentUser ? 'bg-[var(--accent)]/[0.04]' : ''
                                }`}
                              >
                                <td className="px-5 py-3">
                                  {displayRank <= 3 ? (
                                    <span className={`text-base font-bold ${getMedalColor(displayRank)}`}>
                                      {displayRank === 1 ? '🥇' : displayRank === 2 ? '🥈' : '🥉'}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-[var(--text-secondary)]">{displayRank}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/[0.08] shrink-0">
                                      <AnimatedAvatar type={user.selectedAvatar as any} size={36} interval={30000 + index * 2000} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-[var(--accent)]' : ''}`}>
                                        {user.name}{isCurrentUser ? ' (You)' : ''}
                                      </p>
                                      {user.coderName && (
                                        <p className="text-[10px] text-[var(--text-secondary)] truncate">@{user.coderName}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-right">
                                  <span className="text-sm font-bold">{getStatValue(user).toLocaleString()}</span>
                                </td>
                                {activeTab === 'ranked' && (
                                  <td className="px-5 py-3 text-right hidden sm:table-cell">
                                    <span className="text-sm text-emerald-400">{user.stats?.rankWins || 0}</span>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                          {filteredLeaderboard.length === 0 && !loading && (
                            <tr>
                              <td colSpan={4} className="px-5 py-12 text-center text-sm text-[var(--text-secondary)]">
                                {searchTerm ? 'No players match your search.' : 'No leaderboard data yet.'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* ═══ SIDEBAR ═══ */}
              <div className="lg:col-span-4 space-y-5">
                {/* Your Position */}
                {userRank && (
                  <motion.div
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                  >
                    <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
                      <Flame size={14} className="text-amber-400" />
                      <h3 className="text-sm font-bold font-display">Your Position</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--accent)]/30">
                          <AnimatedAvatar type={userRank.selectedAvatar as any} size={48} interval={60000} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{userRank.name}</p>
                          {userRank.coderName && (
                            <p className="text-xs text-[var(--accent)]">@{userRank.coderName}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Rank', value: `#${userRank.position}`, icon: <Crown size={12} />, color: 'text-amber-400' },
                          { label: 'Solved', value: userRank.stats?.problemsSolved || 0, icon: <Code size={12} />, color: 'text-[var(--accent)]' },
                          { label: 'RP', value: userRank.stats?.totalRankPoints || 0, icon: <Flame size={12} />, color: 'text-amber-400' },
                          { label: 'Wins', value: userRank.stats?.rankWins || 0, icon: <Trophy size={12} />, color: 'text-emerald-400' },
                        ].map((stat, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                            <div className={`flex items-center justify-center gap-1 mb-1 ${stat.color}`}>
                              {stat.icon}
                              <span className="text-[9px] font-bold uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <p className="text-base font-bold">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Legend */}
                <motion.div
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                >
                  <h3 className="text-sm font-bold font-display mb-3">Scoring</h3>
                  <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-start gap-2">
                      <Code size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                      <p><span className="font-semibold text-white">Global</span> — ranked by total problems solved across all categories.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Swords size={14} className="text-[var(--accent-secondary)] shrink-0 mt-0.5" />
                      <p><span className="font-semibold text-white">Ranked</span> — ranked by points earned in 1v1 matches.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default LeaderboardPage;
