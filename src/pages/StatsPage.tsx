import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, Clock, Award, Star, Calendar, CheckSquare, TrendingUp,
  Target, Sparkles, Zap, ArrowRight, Lock, Crown
} from 'lucide-react';
import Trophy from '../components/icons/Trophy';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import RevealOnScroll from '../components/common/RevealOnScroll';
import AnimatedProgressBar from '../components/common/AnimatedProgressBar';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/firebase';
import { codingProblems } from '../data/codingProblems';
import '../styles/study.css';

// Define achievements with criteria - same as in ProfilePage
const achievementsList = [
  { id: 1, name: "First Steps", description: "Solve your first coding problem", icon: "🎯", criteria: { problemsSolved: 1 } },
  { id: 2, name: "Getting Started", description: "Solve 5 coding problems", icon: "🔰", criteria: { problemsSolved: 5 } },
  { id: 3, name: "Problem Solver", description: "Solve 25 coding problems", icon: "💡", criteria: { problemsSolved: 25 } },
  { id: 4, name: "Code Warrior", description: "Solve 100 coding problems", icon: "⚔️", criteria: { problemsSolved: 100 } },
  { id: 5, name: "Coding Master", description: "Solve 250 coding problems", icon: "🏆", criteria: { problemsSolved: 250 } },
  { id: 6, name: "Streak Starter", description: "Maintain a 3-day coding streak", icon: "🔥", criteria: { currentStreak: 3 } },
  { id: 7, name: "Streak Warrior", description: "Maintain a 7-day coding streak", icon: "📆", criteria: { currentStreak: 7 } },
  { id: 8, name: "Streak Master", description: "Maintain a 30-day coding streak", icon: "📅", criteria: { currentStreak: 30 } },
  { id: 9, name: "Bronze Competitor", description: "Reach Bronze rank in Ranked Matches", icon: "🥉", criteria: { rank: "Bronze" } },
  { id: 10, name: "Silver Competitor", description: "Reach Silver rank in Ranked Matches", icon: "🥈", criteria: { rank: "Silver" } },
  { id: 11, name: "Gold Competitor", description: "Reach Gold rank in Ranked Matches", icon: "🥇", criteria: { rank: "Gold" } },
  { id: 12, name: "Platinum Competitor", description: "Reach Platinum rank in Ranked Matches", icon: "🔷", criteria: { rank: "Platinum" } },
  { id: 13, name: "Diamond Competitor", description: "Reach Diamond rank in Ranked Matches", icon: "💎", criteria: { rank: "Diamond" } },
  { id: 14, name: "First Victory", description: "Win your first ranked match", icon: "🏅", criteria: { rankWins: 1 } },
  { id: 15, name: "Victorious", description: "Win 10 ranked matches", icon: "🏅", criteria: { rankWins: 10 } },
  { id: 16, name: "Champion", description: "Win 50 ranked matches", icon: "🏅", criteria: { rankWins: 50 } }
];

const StatsPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    problemsSolved: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageSolveTime: 0,
    solvedProblems: [] as number[],
    totalRankPoints: 0,
    rank: '',
    rankWins: 0,
    rankMatches: 0
  });

  const [userAchievements, setUserAchievements] = useState<number[]>([]);
  const [selectedAchievements, setSelectedAchievements] = useState<number[]>([1, 2]);
  const [showAchievementBanner, setShowAchievementBanner] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  // Fetch user stats once on component mount
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await getUserProfile(currentUser.uid);
        if (error) {
          throw new Error(error);
        }
        
        if (data) {
          setStats({
            problemsSolved: data.stats?.problemsSolved || 0,
            currentStreak: data.stats?.currentStreak || 0,
            bestStreak: data.stats?.bestStreak || 0,
            averageSolveTime: data.stats?.averageSolveTime || 0,
            solvedProblems: data.solvedProblems || [],
            totalRankPoints: data.stats?.totalRankPoints || 0,
            rank: data.stats?.rank || '',
            rankWins: data.stats?.rankWins || 0,
            rankMatches: data.stats?.rankMatches || 0
          });
          setUserAchievements(data.achievements || []);
          setSelectedAchievements(data.showcasedAchievements || [1, 2]);
          
          // Check for new achievements
          const newlyEarnedAchievements = checkForNewAchievements(data);
          if (newlyEarnedAchievements.length > 0) {
            // Save the newly earned achievements
            await saveNewAchievements(data, newlyEarnedAchievements);
            
            // Show banner for the first new achievement
            setNewAchievement(achievementsList.find(a => a.id === newlyEarnedAchievements[0]));
            setShowAchievementBanner(true);
            
            // Close the banner after 5 seconds
            setTimeout(() => {
              setShowAchievementBanner(false);
            }, 5000);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [currentUser]);

  // Check which achievements have been earned
  const checkForNewAchievements = (userData: any) => {
    if (!userData || !userData.stats) return [];
    
    const stats = userData.stats;
    const currentAchievements = userData.achievements || [];
    const newlyEarnedAchievements: number[] = [];
    
    achievementsList.forEach(achievement => {
      if (currentAchievements.includes(achievement.id)) return;
      
      let earned = true;
      
      for (const [key, value] of Object.entries(achievement.criteria)) {
        if (key === 'rank') {
          if (stats.rank !== value) {
            earned = false;
            break;
          }
        } else if (stats[key] < value) {
          earned = false;
          break;
        }
      }
      
      if (earned) {
        newlyEarnedAchievements.push(achievement.id);
      }
    });
    
    return newlyEarnedAchievements;
  };
  
  const saveNewAchievements = async (userData: any, newAchievements: number[]) => {
    if (!currentUser) return;
    
    try {
      const currentAchievements = userData.achievements || [];
      const updatedAchievements = [...currentAchievements, ...newAchievements];
      
      await updateUserProfile(currentUser.uid, {
        achievements: updatedAchievements
      });
      
      setUserAchievements(updatedAchievements);
      
      console.log("New achievements saved:", newAchievements);
    } catch (error) {
      console.error("Failed to save achievements:", error);
    }
  };

  const toggleAchievement = (id: number) => {
    if (!userAchievements.includes(id)) return;
    
    if (selectedAchievements.includes(id)) {
      if (selectedAchievements.length > 1) {
        setSelectedAchievements(selectedAchievements.filter(a => a !== id));
      }
    } else if (selectedAchievements.length < 3) {
      setSelectedAchievements([...selectedAchievements, id]);
    }
    
    if (currentUser) {
      updateUserProfile(currentUser.uid, {
        showcasedAchievements: selectedAchievements.includes(id) 
          ? selectedAchievements.filter(a => a !== id)
          : [...selectedAchievements, id].slice(0, 3)
      }).catch(error => {
        console.error("Failed to save showcased achievements:", error);
      });
    }
  };

  const getDifficultyStats = () => {
    const solvedProblemDetails = codingProblems.filter(p => stats.solvedProblems.includes(p.id));
    return {
      Easy: {
        solved: solvedProblemDetails.filter(p => p.difficulty === 'Easy').length,
        total: codingProblems.filter(p => p.difficulty === 'Easy').length
      },
      Medium: {
        solved: solvedProblemDetails.filter(p => p.difficulty === 'Medium').length,
        total: codingProblems.filter(p => p.difficulty === 'Medium').length
      },
      Hard: {
        solved: solvedProblemDetails.filter(p => p.difficulty === 'Hard').length,
        total: codingProblems.filter(p => p.difficulty === 'Hard').length
      }
    };
  };

  const getCategoryStats = () => {
    const categories = new Map();
    codingProblems.forEach(problem => {
      problem.tags.forEach(tag => {
        if (!categories.has(tag)) {
          categories.set(tag, { total: 0, solved: 0 });
        }
        categories.get(tag).total++;
        if (stats.solvedProblems.includes(problem.id)) {
          categories.get(tag).solved++;
        }
      });
    });

    return Array.from(categories.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 4);
  };

  if (!currentUser) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow py-16 relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full bg-[var(--accent)] filter blur-[160px] opacity-[0.04]" />
            </div>
            <div className="container-custom relative z-10 flex items-center justify-center min-h-[60vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="topic-card p-10 text-center max-w-md"
              >
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mx-auto mb-5">
                  <Lock className="text-[var(--accent)]" size={28} />
                </div>
                <h2 className="text-2xl font-bold font-display mb-3">Please Log In</h2>
                <p className="text-[var(--text-secondary)] mb-6">You need to be logged in to view your stats</p>
                <a href="/login" className="btn-primary inline-flex items-center gap-2">
                  Log In <ArrowRight size={16} />
                </a>
              </motion.div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const difficultyStats = getDifficultyStats();
  const categoryStats = getCategoryStats();
  const totalSolved = stats.solvedProblems.length;
  const totalProblems = codingProblems.length;
  const progressPercent = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow relative">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)] filter blur-[180px] opacity-[0.04]" />
            <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent-secondary)] filter blur-[160px] opacity-[0.03]" />
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
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                  <BarChart2 className="text-[var(--accent)]" size={22} />
                </div>
                <h1 className="text-3xl font-bold font-display tracking-tight">
                  Your{' '}
                  <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                    Statistics
                  </span>
                </h1>
              </div>
              {/* Overall progress bar */}
              <div className="mt-4 max-w-md">
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="text-[var(--text-secondary)]">Overall Progress</span>
                  <span className="font-medium text-[var(--accent)]">{progressPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] xp-bar-glow"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
              
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-white/[0.06]" />
                  <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin" />
                </div>
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { 
                      title: "Problems Solved", 
                      value: stats.problemsSolved.toString(), 
                      icon: <CheckSquare size={18} />,
                      sub: `${stats.problemsSolved > 0 ? '+' : ''}${stats.problemsSolved} total`,
                      color: 'var(--accent)',
                    },
                    { 
                      title: "Coding Streak", 
                      value: `${stats.currentStreak} days`, 
                      icon: <TrendingUp size={18} />,
                      sub: `Best: ${stats.bestStreak} days`,
                      color: 'var(--accent-tertiary)',
                    },
                    { 
                      title: "Avg. Solve Time", 
                      value: stats.averageSolveTime > 0 ? `${Math.round(stats.averageSolveTime / 60)} min` : '-- min', 
                      icon: <Clock size={18} />,
                      sub: stats.averageSolveTime > 0 ? `${stats.averageSolveTime} seconds` : 'No data yet',
                      color: 'var(--accent-secondary)',
                    },
                    { 
                      title: "Current Rank", 
                      value: stats.rank || (stats.totalRankPoints > 0 ? "Bronze" : "Unranked"), 
                      icon: <Target size={18} />,
                      sub: `${stats.totalRankPoints} Rank Points`,
                      color: 'var(--accent)',
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="topic-card p-5 group hover:border-white/[0.12] transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{stat.title}</span>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background: `${stat.color}15`,
                            color: stat.color,
                          }}
                        >
                          {stat.icon}
                        </div>
                      </div>
                      <p className="text-2xl font-bold font-display mb-0.5">{stat.value}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>
                
                {/* Main Grid: Rankings + Problem Solving */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Rankings Sidebar */}
                  <RevealOnScroll delay={0.05}>
                    <div className="topic-card p-6 h-full">
                      <div className="flex items-center gap-2 mb-5">
                        <Trophy className="text-[var(--accent)]" size={18} />
                        <h2 className="text-lg font-bold font-display">Rankings</h2>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { category: "Country", rank: "Unranked", total: "??", icon: "🌍" },
                          { category: "Local Area", rank: "Unranked", total: "??", icon: "📍" },
                          { category: "Friends", rank: "Unranked", total: "??", icon: "👥" }
                        ].map((ranking, index) => (
                          <div key={index} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg">{ranking.icon}</span>
                                <span className="text-sm text-[var(--text-secondary)]">{ranking.category}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">{ranking.rank}</p>
                                <p className="text-[10px] text-[var(--text-secondary)]">of {ranking.total}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-5 pt-4 border-t border-white/[0.04]">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          Solve coding problems to improve your rank in the global leaderboards.
                        </p>
                      </div>
                    </div>
                  </RevealOnScroll>
                  
                  {/* Problem Solving Panel */}
                  <RevealOnScroll delay={0.1} className="lg:col-span-2">
                    <div className="topic-card p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Star className="text-[var(--accent)]" size={18} />
                        <h2 className="text-lg font-bold font-display">Problem Solving</h2>
                      </div>
                      
                      {/* Difficulty Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                        {Object.entries(difficultyStats).map(([difficulty, dStats], index) => {
                          const color = difficulty === 'Easy' ? '#34d399' : difficulty === 'Medium' ? '#fbbf24' : '#f87171';
                          const pct = dStats.total > 0 ? Math.round((dStats.solved / dStats.total) * 100) : 0;
                          return (
                            <div key={index} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{difficulty}</span>
                                <span className="text-[10px] text-[var(--text-secondary)]">{pct}%</span>
                              </div>
                              <div className="flex items-baseline gap-1.5 mb-2.5">
                                <span className="text-2xl font-bold font-display">{dStats.solved}</span>
                                <span className="text-xs text-[var(--text-secondary)]">/ {dStats.total}</span>
                              </div>
                              <AnimatedProgressBar 
                                value={dStats.total > 0 ? (dStats.solved / dStats.total) * 100 : 0}
                                variant={difficulty === 'Easy' ? 'green' : difficulty === 'Medium' ? 'gold' : 'accent'}
                                height={6}
                                showGlow={true}
                              />
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Categories */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-4">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Zap size={14} className="text-[var(--accent-secondary)]" />
                          Problem Categories
                        </h3>
                        <div className="space-y-3">
                          {categoryStats.map(([category, cStats], index) => (
                            <div key={index}>
                              <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-[var(--text-secondary)]">{category}</span>
                                <span className="text-xs font-medium">{cStats.solved}/{cStats.total}</span>
                              </div>
                              <AnimatedProgressBar 
                                value={cStats.total > 0 ? (cStats.solved / cStats.total) * 100 : 0}
                                variant="cyan"
                                height={5}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Recent Activity */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Calendar size={14} className="text-[var(--accent-tertiary)]" />
                          Recent Activity
                        </h3>
                        {stats.solvedProblems.length > 0 ? (
                          <div className="space-y-2">
                            {codingProblems
                              .filter(p => stats.solvedProblems.includes(p.id))
                              .slice(0, 5)
                              .map((problem, index) => (
                                <div key={index} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                                  <span className="text-sm">{problem.title}</span>
                                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    problem.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10' :
                                    problem.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' :
                                    'text-rose-400 bg-rose-400/10'
                                  }`}>
                                    {problem.difficulty}
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="flex justify-center items-center py-8">
                            <div className="text-center">
                              <Calendar className="mx-auto text-[var(--text-secondary)] mb-2 opacity-40" size={28} />
                              <p className="text-sm text-[var(--text-secondary)]">No recent activity</p>
                              <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">
                                Start solving problems to see your activity
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </RevealOnScroll>
                </div>
                
                {/* Achievements Section */}
                <RevealOnScroll direction="up">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[var(--accent-tertiary)]/10 border border-[var(--accent-tertiary)]/20">
                      <Award className="text-[var(--accent-tertiary)]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-display tracking-tight">Achievements & Badges</h2>
                      <p className="text-xs text-[var(--text-secondary)]">{userAchievements.length} of {achievementsList.length} earned</p>
                    </div>
                  </div>
                  
                  {/* Showcased */}
                  <div className="topic-card p-6 mb-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Crown size={16} className="text-[var(--accent-tertiary)]" />
                        <h3 className="text-sm font-semibold font-display">Showcased</h3>
                      </div>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                        Select up to 3
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {achievementsList
                        .filter(achievement => selectedAchievements.includes(achievement.id))
                        .map((achievement) => {
                          const isEarned = userAchievements.includes(achievement.id);
                          return (
                            <motion.div 
                              key={achievement.id}
                              className={`flex items-center p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                                isEarned 
                                  ? 'bg-[var(--accent)]/[0.08] border-[var(--accent)]/30 shadow-[0_0_20px_rgba(244,91,105,0.1)]' 
                                  : 'bg-white/[0.02] border-white/[0.04] opacity-50'
                              }`}
                              whileHover={{ scale: isEarned ? 1.02 : 1 }}
                              onClick={() => toggleAchievement(achievement.id)}
                            >
                              <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center mr-3 text-xl shrink-0">
                                {achievement.icon}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm">{achievement.name}</p>
                                <p className="text-xs text-[var(--text-secondary)] truncate">{achievement.description}</p>
                                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--accent)]">
                                  <Sparkles size={10} /> Showcased
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                  
                  {/* All Achievements Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {achievementsList.map((achievement) => {
                      let progress = 0;
                      let total = 0;
                      
                      for (const [key, value] of Object.entries(achievement.criteria)) {
                        if (key === 'rank') {
                          const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
                          const currentRankIndex = rankOrder.indexOf(stats.rank || '');
                          const targetRankIndex = rankOrder.indexOf(value as string);
                          
                          if (currentRankIndex >= targetRankIndex && targetRankIndex >= 0) {
                            progress = 1;
                            total = 1;
                          } else {
                            progress = 0;
                            total = 1;
                          }
                        } else {
                          const stat = stats[key as keyof typeof stats] as number || 0;
                          progress = Math.min(stat, value as number);
                          total = value as number;
                        }
                      }
                      
                      const earned = userAchievements.includes(achievement.id);
                      const isSelected = selectedAchievements.includes(achievement.id);
                      const pct = total > 0 ? (progress / total) * 100 : 0;
                      
                      return (
                        <motion.div 
                          key={achievement.id} 
                          className={`topic-card p-4 cursor-pointer transition-all duration-300 ${
                            !earned ? 'opacity-50 grayscale-[30%]' : ''
                          } ${isSelected ? '!border-[var(--accent)]/30 shadow-[0_0_15px_rgba(244,91,105,0.08)]' : ''}`}
                          onClick={() => earned && toggleAchievement(achievement.id)}
                          whileHover={{ y: earned ? -3 : 0 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                              earned ? 'bg-[var(--accent)]/10' : 'bg-white/[0.03]'
                            }`}>
                              {achievement.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm mb-0.5">{achievement.name}</h3>
                              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-2">{achievement.description}</p>
                              
                              {/* Progress bar */}
                              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden mb-1">
                                <motion.div
                                  className={`h-full rounded-full ${earned ? 'bg-emerald-400' : 'bg-[var(--accent)]'}`}
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${pct}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, delay: 0.1 }}
                                />
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] text-[var(--text-secondary)]">{progress}/{total}</p>
                                {earned && (
                                  <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5">
                                    Earned
                                    {isSelected && (
                                      <Star size={8} className="text-[var(--accent)] fill-[var(--accent)]" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </RevealOnScroll>
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
      
      {/* Achievement Banner */}
      <AnimatePresence>
        {showAchievementBanner && newAchievement && (
          <motion.div 
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.9 }}
            transition={{ type: "spring", damping: 18, stiffness: 280 }}
          >
            <motion.div 
              className="relative rounded-2xl border border-[var(--accent)]/30 bg-[var(--secondary)]/95 backdrop-blur-xl p-5 flex items-center gap-4 overflow-hidden shadow-[0_0_40px_rgba(244,91,105,0.2)]"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(244, 91, 105, 0.2)",
                  "0 0 40px rgba(244, 91, 105, 0.4)",
                  "0 0 20px rgba(244, 91, 105, 0.2)"
                ]
              }}
              transition={{ duration: 2, repeat: 3 }}
            >
              {/* Ambient particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-[var(--accent)]"
                    initial={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      opacity: 0
                    }}
                    animate={{
                      y: [null, `${Math.random() * -50}%`],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                ))}
              </div>
              
              <motion.div
                className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-3xl shrink-0"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: 2 }}
              >
                {newAchievement.icon}
              </motion.div>
              
              <div>
                <motion.p
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-0.5"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Achievement Unlocked!
                </motion.p>
                <p className="text-base font-bold font-display">{newAchievement.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{newAchievement.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default StatsPage;