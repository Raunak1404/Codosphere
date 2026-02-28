import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, Clock, Award, Package, Sparkles, Gift, Star, Zap, CheckCircle, ArrowRight, X } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import { getProblemById, codingProblems } from '../data/codingProblems';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getProblemSolvers } from '../services/firebase';

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
      {Array.from({ length: 30 }).map((_, i) => ( // Reduced from 100 to 30
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
            duration: 2 + Math.random() * 1.5, // Faster animation
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
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-[var(--text)]';
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

    // Update immediately then set interval
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Create initial particles - reduced count
  useEffect(() => {
    const newParticles = Array.from({ length: 10 }).map(() => ({ // Reduced from 30 to 10
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1, // Smaller particles
      color: ['#f45b69', '#00d4ff', '#FFD700'][Math.floor(Math.random() * 3)],
      speed: Math.random() * 1 + 0.5
    }));
    
    setParticles(newParticles);
  }, []);

  // Handle box click animation - simplified
  const handleBoxClick = (e: React.MouseEvent) => {
    if (isBoxOpened) return;
    
    // Update click count
    setClickCount(prev => prev + 1);
    
    // Simplified shake animation
    setIsBoxShaking(true);
    setTimeout(() => {
      setIsBoxShaking(false);
    }, 300); // Reduced duration
    
    // Rotate box slightly with each click
    setBoxRotation(prev => prev + (Math.random() * 5 - 2.5)); // Smaller rotation
    
    // Increase the progress with each click
    if (unboxProgress < 100) {
      const increment = Math.min(25, 100 - unboxProgress);
      setUnboxProgress(prev => prev + increment);
    }
    
    // Glow effect as progress increases
    if (unboxProgress >= 50) {
      setIsBoxGlowing(true);
      setTimeout(() => setIsBoxGlowing(false), 400); // Reduced duration
    }
    
    // Open the box when progress is complete
    if (unboxProgress >= 75) {
      setTimeout(() => {
        setIsBoxOpened(true);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setShowReward(true);
        }, 2000); // Reduced confetti duration
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

        <main className="flex-grow py-12">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-8">
                <Calendar className="text-[var(--accent)] mr-3" size={28} />
                <h1 className="text-3xl font-bold font-display tracking-tight">Question of the Day</h1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Question Card */}
                <div className="md:col-span-2 space-y-6">
                  <motion.div 
                    className="card-interactive relative overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnimatePresence mode="wait">
                      {checkingSolved ? (
                        <motion.div
                          key="loading"
                          className="flex flex-col items-center justify-center py-16"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="h-10 w-10 border-t-2 border-b-2 border-[var(--accent)] rounded-full animate-spin mb-4" />
                          <p className="text-[var(--text-secondary)]">Loading...</p>
                        </motion.div>
                      ) : alreadySolved ? (
                        <motion.div
                          key="already-solved"
                          className="flex flex-col items-center justify-center py-12 px-6"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-6"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          >
                            <CheckCircle size={56} className="text-white" />
                          </motion.div>

                          <h2 className="text-2xl font-bold font-display mb-2 text-center">
                            Congratulations! 🎉
                          </h2>
                          <p className="text-[var(--text-secondary)] mb-2 text-center max-w-md">
                            You've already solved today's challenge — <span className="text-[var(--accent)] font-semibold">{questionOfTheDay.title}</span>
                          </p>
                          <p className="text-[var(--text-secondary)] mb-6 text-center max-w-md">
                            Come back tomorrow for a brand new challenge!
                          </p>

                          <div className="bg-[var(--primary)] rounded-lg p-4 mb-6 w-full max-w-sm text-center">
                            <p className="text-sm text-[var(--text-secondary)] mb-1">Next challenge in</p>
                            <p className="text-2xl font-bold text-[var(--accent)]">
                              {timeRemaining.hours.toString().padStart(2, '0')}:
                              {timeRemaining.minutes.toString().padStart(2, '0')}:
                              {timeRemaining.seconds.toString().padStart(2, '0')}
                            </p>
                          </div>

                          <Link
                            to="/code"
                            className="btn-primary flex items-center justify-center py-3 px-6 group"
                          >
                            Practice More Problems
                            <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </motion.div>
                      ) : !isBoxOpened ? (
                        <motion.div 
                          className="flex flex-col items-center justify-center py-10"
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
                              className="w-48 h-48 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] rounded-xl shadow-xl flex items-center justify-center relative overflow-hidden"
                              animate={{ 
                                rotate: boxRotation,
                                boxShadow: isBoxGlowing ? "0 0 20px rgba(244, 91, 105, 0.4)" : "0 0 10px rgba(244, 91, 105, 0.2)"
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div
                                animate={isBoxShaking ? {
                                  x: [0, -5, 5, -5, 5, 0],
                                  y: [0, -2, 2, -2, 2, 0],
                                  transition: { duration: 0.3 }
                                } : {}}
                              >
                                <Package size={80} className="text-white" />
                              </motion.div>
                              
                              {/* Simplified particles */}
                              {particles.slice(0, 5).map((particle, i) => ( // Show fewer particles
                                <motion.div
                                  key={i}
                                  className="absolute rounded-full"
                                  animate={{
                                    x: [`${particle.x}%`, `${particle.x + (Math.random() * 20 - 10)}%`],
                                    y: [`${particle.y}%`, `${particle.y + (Math.random() * 20 - 10)}%`],
                                    opacity: [0.5, 0]
                                  }}
                                  transition={{
                                    duration: particle.speed * 2, // Slower animation
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
                                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/10 backdrop-blur-sm" 
                                     style={{ opacity: unboxProgress / 200 }} />
                              )}
                            </motion.div>
                          </motion.div>
                          
                          <h2 className="text-2xl font-bold font-display mb-4">Today's Coding Challenge</h2>
                          
                          <div className="w-full max-w-md bg-[var(--primary)] h-4 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${unboxProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          
                          <p className="mt-4 text-[var(--text-secondary)]">
                            {unboxProgress === 0 ? 'Click the box to reveal today\'s challenge!' :
                             unboxProgress < 50 ? 'Keep clicking to open the box!' : 
                             unboxProgress < 100 ? 'Almost there!' : 
                             'Revealing challenge...'}
                          </p>
                        </motion.div>
                      ) : showReward && !rewardCollected ? (
                        <motion.div
                          key="reward"
                          className="flex flex-col items-center justify-center py-12"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                        >
                          <motion.div
                            className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mb-6"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                          >
                            <Gift size={64} className="text-white" />
                          </motion.div>
                          
                          <h2 className="text-2xl font-bold font-display mb-2">Daily Reward Unlocked!</h2>
                          <p className="text-[var(--text-secondary)] mb-6 text-center max-w-md">
                            You've opened today's challenge.
                            Solve this problem to earn even more rewards!
                          </p>
                          
                          <motion.button
                            className="btn-primary flex items-center"
                            onClick={handleCollectReward}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Star size={18} className="mr-2" />
                            Collect Reward
                          </motion.button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="question"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center">
                                <Sparkles className="text-[var(--accent)] mr-2" size={20} />
                                <h2 className="text-2xl font-bold font-display">{questionOfTheDay.title}</h2>
                              </div>
                              <div className="flex items-center mt-1">
                                <span className={`text-sm font-medium ${getDifficultyColor(questionOfTheDay.difficulty)}`}>
                                  {questionOfTheDay.difficulty}
                                </span>
                                <span className="text-[var(--text-secondary)] mx-2">•</span>
                                <span className="text-sm text-[var(--text-secondary)]">{
                                  new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                }</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="prose prose-invert max-w-none">
                            <div className="whitespace-pre-line">{questionOfTheDay.description}</div>
                            
                            {questionOfTheDay.examples.length > 0 && (
                              <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Examples</h3>
                                <div className="space-y-4">
                                  {questionOfTheDay.examples.map((example, idx) => (
                                    <div key={idx} className="bg-[var(--primary)] p-4 rounded-lg">
                                      <div>
                                        <span className="font-medium">Input:</span> {example.input}
                                      </div>
                                      <div className="mt-1">
                                        <span className="font-medium">Output:</span> {example.output}
                                      </div>
                                      {example.explanation && (
                                        <div className="mt-1">
                                          <span className="font-medium">Explanation:</span> {example.explanation}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {questionOfTheDay.constraints.length > 0 && (
                              <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Constraints</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                  {questionOfTheDay.constraints.map((constraint, idx) => (
                                    <li key={idx}>{constraint}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-8">
                            <Link
                              to={`/code/${questionOfTheDay.id}`}
                              className="btn-primary flex items-center justify-center w-full py-3 group"
                            >
                              Take on the Challenge
                              <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                  {/* Timer Card */}
                  <motion.div 
                    className="card-interactive"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center mb-4">
                      <Clock className="text-[var(--accent)] mr-2" size={20} />
                      <h3 className="text-lg font-semibold">Time Remaining</h3>
                    </div>
                    
                    <div className="bg-[var(--primary)] rounded-lg p-4 text-center">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <div className="text-3xl font-bold text-[var(--accent)]">
                            {timeRemaining.hours.toString().padStart(2, '0')}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">Hours</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-[var(--accent)]">
                            {timeRemaining.minutes.toString().padStart(2, '0')}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">Minutes</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-[var(--accent)]">
                            {timeRemaining.seconds.toString().padStart(2, '0')}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">Seconds</div>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Until the next question of the day
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Top Solvers */}
                  <motion.div 
                    className="card-interactive"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex items-center mb-4">
                      <Award className="text-[var(--accent)] mr-2" size={20} />
                      <h3 className="text-lg font-semibold">Today's Solvers</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {loadingSolvers ? (
                        <div className="text-center py-4 text-[var(--text-secondary)] text-sm">Loading...</div>
                      ) : solvers.length === 0 ? (
                        <div className="text-center py-4 text-[var(--text-secondary)] text-sm">
                          No one has solved today's challenge yet. Be the first!
                        </div>
                      ) : (
                        solvers.map((solver, index) => (
                          <div 
                            key={solver.id || index}
                            className="flex items-center p-3 bg-[var(--primary)] rounded-lg"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' : 
                              index === 1 ? 'bg-gray-400 bg-opacity-20 text-gray-400' : 
                              index === 2 ? 'bg-amber-700 bg-opacity-20 text-amber-700' : 'bg-gray-700 text-gray-400'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-grow">
                              <div className="font-medium">{solver.coderName || solver.name || 'Anonymous'}</div>
                              <div className="text-xs text-[var(--text-secondary)]">
                                {solver.stats?.problemsSolved ?? 0} problems solved
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Streak Card - Simplified */}
                  <motion.div 
                    className="card-interactive text-center"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-lg font-semibold mb-3">Your QotD Streak</h3>
                    <div className="text-5xl font-bold text-[var(--accent)] mb-2">0</div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Solve today's question to start your streak!
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">
                          Next Reward:
                        </span>
                        <span className="flex items-center text-yellow-400">
                          <Zap size={16} className="mr-1" />
                          +50 XP
                        </span>
                      </div>
                      
                      <div className="w-full bg-[var(--primary)] h-2 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-yellow-400 w-[10%]" />
                      </div>
                      
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        3 days streak: unlock special badge
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      {/* Simplified confetti animation */}
      <Confetti isVisible={showConfetti} />
      
      {/* Daily reward modal */}
      <AnimatePresence>
        {isBoxOpened && rewardCollected && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-gradient-to-br from-[var(--secondary)] to-[#1a1a3e] rounded-xl p-6 max-w-sm w-full text-center relative overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            >
              <button 
                onClick={() => setRewardCollected(false)}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white z-10"
              >
                <X size={20} />
              </button>
              
              <div className="mb-4 relative z-10">
                <CheckCircle size={64} className="mx-auto text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold font-display mb-2 relative z-10">Reward Collected!</h2>
              
              <p className="text-[var(--text-secondary)] mb-6 relative z-10">
                You've opened today's challenge.
                <br />
                Solve the problem to earn even more rewards!
              </p>
              
              <div className="relative z-10">
                <Link
                  to={`/code/${questionOfTheDay.id}`}
                  className="btn-primary w-full flex items-center justify-center group"
                >
                  <ArrowRight size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  Start Coding Now
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default QuestionOfTheDayPage;