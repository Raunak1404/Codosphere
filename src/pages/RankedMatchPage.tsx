import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Users, Clock, Trophy, AlertCircle, UserMinus, Zap, Shield, Target, TrendingUp } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/firebase';
import { joinMatchmaking, cancelMatchmaking, listenForMatch, getUserRecentMatches, getMatch } from '../services/matchmaking/index';
import UserRankCard from '../components/match/UserRankCard';
import RecentMatchCard from '../components/match/RecentMatchCard';
import AnimatedAvatar from '../components/common/AnimatedAvatar';
import '../styles/study.css';

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
  const [matchStartTime, setMatchStartTime] = useState<number | null>(null);
  
  // New state for battle card animation
  const [battleCardReady, setBattleCardReady] = useState(false);
  const [battleCardEntranceComplete, setBattleCardEntranceComplete] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Simplified searching animation
  const [searchingText, setSearchingText] = useState('Searching for opponent');

  // Refs: timeout handles so we can cancel them on reset/unmount
  const battleCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guard: prevents duplicate handleMatchFound processing from multiple listeners
  const matchHandledRef = useRef(false);
  // Stable ref so Firestore listeners always invoke the latest handleMatchFound
  const handleMatchFoundRef = useRef<((match: any) => void) | null>(null);
  
  // Reset all battle-card-related state so each match attempt starts fresh
  const resetBattleCardState = () => {
    setBattleCardReady(false);
    setBattleCardEntranceComplete(false);
    setCountdown(null);
    setOpponentProfile(null);
    setOpponent(null);
    setMatchId(null);
    setProblemId(null);
    setMatchStartTime(null);
    setSearchTime(0);
    setError(null);
    // Clear any pending timeouts from a previous match cycle
    if (battleCardTimeoutRef.current) { clearTimeout(battleCardTimeoutRef.current); battleCardTimeoutRef.current = null; }
    if (profileReadyTimeoutRef.current) { clearTimeout(profileReadyTimeoutRef.current); profileReadyTimeoutRef.current = null; }
    // Allow a new match to be processed
    matchHandledRef.current = false;
  };
  
  // Clean up match listeners and pending timeouts when unmounting
  useEffect(() => {
    return () => {
      if (unsubscribeMatch) {
        console.log("Cleaning up match listener on unmount");
        unsubscribeMatch();
      }
      if (battleCardTimeoutRef.current) clearTimeout(battleCardTimeoutRef.current);
      if (profileReadyTimeoutRef.current) clearTimeout(profileReadyTimeoutRef.current);
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

  // Load opponent profile as soon as we know the opponent (during 'found'),
  // so the data is already available when we reach 'battle-card'.
  useEffect(() => {
    const loadOpponentProfile = async () => {
      if (!opponent) return;
      if (searchingStatus !== 'found' && searchingStatus !== 'battle-card') return;

      console.log('[BattleCard] Loading opponent profile:', opponent);
      try {
        const { data } = await getUserProfile(opponent);
        if (data) {
          setOpponentProfile(data);
        }
      } catch (error) {
        console.error('[BattleCard] Failed to load opponent profile:', error);
      }
    };

    loadOpponentProfile();
  }, [opponent, searchingStatus]);

  // Once we're in 'battle-card' state AND have attempted profile loading,
  // mark the card ready after a short reveal delay.
  useEffect(() => {
    if (searchingStatus !== 'battle-card') return;
    // Wait a brief moment so the dark backdrop lands before the card springs in
    profileReadyTimeoutRef.current = setTimeout(() => {
      console.log('[BattleCard] Setting battleCardReady = true');
      setBattleCardReady(true);
    }, 250);
    return () => {
      if (profileReadyTimeoutRef.current) { clearTimeout(profileReadyTimeoutRef.current); profileReadyTimeoutRef.current = null; }
    };
  }, [searchingStatus]);

  // Lock body scroll & scroll to top only when battle card overlay is active
  useEffect(() => {
    if (searchingStatus === 'battle-card') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [searchingStatus]);

  // Start countdown after battle card entrance animation completes
  // The countdown is derived from the server's match startTime so both
  // players see the same value regardless of when they see the card.
  useEffect(() => {
    if (battleCardEntranceComplete && matchStartTime && searchingStatus === 'battle-card') {
      // Total battle-card window: 10 s from match creation.
      // Compute how many seconds have already elapsed.
      const elapsed = Math.floor((Date.now() - matchStartTime) / 1000);
      const remaining = Math.max(10 - elapsed, 1); // at least 1s so card is visible
      console.log('[BattleCard] Starting countdown:', { elapsed, remaining, matchStartTime });
      setCountdown(remaining);
    }
  }, [battleCardEntranceComplete, matchStartTime, searchingStatus]);

  // Tick the countdown and auto-navigate at zero
  useEffect(() => {
    if (countdown === null || searchingStatus !== 'battle-card') return;
    if (countdown <= 0) {
      console.log('[BattleCard] Countdown reached 0, navigating to match');
      proceedToMatch();
      return;
    }
    const tick = setTimeout(() => setCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearTimeout(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, searchingStatus]);

  // Handle match found - extract into a separate function for clarity
  const handleMatchFound = useCallback((match: any) => {
    console.log('[Matchmaking] handleMatchFound called:', match.id, { status: match.status, startTime: match.startTime });
    
    // Guard: if we've already processed a match this cycle, skip duplicates
    if (matchHandledRef.current) {
      console.warn('[Matchmaking] Duplicate match event ignored (already handling a match)');
      return;
    }
    
    // Reject stale matches (older than 2 minutes) from previous sessions
    const matchAge = Date.now() - (match.startTime || 0);
    const TWO_MINUTES = 2 * 60 * 1000;
    if (matchAge > TWO_MINUTES) {
      console.warn('[Matchmaking] Ignoring stale match:', match.id, `(${Math.round(matchAge / 1000)}s old)`);
      return;
    }
    
    // Mark as handled so duplicate listener firings are ignored
    matchHandledRef.current = true;
    
    // Clear any pending timeout from a previous cycle
    if (battleCardTimeoutRef.current) { clearTimeout(battleCardTimeoutRef.current); battleCardTimeoutRef.current = null; }
    
    // Reset battle card state so animations replay cleanly for this new match
    setBattleCardReady(false);
    setBattleCardEntranceComplete(false);
    setCountdown(null);
    setOpponentProfile(null);
    
    setSearchingStatus('found');
    setMatchId(match.id);
    setProblemId(match.problemId);
    setMatchStartTime(match.startTime || Date.now());
    
    // Determine opponent ID
    const opponentId = match.player1 === currentUser?.uid ? match.player2 : match.player1;
    setOpponent(opponentId);
    
    console.log('[Matchmaking] Transitioning to found state, will show battle card shortly');
    
    // Brief "Match Found!" flash, then transition to the battle-card overlay
    battleCardTimeoutRef.current = setTimeout(() => {
      console.log('[Matchmaking] Transitioning to battle-card state');
      setSearchingStatus('battle-card');
    }, 400);
  }, [currentUser?.uid]);
  
  // Keep the ref in sync so Firestore listeners always call the latest version
  useEffect(() => {
    handleMatchFoundRef.current = handleMatchFound;
  }, [handleMatchFound]);

  // Proceed to the match after battle card animation
  const proceedToMatch = () => {
    if (!matchId || !problemId || !opponent) return;
    
    navigate(`/code/${problemId}`, { 
      state: { 
        matchId: matchId,
        isRankedMatch: true,
        opponent: opponent,
        matchStartTime: matchStartTime
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
      resetBattleCardState();
      setSearchingStatus('idle');
      
      // Ensure user profile exists in Firestore before matchmaking.
      // This auto-creates the profile doc if missing, which some
      // Firestore security rules require before allowing writes
      // to matchRooms / matches collections.
      await getUserProfile(currentUser.uid);
      
      // If we already have a match listener, clean it up first
      if (unsubscribeMatch) {
        unsubscribeMatch();
        setUnsubscribeMatch(null);
      }
      
      const result = await joinMatchmaking(currentUser.uid);
      
      if (result === 'waiting') {
        setSearchingStatus('searching');
        
        // Set up match listener — use ref so the listener always calls the latest closure
        const unsubscribe = listenForMatch(
          currentUser.uid,
          (match) => handleMatchFoundRef.current?.(match),
          (match) => {
            console.log('Match updated:', match);
            // Handle match updates if needed
          }
        );
        
        // Save unsubscribe function for cleanup
        setUnsubscribeMatch(() => unsubscribe);
      } else {
        // joinMatchmaking returned a match ID (user has an existing active match)
        const match = await getMatch(result);
        
        if (match) {
          // Check if the match is stale (startTime older than 2 minutes)
          const matchAge = Date.now() - (match.startTime || 0);
          const TWO_MINUTES = 2 * 60 * 1000;
          
          if (matchAge > TWO_MINUTES) {
            // Stale match from a previous session — ignore it and start fresh
            console.warn('Found stale match, starting fresh search:', match.id);
            setSearchingStatus('searching');
            
            const unsubscribe = listenForMatch(
              currentUser.uid,
              (m) => handleMatchFoundRef.current?.(m),
              (m) => {
                console.log('Match updated:', m);
              }
            );
            setUnsubscribeMatch(() => unsubscribe);
          } else {
            // Fresh match — proceed with it
            handleMatchFound(match);
          }
        } else {
          // Match not found in DB — enter searching state
          setSearchingStatus('searching');
          
          const unsubscribe = listenForMatch(
            currentUser.uid,
            (m) => handleMatchFoundRef.current?.(m),
            (m) => {
              console.log('Match updated:', m);
            }
          );
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
      resetBattleCardState();
      
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

  // Battle Card Animation Sequences — enhanced for combative feel
  const battleCardVariants = {
    initial: { opacity: 0, scale: 0.85, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, type: "spring", stiffness: 120, damping: 14 }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  // Render battle card — uses a portal to render outside the page layout
  // so that fixed positioning truly centers on the viewport
  const renderBattleCard = () => {
    if (searchingStatus !== 'battle-card') return null;

    const userWinRate = userStats?.rankMatches > 0
      ? Math.round((userStats?.rankWins / userStats?.rankMatches) * 100)
      : 0;
    const oppWinRate = opponentProfile?.stats?.rankMatches > 0
      ? Math.round((opponentProfile?.stats?.rankWins / opponentProfile?.stats?.rankMatches) * 100)
      : 0;

    const card = (
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ isolation: 'isolate' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Full-screen dark backdrop */}
        <div className="absolute inset-0 bg-black/92" />
        {/* Radial energy glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(244,91,105,0.10) 0%, rgba(0,212,255,0.04) 40%, transparent 70%)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />

        {!battleCardReady && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 tracking-wide">Preparing battle...</p>
          </div>
        )}

        {battleCardReady && (
          <motion.div
            className="relative w-full max-w-3xl mx-4"
            variants={battleCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onAnimationComplete={() => {
              console.log('[BattleCard] Entrance animation complete');
              setBattleCardEntranceComplete(true);
            }}
          >
            {/* Outer animated glow border */}
            <motion.div
              className="absolute -inset-[1.5px] rounded-2xl opacity-40 blur-[2px]"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary), var(--accent))' }}
              animate={{ opacity: [0.3, 0.55, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />

            <div className="relative bg-[#0c0a10] rounded-2xl border border-white/[0.08] overflow-hidden">
              {/* Animated top accent line */}
              <motion.div
                className="h-[2px]"
                style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary), var(--accent))', backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              />

              {/* Header */}
              <motion.div
                className="text-center pt-5 pb-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-[var(--accent)] font-semibold mb-1.5 opacity-70">Competitive 1 v 1</p>
                <h2 className="text-2xl font-bold font-display text-white flex items-center justify-center gap-2.5">
                  <Swords size={20} className="text-[var(--accent)]" />
                  <span>Ranked Match</span>
                  <Swords size={20} className="text-[var(--accent)]" />
                </h2>
              </motion.div>

              {/* ═══ PLAYERS VS SECTION ═══ */}
              <div className="px-6 pt-1 pb-3">
                <div className="relative flex items-start justify-between">

                  {/* ── Player 1 (You) ── */}
                  <motion.div
                    className="flex-1 max-w-[42%]"
                    initial={{ x: -280, opacity: 0, rotate: -5 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 65, damping: 12, delay: 0.2 }}
                  >
                    <div className="relative rounded-xl bg-white/[0.025] border border-white/[0.06] p-4">
                      {/* Side accent */}
                      <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-[var(--accent)] to-transparent opacity-50" />
                      {/* Pulsing aura */}
                      <motion.div
                        className="absolute -inset-2 rounded-xl blur-lg -z-10"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(244,91,105,0.12), transparent 70%)' }}
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                      />

                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <AnimatedAvatar type={avatarType} size={80} interval={6000} />
                          {/* Rank dot */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0c0a10] flex items-center justify-center">
                            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)]" />
                          </div>
                        </div>
                        <h3 className="text-base font-bold text-white mt-3 truncate max-w-full">{userStats?.name || 'You'}</h3>
                        {userStats?.rank && (
                          <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserRankBadge(userStats.rank).color}`}>
                            {getUserRankBadge(userStats.rank).icon} {userStats.rank}
                          </div>
                        )}

                        {/* Stats grid */}
                        <div className="mt-3 w-full grid grid-cols-2 gap-2">
                          <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 text-center">
                            <div className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Points</div>
                            <div className="text-sm font-bold text-[var(--accent)]">{userStats?.totalRankPoints || 0}</div>
                          </div>
                          <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 text-center">
                            <div className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Win Rate</div>
                            <div className="text-sm font-bold text-white">{userWinRate}%</div>
                          </div>
                          <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 text-center">
                            <div className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Wins</div>
                            <div className="text-sm font-bold text-green-400">{userStats?.rankWins || 0}</div>
                          </div>
                          <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 text-center">
                            <div className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Matches</div>
                            <div className="text-sm font-bold text-gray-300">{userStats?.rankMatches || 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── VS Center ── */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center relative z-10 w-[16%] self-center">
                    {/* Lightning SVG */}
                    <motion.svg
                      width="50" height="70" viewBox="0 0 50 70" fill="none"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      initial={{ opacity: 0 }}
                      animate={battleCardEntranceComplete ? { opacity: [0, 1, 0.7, 1] } : { opacity: 0 }}
                      transition={{ delay: 0.15, duration: 0.5 }}
                    >
                      <motion.path
                        d="M30,0 L12,28 L24,28 L16,70"
                        stroke="url(#bolt-grad)" strokeWidth="2" strokeLinecap="round" fill="none"
                        initial={{ pathLength: 0 }}
                        animate={battleCardEntranceComplete ? { pathLength: 1 } : { pathLength: 0 }}
                        transition={{ delay: 0.7, duration: 0.35, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="bolt-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f45b69" />
                          <stop offset="100%" stopColor="#00d4ff" />
                        </linearGradient>
                      </defs>
                    </motion.svg>

                    {/* Energy rings */}
                    <motion.div
                      className="absolute w-16 h-16 rounded-full border-2 border-[var(--accent)]/20"
                      animate={battleCardEntranceComplete ? {
                        scale: [1, 1.8, 1], opacity: [0.25, 0, 0.25],
                      } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />

                    {/* VS */}
                    <motion.div
                      className="relative z-10 text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b from-[var(--accent)] to-[var(--accent-secondary)]"
                      initial={{ scale: 5, opacity: 0, rotate: -30 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.5 }}
                      style={{ filter: "drop-shadow(0 0 18px rgba(244,91,105,0.5))" }}
                    >
                      VS
                    </motion.div>

                    {/* Glow pulse */}
                    <motion.div
                      className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-[var(--accent)] blur-xl"
                      animate={battleCardEntranceComplete ? { opacity: [0.15, 0.4, 0.15], scale: [1, 1.4, 1] } : { opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </div>

                  {/* ── Player 2 (Opponent) ── */}
                  <motion.div
                    className="flex-1 max-w-[42%]"
                    initial={{ x: 280, opacity: 0, rotate: 5 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 65, damping: 12, delay: 0.2 }}
                  >
                    <div className="relative rounded-xl bg-white/[0.025] border border-white/[0.06] p-4">
                      {/* Side accent */}
                      <div className="absolute right-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-[var(--accent-secondary)] to-transparent opacity-50" />
                      {/* Pulsing aura */}
                      <motion.div
                        className="absolute -inset-2 rounded-xl blur-lg -z-10"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.10), transparent 70%)' }}
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: 0.4 }}
                      />

                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <AnimatedAvatar type={opponentProfile?.selectedAvatar || 'boy2'} size={80} interval={8000} />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0c0a10] flex items-center justify-center">
                            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[var(--accent-secondary)] to-[var(--accent)]" />
                          </div>
                        </div>
                        <h3 className="text-base font-bold text-white mt-3 truncate max-w-full">
                          {opponentProfile?.name || opponentProfile?.coderName || 'Opponent'}
                        </h3>
                        {opponentProfile?.stats?.rank && (
                          <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserRankBadge(opponentProfile.stats.rank).color}`}>
                            {getUserRankBadge(opponentProfile.stats.rank).icon} {opponentProfile.stats.rank}
                          </div>
                        )}

                        {/* Stats grid */}
                        <div className="mt-3 w-full grid grid-cols-2 gap-2">
                          <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 text-center">
                            <div className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Points</div>
                            <div className="text-sm font-bold text-[var(--accent)]">{opponentProfile?.stats?.totalRankPoints || 0}</div>
                          </div>
                          <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 text-center">
                            <div className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Win Rate</div>
                            <div className="text-sm font-bold text-white">{oppWinRate}%</div>
                          </div>
                          <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 text-center">
                            <div className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Wins</div>
                            <div className="text-sm font-bold text-green-400">{opponentProfile?.stats?.rankWins || 0}</div>
                          </div>
                          <div className="bg-white/[0.03] rounded-lg px-2.5 py-2 text-center">
                            <div className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Matches</div>
                            <div className="text-sm font-bold text-gray-300">{opponentProfile?.stats?.rankMatches || 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ═══ BATTLE INFO BAR ═══ */}
              <motion.div
                className="mx-6 mb-4 rounded-xl bg-white/[0.02] border border-white/[0.05] px-5 py-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock size={13} className="text-[var(--accent-secondary)]" />
                      <span>10 min limit</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Shield size={13} className="text-[var(--accent)]" />
                      <span>Ranked</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Target size={13} className="text-[var(--accent-secondary)]" />
                      <span>Same problem</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400">
                    <Zap size={13} />
                    <span>+1 Rank Point</span>
                  </div>
                </div>
              </motion.div>

              {/* ═══ BUCKLE UP & COUNTDOWN ═══ */}
              <AnimatePresence mode="wait">
                {battleCardEntranceComplete && (
                  <motion.div
                    className="pb-6 text-center"
                    initial={{ opacity: 0, y: 15, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.05 }}
                  >
                    <motion.p
                      className="text-lg font-extrabold uppercase tracking-[0.3em] text-white"
                      animate={{
                        textShadow: [
                          "0 0 8px rgba(244,91,105,0.4)",
                          "0 0 30px rgba(244,91,105,0.8)",
                          "0 0 8px rgba(244,91,105,0.4)",
                        ],
                      }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Buckle Up!
                    </motion.p>

                    {countdown !== null && (
                      <motion.div
                        key={countdown}
                        className="text-6xl font-black mt-1 bg-clip-text text-transparent bg-gradient-to-b from-[var(--accent)] to-[var(--accent-secondary)]"
                        initial={{ scale: 3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 14 }}
                        style={{ filter: "drop-shadow(0 0 14px rgba(244,91,105,0.5))" }}
                      >
                        {countdown}
                      </motion.div>
                    )}

                    {/* Progress bar */}
                    {countdown !== null && (
                      <div className="mt-3 mx-auto max-w-[200px] h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]"
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ duration: 10, ease: "linear" }}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Floating spark particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  initial={{
                    left: `${45 + Math.random() * 10}%`,
                    top: `${45 + Math.random() * 10}%`,
                    opacity: 0, scale: 0,
                  }}
                  animate={battleCardEntranceComplete ? {
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                  } : {}}
                  transition={{
                    delay: 0.4 + Math.random() * 1.5,
                    repeat: Infinity,
                    duration: 1.8 + Math.random() * 2,
                    ease: "easeOut",
                  }}
                  style={{
                    width: Math.random() * 3 + 1.5,
                    height: Math.random() * 3 + 1.5,
                    background: i % 3 === 0 ? '#f45b69' : i % 3 === 1 ? '#00d4ff' : '#ffffff',
                    boxShadow: i % 3 === 0 ? '0 0 6px #f45b69' : i % 3 === 1 ? '0 0 6px #00d4ff' : '0 0 3px #fff',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );

    // Render via portal to escape any parent layout/stacking issues
    return ReactDOM.createPortal(card, document.body);
  };

  if (!currentUser) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow flex items-center justify-center py-12">
            <div className="container-custom max-w-md">
              <div className="topic-card text-center p-8">
                <div className="mx-auto w-12 h-12 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mb-4">
                  <Shield className="text-[var(--accent)]" size={22} />
                </div>
                <h2 className="text-xl font-bold font-display mb-2">Sign in to play ranked matches</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-5">You need to be logged in to participate in ranked matches and earn rank points.</p>
                <a href="/login" className="btn-primary text-sm py-2.5 px-6">Sign In</a>
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

        <main className="flex-grow relative">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-[var(--accent)] filter blur-[180px] opacity-[0.03]" />
            <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-[var(--accent-secondary)] filter blur-[150px] opacity-[0.02]" />
            <div className="study-hex-grid opacity-[0.008]" />
          </div>

          <div className="container-custom relative z-10 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                  <Swords className="text-[var(--accent)]" size={22} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-display tracking-tight">
                    Ranked <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">Matches</span>
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">Compete 1v1 and climb the leaderboard</p>
                </div>
              </div>
            </motion.div>
              
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-9 space-y-6">
                {/* Queue Card */}
                <motion.div 
                  className="topic-card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                >
                  {searchingStatus === 'idle' ? (
                    <div className="p-6">
                      <h2 className="text-xl font-bold font-display mb-1.5">Challenge another coder</h2>
                      <p className="text-sm text-[var(--text-secondary)] mb-5">
                        Compete in a 1v1 coding challenge. Solve problems faster and more accurately to win and increase your rank.
                      </p>
                      
                      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 mb-5">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                              <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
                                <Trophy className="text-amber-400" size={14} />
                              </div>
                              Ranked Match Rules
                            </h3>
                            <ul className="text-xs text-[var(--text-secondary)] space-y-1.5">
                              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[var(--accent)]" />Both players receive the same problem to solve</li>
                              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[var(--accent)]" />Winner determined by test cases passed & submission time</li>
                              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[var(--accent)]" />Win to earn rank points and climb the leaderboard</li>
                              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[var(--accent)]" />You have 10 minutes to solve the problem</li>
                            </ul>
                          </div>
                          <div className="flex flex-col items-center shrink-0">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Win Reward</p>
                            <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg">
                              <Trophy className="text-amber-400" size={14} />
                              <span className="text-amber-400 text-xs font-semibold">+1 Rank Point</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="bg-rose-400/10 border border-rose-400/20 text-rose-400 p-3 rounded-xl mb-5 flex items-center gap-2 text-sm">
                          <AlertCircle size={16} />
                          <span>{error}</span>
                        </div>
                      )}
                      
                      <motion.button
                        className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center rounded-xl"
                        onClick={handleJoinQueue}
                        disabled={joining}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {joining ? (
                          <>
                            <div className="h-4 w-4 border-2 border-t-transparent rounded-full mr-2.5 animate-spin" />
                            Joining Queue...
                          </>
                        ) : (
                          <>
                            <Swords size={18} className="mr-2" />
                            Find Match Now
                          </>
                        )}
                      </motion.button>
                    </div>
                  ) : searchingStatus === 'searching' ? (
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-1">
                        <h2 className="text-lg font-bold font-display">{searchingText}</h2>
                        <div className="text-base font-bold text-[var(--accent)] font-mono">
                          {formatTime(searchTime)}
                        </div>
                      </div>
                      
                      {/* Radar-scan search animation */}
                      <div className="relative h-36 my-6 rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative flex items-center justify-center">
                            <AnimatedAvatar 
                              type={avatarType}
                              size={80}
                              interval={5000}
                            />
                            
                            {/* Radar scan rings */}
                            <div className="radar-ring w-20 h-20"></div>
                            <div className="radar-ring w-20 h-20"></div>
                            <div className="radar-ring w-20 h-20"></div>
                            <div className="radar-ring w-20 h-20"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mb-6">
                        <p className="text-xs text-[var(--text-secondary)] mb-3">
                          Finding the best match for your skill level...
                        </p>
                        
                        <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden max-w-xs mx-auto">
                          <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] animate-pulse w-full rounded-full" />
                        </div>
                      </div>
                      
                      <motion.button
                        className="w-full py-3 text-sm font-semibold flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                        onClick={handleCancelSearch}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <UserMinus size={16} className="mr-2" />
                        Cancel Search
                      </motion.button>
                    </div>
                  ) : (searchingStatus === 'found' || searchingStatus === 'battle-card') ? (
                    <div className="p-6">
                      <div className="text-center py-6">
                        <div className="mx-auto w-14 h-14 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mb-4">
                          <Swords size={28} className="text-[var(--accent)]" />
                        </div>
                        
                        <h2 className="text-2xl font-bold font-display mb-2">Match Found!</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                          Preparing your coding challenge...
                        </p>
                        
                        <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden max-w-xs mx-auto">
                          <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] animate-pulse w-full rounded-full" />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
                
                {/* Recent Matches */}
                <motion.div 
                  className="topic-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold font-display">Recent Matches</h2>
                  </div>
                  
                  {loadingMatches ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="relative w-8 h-8 mb-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white/[0.06]" />
                        <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin" />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">Loading matches...</p>
                    </div>
                  ) : recentMatches.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {recentMatches.map(match => (
                        <RecentMatchCard 
                          key={match.id} 
                          match={match} 
                          currentUserId={currentUser?.uid || ''}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 text-center">
                      <p className="text-sm text-[var(--text-secondary)]">No recent matches</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Complete your first ranked match to see your history.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
              
              {/* Right Column */}
              <div className="lg:col-span-3 space-y-4">
                {/* User Rank Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <UserRankCard />
                </motion.div>
                
                {/* Stats Card */}
                <motion.div 
                  className="topic-card p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-sm font-semibold font-display mb-3 flex items-center gap-2">
                    <TrendingUp size={14} className="text-[var(--accent-secondary)]" />
                    Your Stats
                  </h3>
                  
                  <div className="space-y-2">
                    {[
                      { label: 'Matches', value: userStats?.rankMatches || 0, color: 'text-[var(--text)]' },
                      { label: 'Wins', value: userStats?.rankWins || 0, color: 'text-emerald-400' },
                      { label: 'Win Rate', value: `${userStats?.rankMatches > 0 ? Math.round((userStats.rankWins / userStats.rankMatches) * 100) : 0}%`, color: 'text-[var(--text)]' },
                      { label: 'Rank Points', value: userStats?.totalRankPoints || 0, color: 'text-[var(--accent)]' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[var(--text-secondary)]">{stat.label}</span>
                          <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Quick Tips */}
                <motion.div 
                  className="topic-card p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <h3 className="text-sm font-semibold font-display mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    Quick Tips
                  </h3>
                  
                  <div className="space-y-2.5">
                    {[
                      { emoji: '⚡️', text: 'Speed matters! Ties are broken by submission time.' },
                      { emoji: '🎯', text: 'Make sure your solution passes all test cases.' },
                      { emoji: '💪', text: 'Consistent wins help you climb ranks faster.' },
                      { emoji: '🏆', text: 'Reach Diamond rank to join exclusive tournaments.' },
                    ].map((tip, i) => (
                      <div key={i} className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2 text-xs text-[var(--text-secondary)]">
                        <span className="mr-1.5">{tip.emoji}</span>{tip.text}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />

        {/* Battle Card — rendered via portal */}
        {renderBattleCard()}
      </div>
    </PageTransition>
  );
};

export default RankedMatchPage;