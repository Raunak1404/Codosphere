import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, Users, MapPin, User, Search, ArrowUp, Code, Swords, Trophy as TrophyIcon } from 'lucide-react';
import Trophy from '../components/icons/Trophy';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import RevealOnScroll from '../components/common/RevealOnScroll';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, getUserProfile, getUserRankPosition } from '../services/firebase';
import AnimatedAvatar from '../components/common/AnimatedAvatar';

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
        return { icon: '💎', color: 'text-blue-400 bg-blue-400 bg-opacity-20' };
      case 'Platinum':
        return { icon: '🔷', color: 'text-cyan-300 bg-cyan-300 bg-opacity-20' };
      case 'Gold':
        return { icon: '🥇', color: 'text-yellow-400 bg-yellow-400 bg-opacity-20' };
      case 'Silver':
        return { icon: '🥈', color: 'text-gray-300 bg-gray-300 bg-opacity-20' };
      case 'Bronze':
        return { icon: '🥉', color: 'text-amber-700 bg-amber-700 bg-opacity-20' };
      default:
        return { icon: '🎯', color: 'text-blue-400 bg-blue-400 bg-opacity-20' };
    }
  };

  // Default avatar for users without selectedAvatar property
  const getDefaultAvatar = (index: number) => {
    const avatarTypes = ['boy1', 'boy2', 'girl1', 'girl2'];
    // Use consistent avatar based on user index
    return avatarTypes[index % avatarTypes.length];
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow py-12 relative overflow-hidden">
          {/* Simplified background - removed complex animations */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--accent)] filter blur-[120px] opacity-3" />
            <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-[var(--accent-secondary)] filter blur-[100px] opacity-3" />
          </div>

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-8">
                <Trophy className="text-[var(--accent)] mr-3" size={28} />
                <h1 className="text-3xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]">Leaderboard</h1>
              </div>
              
              {/* Top 3 Users - Simplified animations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {activeLeaderboard.slice(0, 3).map((user, index) => {
                  const scoreField = getScoreField(activeTab);
                  const score = user.stats?.[scoreField] || 0;
                  const avatarType = user.selectedAvatar || getDefaultAvatar(index);
                    
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="card-interactive relative flex flex-col items-center p-8"
                      whileHover={{ y: -5 }}
                    >
                      <div className={`absolute top-0 right-0 left-0 h-2 rounded-t-lg ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        'bg-amber-700'
                      }`}></div>
                      
                      <div className="relative mb-2">
                        <AnimatedAvatar 
                          type={avatarType}
                          size={100}
                          interval={15000 + index * 2000} // Reduced frequency
                        />
                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          'bg-amber-700'
                        }`}>
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold font-display mt-4">{user.name}</h3>
                      {user.coderName && (
                        <p className="text-sm text-[var(--text-secondary)]">{user.coderName}</p>
                      )}
                      <p className="text-[var(--accent)] font-semibold mt-2">
                        {score.toLocaleString()} {getScoreLabel(activeTab)}
                      </p>
                      
                      {user.stats?.rank && activeTab === 'ranked' && (
                        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          getUserRankBadge(user.stats.rank).color
                        }`}>
                          {user.stats.rank} <span>{getUserRankBadge(user.stats.rank).icon}</span>
                        </div>
                      )}
                      
                      <div className={`mt-4 px-3 py-1 rounded-full text-xs font-medium ${
                        index === 0 ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' : 
                        index === 1 ? 'bg-gray-400 bg-opacity-20 text-gray-400' : 
                        'bg-amber-700 bg-opacity-20 text-amber-700'
                      }`}>
                        {index === 0 ? 'Gold 🏆' : index === 1 ? 'Silver 🥈' : 'Bronze 🥉'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Leaderboard Tabs & Search */}
              <motion.div 
                className="card-interactive mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <div className="flex space-x-4 mb-4 md:mb-0 py-2 md:py-0">
                    <button
                      onClick={() => setActiveTab('global')}
                      className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 ${
                        activeTab === 'global' 
                          ? 'bg-[var(--accent)] text-white' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--primary)]'
                      }`}
                    >
                      <Trophy size={16} className="mr-2" />
                      Overall Points
                    </button>
                    <button
                      onClick={() => setActiveTab('ranked')}
                      className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 ${
                        activeTab === 'ranked' 
                          ? 'bg-[var(--accent)] text-white' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--primary)]'
                      }`}
                    >
                      <Swords size={16} className="mr-2" />
                      Ranked Matches
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[var(--primary)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>
                
                {/* Leaderboard Table */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)] animate-spin"></div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                            User
                          </th>
                          {activeTab === 'ranked' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                              Rank
                            </th>
                          )}
                          <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
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
                              <tr 
                                key={user.id} 
                                className={`border-b border-gray-800 hover:bg-[var(--primary)] hover:bg-opacity-30 transition-colors ${
                                  isCurrentUser ? 'bg-white/[0.04] border-l-2 border-l-[var(--accent)]' : ''
                                }`}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                    index === 0 ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' : 
                                    index === 1 ? 'bg-gray-400 bg-opacity-20 text-gray-400' : 
                                    index === 2 ? 'bg-amber-700 bg-opacity-20 text-amber-700' : 
                                    'bg-[var(--primary)] text-[var(--text-secondary)]'
                                  }`}>
                                    {index + 1}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                      <AnimatedAvatar 
                                        type={avatarType}
                                        size={40}
                                        interval={20000 + index * 1000} // Reduced frequency
                                      />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-[var(--text)]">
                                        {user.name}
                                        {isCurrentUser && (
                                          <span className="ml-2 text-xs text-[var(--accent)]">(You)</span>
                                        )}
                                      </div>
                                      {user.coderName && (
                                        <div className="text-xs text-[var(--text-secondary)]">{user.coderName}</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                {activeTab === 'ranked' && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {user.stats?.rank ? (
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        getUserRankBadge(user.stats.rank).color
                                      }`}>
                                        <span className="mr-1">{getUserRankBadge(user.stats.rank).icon}</span> 
                                        {user.stats.rank}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-[var(--text-secondary)]">Unranked</span>
                                    )}
                                  </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                  <span className={`font-semibold ${
                                    index === 0 ? 'text-yellow-400' : 
                                    index === 1 ? 'text-gray-300' : 
                                    index === 2 ? 'text-amber-400' : 
                                    'text-[var(--accent)]'
                                  }`}>
                                    {score.toLocaleString()}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={activeTab === 'ranked' ? 4 : 3} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                              {error ? `Error loading leaderboard: ${error}` : 'No users found matching your search criteria.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
              
              {/* Your Position Card - Simplified */}
              <RevealOnScroll direction="up">
              <motion.div 
                className="card-interactive"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h2 className="text-xl font-bold font-display mb-4">Your Position</h2>
                {!currentUser ? (
                  <div className="bg-[var(--primary)] p-4 rounded-lg text-center">
                    <p className="text-[var(--text-secondary)]">Please log in to see your ranking.</p>
                  </div>
                ) : userRank ? (
                  <div className="bg-[var(--primary)] p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <AnimatedAvatar 
                            type={userRank.selectedAvatar || 'boy1'}
                            size={48}
                            interval={15000}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{userRank.name}</p>
                          {userRank.coderName && (
                            <p className="text-xs text-[var(--text-secondary)]">{userRank.coderName}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center mb-1">
                          <Trophy size={16} className="text-[var(--accent)] mr-2" />
                          <span className="text-sm">Problems Solved:</span>
                          <span className="ml-auto font-semibold">{userRank.stats?.problemsSolved || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Swords size={16} className="text-[var(--accent)] mr-2" />
                          <span className="text-sm">Rank Points:</span>
                          <span className="ml-auto font-semibold">{userRank.stats?.totalRankPoints || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center mb-1">
                          <Code size={16} className="text-[var(--accent)] mr-2" />
                          <span className="text-sm">Ranked Wins:</span>
                          <span className="ml-auto font-semibold">{userRank.stats?.rankWins || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Medal size={16} className="text-[var(--accent)] mr-2" />
                          <span className="text-sm">Current Rank:</span>
                          <span className="ml-auto">
                            {userRank.stats?.rank ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                getUserRankBadge(userRank.stats.rank).color
                              }`}>
                                <span className="mr-1">{getUserRankBadge(userRank.stats.rank).icon}</span>
                                {userRank.stats.rank}
                              </span>
                            ) : (
                              <span className="font-semibold">Unranked</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Your position in leaderboard */}
                    {userRankPosition && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex items-center justify-center">
                          <div className="bg-[var(--accent)] bg-opacity-20 px-4 py-2 rounded-lg inline-flex items-center">
                            <ArrowUp className="text-[var(--accent)] mr-2" size={16} />
                            <span>Your position: <strong>{userRankPosition}</strong> of {activeLeaderboard.length}+ users</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[var(--primary)] p-4 rounded-lg flex items-center justify-center">
                    <div className="h-6 w-6 border-t-2 border-b-2 border-[var(--accent)] rounded-full mr-3 animate-spin"></div>
                    <p>Loading your stats...</p>
                  </div>
                )}
                <p className="text-sm text-[var(--text-secondary)] mt-4">
                  Solve coding problems and win ranked matches to earn points and climb the leaderboard rankings.
                </p>
              </motion.div>
              </RevealOnScroll>
            </motion.div>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default LeaderboardPage;