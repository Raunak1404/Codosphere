import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Users, Clock, Trophy, AlertCircle, UserMinus, Zap, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../firebase/firebase';
import { joinMatchmaking, cancelMatchmaking, listenForMatch, getUserRecentMatches } from '../services/matchmaking';
import UserRankCard from '../components/UserRankCard';
import RecentMatchCard from '../components/RecentMatchCard';
import AnimatedAvatar from '../components/AnimatedAvatar';

const RankedMatchPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [searchingStatus, setSearchingStatus] = useState<'idle' | 'searching' | 'found' | 'battle-card'>('idle');
  const [searchTime, setSearchTime] = useState(0);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const [avatarType, setAvatarType] = useState<'boy1' | 'boy2' | 'girl1' | 'girl2'>('boy1');
  const [opponent, setOpponent] = useState<string | null>(null);
  const [opponentProfile, setOpponentProfile] = useState<any>(null);
  const [unsubscribeMatch, setUnsubscribeMatch] = useState<(() => void) | null>(null);
  const [problemId, setProblemId] = useState<number | null>(null);
  
  // New state for battle card animation
  const [battleCardReady, setBattleCardReady] = useState(false);
  const [battleCardEntranceComplete, setBattleCardEntranceComplete] = useState(false);
  
  // Simplified searching animation
  const [searchingText, setSearchingText] = useState('Searching for opponent');
  
  // Clean up match listeners when unmounting
  useEffect(() => {
    return () => {
      if (unsubscribeMatch) {
        console.log("Cleaning up match listener on unmount");
        unsubscribeMatch();
      }
    };
  }, [unsubscribeMatch]);
  
  // Load user profile
  useEffect(() => {
    if (currentUser) {
      getUserProfile(currentUser.uid).then(({ data }) => {
        if (data) {
          setUserStats(data.stats);
          setAvatarType(data.selectedAvatar || 'boy1');
        }
      });
    }
  }, [currentUser]);
  
  // Load recent matches
  useEffect(() => {
    if (currentUser) {
      setLoadingMatches(true);
      getUserRecentMatches(currentUser.uid).then((matches) => {
        setRecentMatches(matches);
        setLoadingMatches(false);
      });
    }
  }, [currentUser]);

  // Set up timer for searching state
  useEffect(() => {
    let searchTimer: NodeJS.Timeout | null = null;
    
    if (searchingStatus === 'searching') {
      searchTimer = setInterval(() => {
        setSearchTime((prevTime) => prevTime + 1);
      }, 1000);
      
      // Simple text rotation for searching animation
      const textTimer = setInterval(() => {
        setSearchingText(prev => {
          const texts = [
            'Searching for opponent',
            'Searching for opponent.',
            'Searching for opponent..',
            'Searching for opponent...'
          ];
          const currentIndex = texts.indexOf(prev);
          return texts[(currentIndex + 1) % texts.length];
        });
      }, 500);
      
      return () => {
        if (searchTimer) clearInterval(searchTimer);
        clearInterval(textTimer);
      };
    } else if (searchTimer) {
      clearInterval(searchTimer);
    }
    
    return () => {
      if (searchTimer) clearInterval(searchTimer);
    };
  }, [searchingStatus]);

  // Load opponent profile when opponent ID is set
  useEffect(() => {
    const loadOpponentProfile = async () => {
      if (opponent && searchingStatus === 'battle-card') {
        try {
          const { data } = await getUserProfile(opponent);
          if (data) {
            setOpponentProfile(data);
            // Start entrance animation after profile is loaded
            setTimeout(() => {
              setBattleCardReady(true);
            }, 500);
          }
        } catch (error) {
          console.error("Failed to load opponent profile:", error);
          // If we can't load opponent profile, still show battle card with default values
          setBattleCardReady(true);
        }
      }
    };
    
    loadOpponentProfile();
  }, [opponent, searchingStatus]);

  // Handle match found - extract into a separate function for clarity
  const handleMatchFound = (match: any) => {
    console.log('Match found!', match);
    setSearchingStatus('found');
    setMatchId(match.id);
    setProblemId(match.problemId);
    
    // Determine opponent ID
    const opponentId = match.player1 === currentUser?.uid ? match.player2 : match.player1;
    setOpponent(opponentId);
    
    // Show battle card instead of immediate navigation
    setTimeout(() => {
      setSearchingStatus('battle-card');
    }, 1000);
  };

  // Proceed to the match after battle card animation
  const proceedToMatch = () => {
    if (!matchId || !problemId || !opponent) return;
    
    navigate(`/code/${problemId}`, { 
      state: { 
        matchId: matchId,
        isRankedMatch: true,
        opponent: opponent
      } 
    });
  };

  // Join matchmaking queue
  const handleJoinQueue = async () => {
    if (!currentUser) {
      setError('You must be logged in to join ranked matches');
      return;
    }
    
    try {
      setJoining(true);
      setError(null);
      
      // If we already have a match listener, clean it up first
      if (unsubscribeMatch) {
        unsubscribeMatch();
        setUnsubscribeMatch(null);
      }
      
      const result = await joinMatchmaking(currentUser.uid);
      
      if (result === 'waiting') {
        setSearchingStatus('searching');
        
        // Set up match listener
        const unsubscribe = listenForMatch(
          currentUser.uid,
          handleMatchFound, // Use extracted function
          (match) => {
            console.log('Match updated:', match);
            // Handle match updates if needed
          }
        );
        
        // Save unsubscribe function for cleanup
        setUnsubscribeMatch(() => unsubscribe);
      } else {
        // Match was immediately found - this is an existing match ID
        // Fetch match details and navigate
        const match = await fetch(`/api/matches/${result}`).then(res => res.json()).catch(() => null);
        
        if (match) {
          handleMatchFound(match);
        } else {
          // If we can't fetch match details, enter searching state and let the listener handle it
          setSearchingStatus('searching');
          
          // Set up match listener
          const unsubscribe = listenForMatch(
            currentUser.uid,
            handleMatchFound,
            (match) => {
              console.log('Match updated:', match);
            }
          );
          
          // Save unsubscribe function for cleanup
          setUnsubscribeMatch(() => unsubscribe);
        }
      }
    } catch (err: any) {
      console.error('Error joining matchmaking:', err);
      setError(err.message || 'Failed to join matchmaking');
      setSearchingStatus('idle');
    } finally {
      setJoining(false);
    }
  };

  const handleCancelSearch = async () => {
    if (!currentUser) return;
    
    try {
      await cancelMatchmaking(currentUser.uid);
      setSearchingStatus('idle');
      setSearchTime(0);
      
      // Clean up match listener when canceling search
      if (unsubscribeMatch) {
        unsubscribeMatch();
        setUnsubscribeMatch(null);
      }
    } catch (err: any) {
      console.error('Error canceling matchmaking:', err);
      setError(err.message || 'Failed to cancel matchmaking');
    }
  };

  // Format search time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get user rank badge
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

  // Battle Card Animation Sequences
  const battleCardVariants = {
    initial: { 
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  const playerCardVariants = {
    initial: (side: 'left' | 'right') => ({
      opacity: 0,
      x: side === 'left' ? -100 : 100,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    }
  };

  const vsTextVariants = {
    initial: {
      opacity: 0,
      scale: 2,
      rotate: -10
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.6,
        duration: 0.5,
        type: "spring",
        stiffness: 200
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      textShadow: [
        "0 0 10px rgba(244, 91, 105, 0.7)",
        "0 0 20px rgba(244, 91, 105, 0.9)",
        "0 0 10px rgba(244, 91, 105, 0.7)"
      ],
      transition: {
        repeat: Infinity,
        duration: 2
      }
    }
  };

  const lightningVariants = {
    initial: {
      pathLength: 0,
      opacity: 0
    },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 0.8,
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Render battle card
  const renderBattleCard = () => {
    if (searchingStatus !== 'battle-card') return null;

    return (
      <motion.div 
        className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {battleCardReady && (
          <motion.div 
            className="w-full max-w-4xl bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
            variants={battleCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onAnimationComplete={() => {
              setBattleCardEntranceComplete(true);
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] py-4 px-6 border-b border-white/20">
              <h2 className="text-white text-2xl font-bold text-center flex items-center justify-center gap-3">
                <Swords size={24} />
                Ranked Match
                <Swords size={24} />
              </h2>
            </div>

            {/* Battle Card Content */}
            <div className="p-8">
              <div className="relative flex items-center justify-between gap-2">
                {/* Current User */}
                <motion.div 
                  className="bg-[var(--primary)] bg-opacity-80 backdrop-blur-md rounded-xl p-6 border border-white/10 flex-1 max-w-[45%]"
                  custom="left"
                  variants={playerCardVariants}
                  initial="initial"
                  animate="animate"
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <AnimatedAvatar 
                        type={avatarType}
                        size={100}
                        interval={6000}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{userStats?.name || 'You'}</h3>
                    
                    {userStats?.rank && (
                      <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                        getUserRankBadge(userStats.rank).color
                      }`}>
                        {userStats.rank} <span>{getUserRankBadge(userStats.rank).icon}</span>
                      </div>
                    )}
                    
                    <div className="mt-4 w-full space-y-2">
                      <div className="bg-black bg-opacity-40 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-300">Rank Points</span>
                        <span className="font-bold text-[var(--accent)]">{userStats?.totalRankPoints || 0}</span>
                      </div>
                      <div className="bg-black bg-opacity-40 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-300">Win Rate</span>
                        <span className="font-bold text-white">{
                          userStats?.rankMatches > 0 
                            ? Math.round((userStats?.rankWins / userStats?.rankMatches) * 100)
                            : 0
                        }%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* VS Animation */}
                <div className="relative flex-shrink-0 z-10">
                  {/* Top lightning */}
                  <motion.svg 
                    width="100" 
                    height="50" 
                    viewBox="0 0 100 50" 
                    fill="none"
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
                  >
                    <motion.path 
                      d="M50,0 L60,20 L40,25 L55,45 L35,50"
                      stroke="url(#lightning-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      variants={lightningVariants}
                      initial="initial"
                      animate={battleCardEntranceComplete ? "animate" : "initial"}
                    />
                    <defs>
                      <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f45b69" />
                        <stop offset="100%" stopColor="#00d4ff" />
                      </linearGradient>
                    </defs>
                  </motion.svg>

                  {/* Bottom lightning */}
                  <motion.svg 
                    width="100" 
                    height="50" 
                    viewBox="0 0 100 50" 
                    fill="none"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full rotate-180"
                  >
                    <motion.path 
                      d="M50,0 L60,20 L40,25 L55,45 L35,50"
                      stroke="url(#lightning-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      variants={lightningVariants}
                      initial="initial"
                      animate={battleCardEntranceComplete ? "animate" : "initial"}
                    />
                  </motion.svg>

                  {/* VS Text */}
                  <motion.div 
                    className="text-7xl font-extrabold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]"
                    variants={vsTextVariants}
                    initial="initial"
                    animate="animate"
                    style={{ 
                      WebkitBackgroundClip: "text",
                      filter: "drop-shadow(0 0 15px rgba(244, 91, 105, 0.5))"
                    }}
                  >
                    VS
                  </motion.div>

                  {/* Pulsing circle behind VS */}
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] opacity-30 blur-md z-0"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                    }}
                  />
                </div>
                
                {/* Opponent */}
                <motion.div 
                  className="bg-[var(--primary)] bg-opacity-80 backdrop-blur-md rounded-xl p-6 border border-white/10 flex-1 max-w-[45%]"
                  custom="right"
                  variants={playerCardVariants}
                  initial="initial"
                  animate="animate"
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <AnimatedAvatar 
                        type={opponentProfile?.selectedAvatar || 'boy2'}
                        size={100}
                        interval={8000}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {opponentProfile?.name || opponentProfile?.coderName || 'Opponent'}
                    </h3>
                    
                    {opponentProfile?.stats?.rank && (
                      <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                        getUserRankBadge(opponentProfile.stats.rank).color
                      }`}>
                        {opponentProfile.stats.rank} <span>{getUserRankBadge(opponentProfile.stats.rank).icon}</span>
                      </div>
                    )}
                    
                    <div className="mt-4 w-full space-y-2">
                      <div className="bg-black bg-opacity-40 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-300">Rank Points</span>
                        <span className="font-bold text-[var(--accent)]">{opponentProfile?.stats?.totalRankPoints || 0}</span>
                      </div>
                      <div className="bg-black bg-opacity-40 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-300">Win Rate</span>
                        <span className="font-bold text-white">{
                          opponentProfile?.stats?.rankMatches > 0 
                            ? Math.round((opponentProfile?.stats?.rankWins / opponentProfile?.stats?.rankMatches) * 100)
                            : 0
                        }%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Battle Details */}
              <div className="mt-8 bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={20} />
                  Battle Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black bg-opacity-40 p-3 rounded-lg flex items-center gap-3">
                    <Shield className="text-[var(--accent)]" size={18} />
                    <div>
                      <div className="text-sm text-gray-300">Mode</div>
                      <div className="text-white font-medium">Ranked Match</div>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-40 p-3 rounded-lg flex items-center gap-3">
                    <Clock className="text-[var(--accent)]" size={18} />
                    <div>
                      <div className="text-sm text-gray-300">Time Limit</div>
                      <div className="text-white font-medium">10 minutes</div>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-40 p-3 rounded-lg flex items-center gap-3">
                    <Zap className="text-yellow-400" size={18} />
                    <div>
                      <div className="text-sm text-gray-300">Reward</div>
                      <div className="text-white font-medium">+1 Rank Point</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center">
                <motion.button
                  onClick={proceedToMatch}
                  className="btn-primary py-3 px-12 text-lg font-bold flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: battleCardEntranceComplete ? [
                      "0 0 10px rgba(244, 91, 105, 0.5)",
                      "0 0 20px rgba(244, 91, 105, 0.7)",
                      "0 0 10px rgba(244, 91, 105, 0.5)"
                    ] : "0 0 10px rgba(244, 91, 105, 0.5)",
                    transition: {
                      repeat: Infinity,
                      duration: 2
                    }
                  }}
                >
                  <Swords size={20} className="mr-3" />
                  Start Battle
                </motion.button>
              </div>
            </div>

            {/* Animated particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  initial={{
                    x: Math.random() * 100 + "%",
                    y: Math.random() * 100 + "%",
                    opacity: 0,
                    scale: 0
                  }}
                  animate={battleCardEntranceComplete ? {
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                  } : {}}
                  transition={{
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    duration: 2 + Math.random() * 2
                  }}
                  style={{
                    width: Math.random() * 6 + 2,
                    height: Math.random() * 6 + 2,
                    background: i % 2 === 0 
                      ? "linear-gradient(to right, #f45b69, #ff7b8a)" 
                      : "linear-gradient(to right, #00d4ff, #19e6ff)"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (!currentUser) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow py-12">
            <div className="container-custom">
              <div className="card text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Sign in to play ranked matches</h2>
                <p className="text-[var(--text-secondary)] mb-6">You need to be logged in to participate in ranked matches and earn rank points.</p>
                <a href="/login" className="btn-primary">Sign in</a>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow py-12">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-8">
                <Swords className="text-[var(--accent)] mr-3" size={28} />
                <h1 className="text-3xl font-bold">Ranked Matches</h1>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-9 space-y-8">
                  {/* Queue Card */}
                  <motion.div 
                    className="card overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {searchingStatus === 'idle' ? (
                      <>
                        <h2 className="text-2xl font-bold mb-2">Challenge another coder</h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                          Compete in a 1v1 coding challenge against another player. Solve problems faster and more accurately to win the match and increase your rank.
                        </p>
                        
                        <div className="bg-[var(--primary)] p-6 rounded-lg mb-6">
                          <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="mb-4 sm:mb-0">
                              <h3 className="text-lg font-semibold flex items-center">
                                <Trophy className="text-[var(--accent)] mr-2" size={20} />
                                Ranked Match Rules
                              </h3>
                              <ul className="mt-3 text-sm text-[var(--text-secondary)] space-y-2 list-disc pl-5">
                                <li>Both players receive the same problem to solve</li>
                                <li>The winner is determined by test cases passed and submission time</li>
                                <li>Win to earn rank points and climb the leaderboard</li>
                                <li>You have 10 minutes to solve the problem</li>
                              </ul>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="text-sm text-[var(--text-secondary)] mb-2">
                                Win Reward
                              </p>
                              <div className="flex items-center gap-2 bg-[var(--secondary)] px-3 py-1 rounded-lg">
                                <Trophy className="text-yellow-400" size={16} />
                                <span className="text-yellow-400 font-medium">+1 Rank Point</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {error && (
                          <div className="bg-red-500 bg-opacity-20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
                            <AlertCircle size={20} className="mr-2" />
                            <span>{error}</span>
                          </div>
                        )}
                        
                        <motion.button
                          className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center"
                          onClick={handleJoinQueue}
                          disabled={joining}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {joining ? (
                            <>
                              <div className="h-5 w-5 border-2 border-t-transparent rounded-full mr-3 animate-spin"></div>
                              Joining Queue...
                            </>
                          ) : (
                            <>
                              <Swords size={20} className="mr-2" />
                              Find Match Now
                            </>
                          )}
                        </motion.button>
                      </>
                    ) : searchingStatus === 'searching' ? (
                      <>
                        <div className="flex justify-between items-start">
                          <h2 className="text-2xl font-bold">{searchingText}</h2>
                          <div className="text-xl font-bold text-[var(--accent)]">
                            {formatTime(searchTime)}
                          </div>
                        </div>
                        
                        {/* Simplified search animation */}
                        <div className="relative h-40 my-8 bg-[var(--primary)] rounded-lg overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative flex items-center justify-center">
                              <AnimatedAvatar 
                                type={avatarType}
                                size={80}
                                interval={5000}
                              />
                              
                              <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-[var(--accent)] animate-spin" 
                                   style={{ animationDuration: '16s' }}></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center mb-8">
                          <p className="text-[var(--text-secondary)] mb-4">
                            We're finding the best match for your skill level. This might take a moment...
                          </p>
                          
                          <div className="h-2 bg-[var(--primary)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--accent)] animate-pulse w-full"></div>
                          </div>
                        </div>
                        
                        <motion.button
                          className="btn-secondary w-full py-4 text-lg font-bold flex items-center justify-center"
                          onClick={handleCancelSearch}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <UserMinus size={20} className="mr-2" />
                          Cancel Search
                        </motion.button>
                      </>
                    ) : searchingStatus === 'found' ? (
                      <>
                        <div className="text-center py-8">
                          <div className="mb-6">
                            <Swords size={60} className="mx-auto text-[var(--accent)]" />
                          </div>
                          
                          <h2 className="text-3xl font-bold mb-3">Match Found!</h2>
                          <p className="text-[var(--text-secondary)] mb-8">
                            Preparing your coding challenge...
                          </p>
                          
                          <div className="h-2 bg-[var(--primary)] rounded-full overflow-hidden max-w-md mx-auto">
                            <div className="h-full bg-[var(--accent)] animate-pulse w-full"></div>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </motion.div>
                  
                  {/* Recent Matches */}
                  <motion.div 
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Recent Matches</h2>
                      <button className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]">View All</button>
                    </div>
                    
                    {loadingMatches ? (
                      <div className="flex justify-center py-8">
                        <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : recentMatches.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {recentMatches.map(match => (
                          <RecentMatchCard 
                            key={match.id} 
                            match={match} 
                            currentUserId={currentUser?.uid || ''}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[var(--primary)] p-6 rounded-lg text-center">
                        <p className="text-[var(--text-secondary)]">No recent matches</p>
                        <p className="text-sm text-[var(--text-secondary)] mt-2">
                          Complete your first ranked match to see your history.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>
                
                {/* Right Column */}
                <div className="lg:col-span-3 space-y-6">
                  {/* User Rank Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <UserRankCard />
                  </motion.div>
                  
                  {/* Stats Card */}
                  <motion.div 
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-[var(--primary)] p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Matches</span>
                          <span className="font-medium">{userStats?.rankMatches || 0}</span>
                        </div>
                      </div>
                      
                      <div className="bg-[var(--primary)] p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Wins</span>
                          <span className="font-medium">{userStats?.rankWins || 0}</span>
                        </div>
                      </div>
                      
                      <div className="bg-[var(--primary)] p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Win Rate</span>
                          <span className="font-medium">
                            {userStats?.rankMatches > 0 ? Math.round((userStats.rankWins / userStats.rankMatches) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-[var(--primary)] p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Rank Points</span>
                          <span className="font-medium text-[var(--accent)]">{userStats?.totalRankPoints || 0}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Quick Tips */}
                  <motion.div 
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
                    
                    <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                      <p>
                        ⚡️ Speed matters! Ties are broken by submission time.
                      </p>
                      <p>
                        🎯 Make sure your solution passes all test cases.
                      </p>
                      <p>
                        💪 Consistent wins will help you climb ranks faster.
                      </p>
                      <p>
                        🏆 Reach Diamond rank to join exclusive tournaments.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        
        <Footer />

        {/* Battle Card Portal */}
        <AnimatePresence>
          {renderBattleCard()}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default RankedMatchPage;