import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, Users, MapPin, Search, ArrowUp, Code, Swords, Trophy as TrophyIcon, Crown, Sparkles } from 'lucide-react';
import Trophy from '../components/icons/Trophy';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import RevealOnScroll from '../components/common/RevealOnScroll';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, getUserProfile, getUserRankPosition } from '../services/firebase';
import AnimatedAvatar from '../components/common/AnimatedAvatar';
import '../styles/study.css';

const LeaderboardPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Leaderboard data
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [rankedLeaderboard, setRankedLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<any>(null);
  const [userRankPosition, setUserRankPosition] = useState<number | null>(null);
  
  // Fetch leaderboard data once when component mounts
  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        // Fetch global leaderboard
        const { data: globalData, error: globalError } = await getLeaderboard('global', 20);
        if (globalError) {
          throw new Error(globalError);
        }
        setGlobalLeaderboard(globalData);
        
        // Fetch ranked leaderboard
        const { data: rankedData, error: rankedError } = await getLeaderboard('rankPoints', 20);
        if (rankedError) {
          throw new Error(rankedError);
        }
        setRankedLeaderboard(rankedData);
        
        // Get current user rank
        if (currentUser) {
          const { data: userData } = await getUserProfile(currentUser.uid);
          if (userData) {
            setUserRank({
              id: currentUser.uid,
              name: userData.name || 'You',
              coderName: userData.coderName || '',
              selectedAvatar: userData.selectedAvatar || 'boy1',
              stats: userData.stats || {}
            });
            
            // Also get user's position in both leaderboards
            const globalPosition = await getUserRankPosition(currentUser.uid, 'global');
            const rankedPosition = await getUserRankPosition(currentUser.uid, 'rankPoints');
            
            if (!globalPosition.error && !rankedPosition.error) {
              setUserRankPosition(activeTab === 'global' ? globalPosition.rank : rankedPosition.rank);
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboards();
  }, [currentUser, activeTab]);

  // Filter based on search term
  const filteredGlobalLeaderboard = globalLeaderboard.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.coderName && user.coderName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredRankedLeaderboard = rankedLeaderboard.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.coderName && user.coderName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Determine which leaderboard to display
  const activeLeaderboard = activeTab === 'global' 
    ? filteredGlobalLeaderboard 
    : activeTab === 'ranked'
      ? filteredRankedLeaderboard
      : [];

  // Get score field based on active tab
  const getScoreField = (tab: string) => {
    switch(tab) {
      case 'global':
        return 'problemsSolved';
      case 'ranked':
        return 'totalRankPoints';
      default:
        return 'problemsSolved';
    }
  };

  // Get score label based on active tab
  const getScoreLabel = (tab: string) => {
    switch(tab) {
      case 'global':
        return 'Problems Solved';
      case 'ranked':
        return 'Rank Points';
      default:
        return 'Score';
    }
  };

  // Get icon based on active tab
  const getTabIcon = (tab: string, size: number = 20) => {
    switch(tab) {
      case 'global':
        return <Trophy size={size} />;
      case 'ranked':
        return <Swords size={size} />;
      case 'country':
        return <MapPin size={size} />;
      case 'local':
        return <MapPin size={size} />;
      case 'friends':
        return <Users size={size} />;
      default:
        return <Trophy size={size} />;
    }
  };

  // Function to get user rank icon/badge
  const getUserRankBadge = (rankName: string) => {
    switch (rankName) {
      case 'Diamond':
        return { icon: '💎', color: 'text-blue-400 bg-blue-400/10' };
      case 'Platinum':
        return { icon: '🔷', color: 'text-cyan-300 bg-cyan-300/10' };
      case 'Gold':
        return { icon: '🥇', color: 'text-yellow-400 bg-yellow-400/10' };
      case 'Silver':
        return { icon: '🥈', color: 'text-gray-300 bg-gray-300/10' };
      case 'Bronze':
        return { icon: '🥉', color: 'text-amber-600 bg-amber-600/10' };
      default:
        return { icon: '🎯', color: 'text-blue-400 bg-blue-400/10' };
    }
  };

  // Default avatar for users without selectedAvatar property
  const getDefaultAvatar = (index: number) => {
    const avatarTypes = ['boy1', 'boy2', 'girl1', 'girl2'];
    return avatarTypes[index % avatarTypes.length];
  };

  const podiumColors = [
    { bg: 'from-amber-400/20 to-amber-400/5', border: 'border-amber-400/30', badge: 'bg-amber-400 text-black', label: 'Gold', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]' },
    { bg: 'from-gray-300/15 to-gray-300/5', border: 'border-gray-400/25', badge: 'bg-gray-400 text-black', label: 'Silver', glow: 'shadow-[0_0_20px_rgba(156,163,175,0.1)]' },
    { bg: 'from-amber-700/15 to-amber-700/5', border: 'border-amber-700/25', badge: 'bg-amber-700 text-white', label: 'Bronze', glow: '' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow relative">
          {/* Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[15%] right-[20%] w-[500px] h-[500px] rounded-full bg-[var(--accent)] filter blur-[180px] opacity-[0.04]" />
            <div className="absolute bottom-[25%] left-[15%] w-[400px] h-[400px] rounded-full bg-[var(--accent-secondary)] filter blur-[160px] opacity-[0.03]" />
            <div className="study-hex-grid opacity-[0.01]" />
          </div>

          <div className="container-custom relative z-10 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                  <Crown className="text-[var(--accent)]" size={22} />
                </div>
                <h1 className="text-3xl font-bold font-display tracking-tight">
                  <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                    Leaderboard
                  </span>
                </h1>
              </div>
              <p className="text-sm text-[var(--text-secondary)] ml-[52px]">Top performers across the platform</p>
            </motion.div>
              
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {activeLeaderboard.slice(0, 3).map((user, index) => {
                const scoreField = getScoreField(activeTab);
                const score = user.stats?.[scoreField] || 0;
                const avatarType = user.selectedAvatar || getDefaultAvatar(index);
                const pc = podiumColors[index];
                  
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative rounded-2xl border ${pc.border} bg-gradient-to-b ${pc.bg} backdrop-blur-sm overflow-hidden ${pc.glow}`}
                    whileHover={{ y: -5, transition: { duration: 0.25 } }}
                  >
                    {/* Top glow bar */}
                    <div className={`h-1 ${index === 0 ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400' : index === 1 ? 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300' : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700'}`} />
                    
                    <div className="p-6 flex flex-col items-center">
                      {/* Position badge */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-3 ${pc.badge}`}>
                        {index + 1}
                      </div>
                      
                      {/* Avatar */}
                      <div className="relative mb-3">
                        <div className="rounded-full p-0.5" style={{ background: `linear-gradient(135deg, ${index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#b45309'}30, transparent)` }}>
                          <AnimatedAvatar 
                            type={avatarType}
                            size={80}
                            interval={15000 + index * 2000}
                          />
                        </div>
                      </div>
                      
                      <h3 className="text-base font-bold font-display">{user.name}</h3>
                      {user.coderName && (
                        <p className="text-xs text-[var(--text-secondary)]">{user.coderName}</p>
                      )}
                      
                      <p className="text-lg font-bold font-display mt-2 text-[var(--accent)]">
                        {score.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{getScoreLabel(activeTab)}</p>
                      
                      {user.stats?.rank && activeTab === 'ranked' && (
                        <div className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getUserRankBadge(user.stats.rank).color}`}>
                          {getUserRankBadge(user.stats.rank).icon} {user.stats.rank}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
              
            {/* Tabs + Search + Table */}
            <motion.div 
              className="topic-card p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                {/* Tab pills */}
                <div className="flex gap-2 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  {[
                    { key: 'global', label: 'Overall Points', icon: <Trophy size={14} /> },
                    { key: 'ranked', label: 'Ranked Matches', icon: <Swords size={14} /> },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'bg-[var(--accent)] text-white shadow-[0_0_12px_rgba(244,91,105,0.3)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.03]'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Search */}
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={14} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-56 pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]/40 focus:shadow-[0_0_0_3px_rgba(244,91,105,0.08)] transition-all"
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
                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                          Player
                        </th>
                        {activeTab === 'ranked' && (
                          <th className="px-4 py-3 text-left text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                            Tier
                          </th>
                        )}
                        <th className="px-4 py-3 text-right text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                          {getScoreLabel(activeTab)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLeaderboard.length > 0 ? (
                        activeLeaderboard.map((user, index) => {
                          const isCurrentUser = currentUser && user.id === currentUser.uid;
                          const scoreField = getScoreField(activeTab);
                          const score = user.stats?.[scoreField] || 0;
                          const avatarType = user.selectedAvatar || getDefaultAvatar(index);
                          
                          return (
                            <motion.tr 
                              key={user.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.03 }}
                              className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${
                                isCurrentUser ? 'bg-[var(--accent)]/[0.04] border-l-2 border-l-[var(--accent)]' : ''
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-amber-400/15 text-amber-400' : 
                                  index === 1 ? 'bg-gray-400/15 text-gray-400' : 
                                  index === 2 ? 'bg-amber-700/15 text-amber-600' : 
                                  'bg-white/[0.03] text-[var(--text-secondary)]'
                                }`}>
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0">
                                    <AnimatedAvatar 
                                      type={avatarType}
                                      size={36}
                                      interval={20000 + index * 1000}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium flex items-center gap-1.5">
                                      {user.name}
                                      {isCurrentUser && (
                                        <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded">You</span>
                                      )}
                                    </div>
                                    {user.coderName && (
                                      <div className="text-[11px] text-[var(--text-secondary)]">{user.coderName}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              {activeTab === 'ranked' && (
                                <td className="px-4 py-3">
                                  {user.stats?.rank ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${getUserRankBadge(user.stats.rank).color}`}>
                                      {getUserRankBadge(user.stats.rank).icon} {user.stats.rank}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[var(--text-secondary)]">Unranked</span>
                                  )}
                                </td>
                              )}
                              <td className="px-4 py-3 text-right">
                                <span className={`text-sm font-bold font-display ${
                                  index === 0 ? 'text-amber-400' : 
                                  index === 1 ? 'text-gray-300' : 
                                  index === 2 ? 'text-amber-500' : 
                                  'text-[var(--text)]'
                                }`}>
                                  {score.toLocaleString()}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={activeTab === 'ranked' ? 4 : 3} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                            {error ? `Error loading leaderboard: ${error}` : 'No users found matching your search criteria.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
              
            {/* Your Position Card */}
            <RevealOnScroll direction="up">
              <div className="topic-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles size={16} className="text-[var(--accent-tertiary)]" />
                  <h2 className="text-lg font-bold font-display">Your Position</h2>
                </div>
                {!currentUser ? (
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                    <p className="text-sm text-[var(--text-secondary)]">Please log in to see your ranking.</p>
                  </div>
                ) : userRank ? (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* User info */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <AnimatedAvatar 
                            type={userRank.selectedAvatar || 'boy1'}
                            size={48}
                            interval={15000}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{userRank.name}</p>
                          {userRank.coderName && (
                            <p className="text-xs text-[var(--text-secondary)]">{userRank.coderName}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Stats col 1 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Trophy size={14} className="text-[var(--accent)]" />
                            Problems Solved
                          </div>
                          <span className="font-bold text-sm">{userRank.stats?.problemsSolved || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Swords size={14} className="text-[var(--accent)]" />
                            Rank Points
                          </div>
                          <span className="font-bold text-sm">{userRank.stats?.totalRankPoints || 0}</span>
                        </div>
                      </div>
                      
                      {/* Stats col 2 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Code size={14} className="text-[var(--accent)]" />
                            Ranked Wins
                          </div>
                          <span className="font-bold text-sm">{userRank.stats?.rankWins || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Medal size={14} className="text-[var(--accent)]" />
                            Current Rank
                          </div>
                          {userRank.stats?.rank ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${getUserRankBadge(userRank.stats.rank).color}`}>
                              {getUserRankBadge(userRank.stats.rank).icon} {userRank.stats.rank}
                            </span>
                          ) : (
                            <span className="text-sm font-bold">Unranked</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Position indicator */}
                    {userRankPosition && (
                      <div className="mt-4 pt-4 border-t border-white/[0.04]">
                        <div className="flex items-center justify-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)]/[0.08] border border-[var(--accent)]/20">
                            <ArrowUp className="text-[var(--accent)]" size={14} />
                            <span className="text-sm">Your position: <strong className="text-[var(--accent)]">{userRankPosition}</strong> of {activeLeaderboard.length}+ users</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-3">
                    <div className="relative w-5 h-5">
                      <div className="w-5 h-5 rounded-full border-2 border-white/[0.06]" />
                      <div className="absolute inset-0 w-5 h-5 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">Loading your stats...</p>
                  </div>
                )}
                <p className="text-xs text-[var(--text-secondary)] mt-4 leading-relaxed">
                  Solve coding problems and win ranked matches to earn points and climb the leaderboard rankings.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default LeaderboardPage;