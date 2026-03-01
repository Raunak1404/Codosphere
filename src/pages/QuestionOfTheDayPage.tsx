import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, Clock, Award, Package, Sparkles, Gift, Star, Zap, CheckCircle, ArrowRight, X, Flame, Users } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import { getProblemById, codingProblems } from '../data/codingProblems';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getProblemSolvers } from '../services/firebase';
import '../styles/study.css';

// Get a daily problem based on the current date
const getDailyProblem = () => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Use the seed to consistently select the same problem for the whole day
  const randomIndex = seed % codingProblems.length;
  return codingProblems[randomIndex] || codingProblems[0];
};

// Simplified confetti animation component
const Confetti = ({ isVisible }: { isVisible: boolean }) => {
  return isVisible ? (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          initial={{ 
            top: "-10%",
            left: `${Math.random() * 100}%`,
            backgroundColor: [
              "#f45b69", "#00d4ff", "#FFD700", "#FF69B4", "#00FF00"
            ][Math.floor(Math.random() * 5)]
          }}
          animate={{ 
            top: "110%",
            left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            rotate: Math.random() * 360
          }}
          transition={{ 
            duration: 2 + Math.random() * 1.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  ) : null;
};

const QuestionOfTheDayPage = () => {
  const { currentUser } = useAuth();
  const [questionOfTheDay, setQuestionOfTheDay] = useState(getDailyProblem());
  const [isBoxOpened, setIsBoxOpened] = useState(false);
  const [isBoxShaking, setIsBoxShaking] = useState(false);
  const [unboxProgress, setUnboxProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState<{x: number, y: number, size: number, color: string, speed: number}[]>([]);
  const [boxRotation, setBoxRotation] = useState(0);
  const [isBoxGlowing, setIsBoxGlowing] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardCollected, setRewardCollected] = useState(false);
  const [alreadySolved, setAlreadySolved] = useState(false);
  const [checkingSolved, setCheckingSolved] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);

  // Live solvers data
  const [solvers, setSolvers] = useState<any[]>([]);
  const [loadingSolvers, setLoadingSolvers] = useState(true);
  
  // Check if user already solved today's daily problem
  useEffect(() => {
    const checkIfSolved = async () => {
      if (!currentUser) {
        setCheckingSolved(false);
        return;
      }
      try {
        const { data } = await getUserProfile(currentUser.uid);
        if (data && data.solvedProblems?.includes(questionOfTheDay.id)) {
          setAlreadySolved(true);
        }
      } catch (err) {
        console.error('Error checking solved status:', err);
      } finally {
        setCheckingSolved(false);
      }
    };
    checkIfSolved();
  }, [currentUser, questionOfTheDay.id]);

  // Fetch live solvers for the daily problem
  useEffect(() => {
    const fetchSolvers = async () => {
      setLoadingSolvers(true);
      try {
        const { data } = await getProblemSolvers(questionOfTheDay.id, 10);
        setSolvers(data);
      } catch (err) {
        console.error('Error fetching solvers:', err);
      } finally {
        setLoadingSolvers(false);
      }
    };
    fetchSolvers();
  }, [questionOfTheDay.id]);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400';
      case 'Medium': return 'text-amber-400';
      case 'Hard': return 'text-rose-400';
      default: return 'text-[var(--text)]';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'Medium': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
      case 'Hard': return 'bg-rose-400/10 text-rose-400 border-rose-400/20';
      default: return '';
    }
  };

  // Calculate and update time remaining until the next day
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining({ hours, minutes, seconds });
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Create initial particles
  useEffect(() => {
    const newParticles = Array.from({ length: 10 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: ['#f45b69', '#00d4ff', '#FFD700'][Math.floor(Math.random() * 3)],
      speed: Math.random() * 1 + 0.5
    }));
    
    setParticles(newParticles);
  }, []);

  // Handle box click animation
  const handleBoxClick = (e: React.MouseEvent) => {
    if (isBoxOpened) return;
    
    setClickCount(prev => prev + 1);
    
    setIsBoxShaking(true);
    setTimeout(() => {
      setIsBoxShaking(false);
    }, 300);
    
    setBoxRotation(prev => prev + (Math.random() * 5 - 2.5));
    
    if (unboxProgress < 100) {
      const increment = Math.min(25, 100 - unboxProgress);
      setUnboxProgress(prev => prev + increment);
    }
    
    if (unboxProgress >= 50) {
      setIsBoxGlowing(true);
      setTimeout(() => setIsBoxGlowing(false), 400);
    }
    
    if (unboxProgress >= 75) {
      setTimeout(() => {
        setIsBoxOpened(true);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setShowReward(true);
        }, 2000);
      }, 300);
    }
  };

  // Handle reward collection
  const handleCollectReward = () => {
    setRewardCollected(true);
    setTimeout(() => {
      setShowReward(false);
    }, 1000);
  };

  if (!questionOfTheDay) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl">No question available for today</p>
              <Link
                to="/code"
                className="mt-4 flex items-center text-[var(--accent)] hover:underline justify-center"
              >
                <span>Browse all problems</span>
                <ChevronRight size={16} className="ml-1" />
              </Link>
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
            <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[var(--accent)] filter blur-[180px] opacity-[0.04]" />
            <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-[var(--accent-tertiary)] filter blur-[160px] opacity-[0.03]" />
            <div className="study-hex-grid opacity-[0.01]" />
          </div>

          <div className="container-custom relative z-10 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-[var(--accent-tertiary)]/10 border border-[var(--accent-tertiary)]/20">
                  <Calendar className="text-[var(--accent-tertiary)]" size={22} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-display tracking-tight">
                    Question of the{' '}
                    <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-tertiary)] bg-clip-text text-transparent">Day</span>
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </motion.div>
              
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Question Card */}
              <div className="lg:col-span-2 space-y-5">
                <motion.div 
                  className="topic-card relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <AnimatePresence mode="wait">
                    {checkingSolved ? (
                      <motion.div
                        key="loading"
                        className="flex flex-col items-center justify-center py-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="relative w-12 h-12 mb-4">
                          <div className="w-12 h-12 rounded-full border-2 border-white/[0.06]" />
                          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin" />
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">Loading today's challenge...</p>
                      </motion.div>
                    ) : alreadySolved ? (
                      <motion.div
                        key="already-solved"
                        className="flex flex-col items-center justify-center py-14 px-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-400/20 flex items-center justify-center mb-6"
                          animate={{ scale: [1, 1.04, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
                        >
                          <CheckCircle size={40} className="text-emerald-400" />
                        </motion.div>

                        <h2 className="text-2xl font-bold font-display mb-2 text-center">
                          Challenge Complete!
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-1 text-center max-w-md">
                          You've already solved today's challenge
                        </p>
                        <p className="text-sm mb-6 text-center text-[var(--accent)] font-medium">
                          {questionOfTheDay.title}
                        </p>

                        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 mb-6 w-full max-w-xs text-center">
                          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-1">Next Challenge In</p>
                          <p className="text-2xl font-bold font-display text-[var(--accent)]">
                            {timeRemaining.hours.toString().padStart(2, '0')}:
                            {timeRemaining.minutes.toString().padStart(2, '0')}:
                            {timeRemaining.seconds.toString().padStart(2, '0')}
                          </p>
                        </div>

                        <Link
                          to="/code"
                          className="btn-primary flex items-center justify-center py-2.5 px-6 group"
                        >
                          Practice More Problems
                          <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    ) : !isBoxOpened ? (
                      <motion.div 
                        className="flex flex-col items-center justify-center py-12 px-6"
                        key="unopened-box"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div 
                          className="relative mb-8 cursor-pointer"
                          onClick={handleBoxClick}
                          ref={boxRef}
                        >
                          <motion.div 
                            className="w-44 h-44 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`,
                            }}
                            animate={{ 
                              rotate: boxRotation,
                              boxShadow: isBoxGlowing 
                                ? "0 0 40px rgba(244, 91, 105, 0.5), 0 0 80px rgba(244, 91, 105, 0.2)" 
                                : "0 0 20px rgba(244, 91, 105, 0.15)"
                            }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.04 }}
                          >
                            <motion.div
                              animate={isBoxShaking ? {
                                x: [0, -5, 5, -5, 5, 0],
                                y: [0, -2, 2, -2, 2, 0],
                                transition: { duration: 0.3 }
                              } : {}}
                            >
                              <Package size={72} className="text-white/90" />
                            </motion.div>
                            
                            {/* Ambient particles */}
                            {particles.slice(0, 5).map((particle, i) => (
                              <motion.div
                                key={i}
                                className="absolute rounded-full"
                                animate={{
                                  x: [`${particle.x}%`, `${particle.x + (Math.random() * 20 - 10)}%`],
                                  y: [`${particle.y}%`, `${particle.y + (Math.random() * 20 - 10)}%`],
                                  opacity: [0.5, 0]
                                }}
                                transition={{
                                  duration: particle.speed * 2,
                                  ease: "linear",
                                  repeat: Infinity,
                                  repeatType: "reverse"
                                }}
                                style={{
                                  width: particle.size,
                                  height: particle.size,
                                  backgroundColor: particle.color
                                }}
                              />
                            ))}
                            
                            {unboxProgress > 0 && (
                              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" 
                                   style={{ opacity: unboxProgress / 200 }} />
                            )}
                          </motion.div>
                        </motion.div>
                        
                        <h2 className="text-xl font-bold font-display mb-3">Today's Coding Challenge</h2>
                        
                        {/* Progress bar */}
                        <div className="w-full max-w-sm mb-3">
                          <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] xp-bar-glow"
                              initial={{ width: 0 }}
                              animate={{ width: `${unboxProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                        
                        <p className="text-sm text-[var(--text-secondary)]">
                          {unboxProgress === 0 ? 'Click the box to reveal today\'s challenge!' :
                           unboxProgress < 50 ? 'Keep clicking to open the box!' : 
                           unboxProgress < 100 ? 'Almost there!' : 
                           'Revealing challenge...'}
                        </p>
                      </motion.div>
                    ) : showReward && !rewardCollected ? (
                      <motion.div
                        key="reward"
                        className="flex flex-col items-center justify-center py-14 px-6"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                      >
                        <motion.div
                          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/20 flex items-center justify-center mb-6"
                          animate={{ scale: [1, 1.06, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                        >
                          <Gift size={48} className="text-amber-400" />
                        </motion.div>
                        
                        <h2 className="text-xl font-bold font-display mb-2">Daily Reward Unlocked!</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-6 text-center max-w-md">
                          You've opened today's challenge. Solve the problem to earn even more rewards!
                        </p>
                        
                        <motion.button
                          className="btn-primary flex items-center gap-2"
                          onClick={handleCollectReward}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Star size={16} />
                          Collect Reward
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="question"
                        className="p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Question header */}
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="text-[var(--accent)]" size={18} />
                              <h2 className="text-xl font-bold font-display">{questionOfTheDay.title}</h2>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDifficultyBg(questionOfTheDay.difficulty)}`}>
                                {questionOfTheDay.difficulty}
                              </span>
                              <span className="text-xs text-[var(--text-secondary)]">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                          <div className="whitespace-pre-line text-[var(--text-secondary)]">{questionOfTheDay.description}</div>
                          
                          {questionOfTheDay.examples.length > 0 && (
                            <div className="mt-6">
                              <h3 className="text-base font-semibold font-display mb-3 text-[var(--text)]">Examples</h3>
                              <div className="space-y-3">
                                {questionOfTheDay.examples.map((example, idx) => (
                                  <div key={idx} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 font-mono text-xs">
                                    <div>
                                      <span className="font-semibold text-[var(--accent-secondary)]">Input:</span>{' '}
                                      <span className="text-[var(--text-secondary)]">{example.input}</span>
                                    </div>
                                    <div className="mt-1">
                                      <span className="font-semibold text-emerald-400">Output:</span>{' '}
                                      <span className="text-[var(--text-secondary)]">{example.output}</span>
                                    </div>
                                    {example.explanation && (
                                      <div className="mt-2 pt-2 border-t border-white/[0.04] text-[var(--text-secondary)] font-sans">
                                        <span className="font-semibold text-[var(--text)]">Explanation:</span> {example.explanation}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {questionOfTheDay.constraints.length > 0 && (
                            <div className="mt-6">
                              <h3 className="text-base font-semibold font-display mb-3 text-[var(--text)]">Constraints</h3>
                              <ul className="space-y-1.5">
                                {questionOfTheDay.constraints.map((constraint, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-[var(--text-secondary)]">
                                    <span className="text-[var(--accent)] mt-1 text-[10px]">&#9679;</span>
                                    <code className="text-xs bg-white/[0.03] px-1.5 py-0.5 rounded">{constraint}</code>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-8">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                              to={`/code/${questionOfTheDay.id}`}
                              className="btn-primary flex items-center justify-center w-full py-3 group"
                            >
                              Take on the Challenge
                              <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                {/* Timer Card */}
                <motion.div 
                  className="topic-card p-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-[var(--accent)]" size={16} />
                    <h3 className="text-sm font-semibold font-display">Time Remaining</h3>
                  </div>
                  
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-center">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[
                        { val: timeRemaining.hours, label: 'Hours' },
                        { val: timeRemaining.minutes, label: 'Minutes' },
                        { val: timeRemaining.seconds, label: 'Seconds' },
                      ].map((t, i) => (
                        <div key={i}>
                          <div className="text-2xl font-bold font-display text-[var(--accent)]">
                            {t.val.toString().padStart(2, '0')}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{t.label}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      Until the next question of the day
                    </p>
                  </div>
                </motion.div>
                
                {/* Top Solvers */}
                <motion.div 
                  className="topic-card p-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="text-[var(--accent-secondary)]" size={16} />
                    <h3 className="text-sm font-semibold font-display">Today's Solvers</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {loadingSolvers ? (
                      <div className="text-center py-4">
                        <div className="relative w-6 h-6 mx-auto">
                          <div className="w-6 h-6 rounded-full border-2 border-white/[0.06]" />
                          <div className="absolute inset-0 w-6 h-6 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin" />
                        </div>
                      </div>
                    ) : solvers.length === 0 ? (
                      <div className="text-center py-6 text-xs text-[var(--text-secondary)]">
                        <Award className="mx-auto mb-2 opacity-30" size={24} />
                        No one has solved today's challenge yet. Be the first!
                      </div>
                    ) : (
                      solvers.map((solver, index) => (
                        <div 
                          key={solver.id || index}
                          className="flex items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center mr-2.5 text-[10px] font-bold ${
                            index === 0 ? 'bg-amber-400/15 text-amber-400' : 
                            index === 1 ? 'bg-gray-400/15 text-gray-400' : 
                            index === 2 ? 'bg-amber-700/15 text-amber-600' : 
                            'bg-white/[0.03] text-[var(--text-secondary)]'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="text-sm font-medium truncate">{solver.coderName || solver.name || 'Anonymous'}</div>
                            <div className="text-[10px] text-[var(--text-secondary)]">
                              {solver.stats?.problemsSolved ?? 0} solved
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
                
                {/* Streak Card */}
                <motion.div 
                  className="topic-card p-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="text-[var(--accent-tertiary)]" size={16} />
                    <h3 className="text-sm font-semibold font-display">QotD Streak</h3>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold font-display text-[var(--accent)] mb-1">0</div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Solve today's question to start your streak!
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/[0.04] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">Next Reward</span>
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <Zap size={12} />
                        +50 XP
                      </span>
                    </div>
                    
                    <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: '10%' }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </div>
                    
                    <p className="text-[10px] text-[var(--text-secondary)] text-center">
                      3 day streak: unlock special badge
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      {/* Confetti */}
      <Confetti isVisible={showConfetti} />
      
      {/* Daily reward modal */}
      <AnimatePresence>
        {isBoxOpened && rewardCollected && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="topic-card p-8 max-w-sm w-full text-center relative overflow-hidden"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            >
              <button 
                onClick={() => setRewardCollected(false)}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white transition-colors z-10"
              >
                <X size={18} />
              </button>
              
              <div className="mb-5 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto">
                  <CheckCircle size={36} className="text-emerald-400" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold font-display mb-2 relative z-10">Reward Collected!</h2>
              
              <p className="text-sm text-[var(--text-secondary)] mb-6 relative z-10">
                You've opened today's challenge.<br />
                Solve the problem to earn even more rewards!
              </p>
              
              <div className="relative z-10">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to={`/code/${questionOfTheDay.id}`}
                    className="btn-primary w-full flex items-center justify-center group"
                  >
                    <ArrowRight size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                    Start Coding Now
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default QuestionOfTheDayPage;