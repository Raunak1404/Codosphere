import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Camera, Check, X, Trophy, Target, Shield, Zap, Award, ArrowRight, Flame, TrendingUp, Sparkles, Crown, Swords } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import AnimatedAvatar from '../components/common/AnimatedAvatar';
import UserRankCard from '../components/match/UserRankCard';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../services/firebase';
import '../styles/study.css';

// Define achievements with criteria
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

// Calculate level from problems solved
const getLevel = (solved: number) => Math.floor(solved / 5) + 1;
const getXpProgress = (solved: number) => ((solved % 5) / 5) * 100;
const getXpNeeded = (solved: number) => 5 - (solved % 5);

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    coderName: '',
    profileImage: '',
    selectedAvatar: 'boy1' as 'boy1' | 'boy2' | 'girl1' | 'girl2',
    stats: {
      problemsSolved: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalRankPoints: 0,
      rank: 'Unranked',
      rankWins: 0,
      rankMatches: 0
    }
  });

  const [editForm, setEditForm] = useState({
    name: '',
    coderName: '',
    selectedAvatar: 'boy1' as 'boy1' | 'boy2' | 'girl1' | 'girl2'
  });

  const [userAchievements, setUserAchievements] = useState<number[]>([]);
  const [showAchievementBanner, setShowAchievementBanner] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  // Load user profile
  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await getUserProfile(currentUser.uid);
      if (error) {
        console.error('Error loading profile:', error);
      } else if (data) {
        setProfileData({
          name: data.name || '',
          coderName: data.coderName || '',
          profileImage: data.profileImage || '',
          selectedAvatar: data.selectedAvatar || 'boy1',
          stats: {
            problemsSolved: data.stats?.problemsSolved || 0,
            currentStreak: data.stats?.currentStreak || 0,
            bestStreak: data.stats?.bestStreak || 0,
            totalRankPoints: data.stats?.totalRankPoints || 0,
            rank: data.stats?.rank || 'Unranked',
            rankWins: data.stats?.rankWins || 0,
            rankMatches: data.stats?.rankMatches || 0
          }
        });
        
        setEditForm({
          name: data.name || '',
          coderName: data.coderName || '',
          selectedAvatar: data.selectedAvatar || 'boy1'
        });
        
        setUserAchievements(data.achievements || []);
        
        // Check for new achievements
        const newlyEarnedAchievements = checkForNewAchievements(data);
        if (newlyEarnedAchievements.length > 0) {
          await saveNewAchievements(data, newlyEarnedAchievements);
          setNewAchievement(achievementsList.find(a => a.id === newlyEarnedAchievements[0]));
          setShowAchievementBanner(true);
          setTimeout(() => setShowAchievementBanner(false), 5000);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error("Failed to save achievements:", error);
    }
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      await updateUserProfile(currentUser.uid, {
        name: editForm.name,
        coderName: editForm.coderName,
        selectedAvatar: editForm.selectedAvatar
      });

      setProfileData(prev => ({
        ...prev,
        name: editForm.name,
        coderName: editForm.coderName,
        selectedAvatar: editForm.selectedAvatar
      }));

      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: profileData.name,
      coderName: profileData.coderName,
      selectedAvatar: profileData.selectedAvatar
    });
    setEditing(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    setUploadingImage(true);
    try {
      const { url, error } = await uploadProfileImage(currentUser.uid, file);
      if (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image: ' + error);
      } else if (url) {
        setProfileData(prev => ({ ...prev, profileImage: url }));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const level = getLevel(profileData.stats.problemsSolved);
  const xpProgress = getXpProgress(profileData.stats.problemsSolved);
  const xpNeeded = getXpNeeded(profileData.stats.problemsSolved);
  const earnedCount = userAchievements.length;
  const totalCount = achievementsList.length;

  // Only the earned achievements (up to 3 most recent)
  const earnedAchievementsList = useMemo(() => {
    return achievementsList
      .filter(a => userAchievements.includes(a.id))
      .slice(-3); // Show last 3 earned
  }, [userAchievements]);

  // Win rate calculation
  const winRate = profileData.stats.rankMatches > 0
    ? Math.round((profileData.stats.rankWins / profileData.stats.rankMatches) * 100)
    : 0;

  if (!currentUser) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow py-16">
            <div className="container-custom">
              <div className="topic-card p-10 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mx-auto mb-5">
                  <Shield size={28} className="text-[var(--accent)]" />
                </div>
                <h2 className="text-xl font-bold font-display mb-2">Please Log In</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">You need to be logged in to view your profile</p>
                <a href="/login" className="btn-primary inline-flex items-center gap-2">
                  Log In
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow flex items-center justify-center">
            <div className="relative w-12 h-12">
              <div className="w-12 h-12 rounded-full border-2 border-white/[0.06]" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin" />
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
          {/* Lightweight background — fewer blurs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-[var(--accent)] filter blur-[200px] opacity-[0.04]" />
            <div className="absolute bottom-[15%] right-[5%] w-[400px] h-[400px] rounded-full bg-[var(--accent-secondary)] filter blur-[180px] opacity-[0.03]" />
          </div>

          <div className="container-custom relative z-10 py-10">
            {/* ═══ HERO PROFILE BANNER ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative mb-8"
            >
              {/* Banner Card */}
              <div className="topic-card overflow-hidden">
                {/* Gradient Banner Background */}
                <div className="relative h-32 bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-secondary)]/10 to-[var(--accent)]/20 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
                  {/* Level badge */}
                  <div className="absolute top-4 right-6 flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5">
                      <Crown size={12} className="text-amber-400" />
                      Level {level}
                    </div>
                  </div>
                </div>

                {/* Profile Info Section */}
                <div className="relative px-6 pb-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-14">
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] opacity-40 blur-sm" />
                      <div className="relative">
                        {profileData.profileImage ? (
                          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[var(--primary)] shadow-xl shadow-[var(--accent)]/20 relative z-10">
                            <img
                              src={profileData.profileImage}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="rounded-full overflow-hidden border-4 border-[var(--primary)] shadow-xl shadow-[var(--accent)]/20 relative z-10">
                            <AnimatedAvatar 
                              type={profileData.selectedAvatar}
                              size={112}
                              interval={8000}
                            />
                          </div>
                        )}
                        <label
                          htmlFor="profile-image-upload"
                          className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg z-20"
                        >
                          {uploadingImage ? (
                            <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-white animate-spin" />
                          ) : (
                            <Camera size={14} className="text-white" />
                          )}
                        </label>
                        <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-black text-black shadow-lg z-20">
                          {level}
                        </div>
                      </div>
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </div>

                    {/* Name & Info */}
                    <div className="flex-1 text-center sm:text-left pb-1">
                      {editing ? (
                        <div className="space-y-3 max-w-sm">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/[0.04] rounded-xl border border-white/[0.08] focus:outline-none focus:border-[var(--accent)]/40 text-sm transition-colors"
                            placeholder="Display name"
                          />
                          <input
                            type="text"
                            value={editForm.coderName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, coderName: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/[0.04] rounded-xl border border-white/[0.08] focus:outline-none focus:border-[var(--accent)]/40 text-sm transition-colors"
                            placeholder="Coder name"
                          />
                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Avatar Style</label>
                            <div className="flex gap-2">
                              {(['boy1', 'boy2', 'girl1', 'girl2'] as const).map((avatarType) => (
                                <div
                                  key={avatarType}
                                  className={`cursor-pointer p-1.5 rounded-full border-2 transition-all ${
                                    editForm.selectedAvatar === avatarType 
                                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-110' 
                                      : 'border-white/[0.06] hover:border-white/[0.12]'
                                  }`}
                                  onClick={() => setEditForm(prev => ({ ...prev, selectedAvatar: avatarType }))}
                                >
                                  <AnimatedAvatar 
                                    type={avatarType}
                                    size={40}
                                    interval={5000 + Math.random() * 3000}
                                    selected={editForm.selectedAvatar === avatarType}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button onClick={handleSaveProfile} className="btn-primary flex items-center justify-center py-2 px-4 text-sm">
                              <Check size={14} className="mr-1.5" />
                              Save
                            </button>
                            <button onClick={handleCancelEdit} className="btn-secondary flex items-center justify-center py-2 px-4 text-sm">
                              <X size={14} className="mr-1.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <h1 className="text-2xl font-bold font-display">{profileData.name || 'Anonymous Coder'}</h1>
                            <button onClick={handleEditProfile} className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-[var(--accent)]/30 transition-all">
                              <Edit2 size={13} className="text-[var(--text-secondary)]" />
                            </button>
                          </div>
                          {profileData.coderName && (
                            <p className="text-sm text-[var(--accent)] font-semibold mt-0.5">@{profileData.coderName}</p>
                          )}
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{currentUser.email}</p>
                          
                          {/* XP Progress Bar */}
                          <div className="mt-3 max-w-xs">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-[var(--text-secondary)] font-medium">Level {level}</span>
                              <span className="text-[var(--accent-tertiary)] font-semibold">{xpNeeded} problems to next level</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-tertiary)] to-amber-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Quick rank badge - right side */}
                    {!editing && (
                      <div className="hidden sm:flex flex-col items-center gap-1 pb-1">
                        <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent)]/20">
                          <div className="text-center">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Rank</p>
                            <p className="text-lg font-bold font-display text-[var(--accent)]">{profileData.stats.rank || 'Unranked'}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{profileData.stats.totalRankPoints} RP</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ═══ STATS GRID ═══ */}
            <div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                { 
                  title: "Problems Solved", 
                  value: profileData.stats.problemsSolved, 
                  icon: <Target size={20} />,
                  gradient: 'from-[var(--accent)] to-rose-600',
                  glow: 'shadow-[var(--accent)]/20'
                },
                { 
                  title: "Current Streak", 
                  value: `${profileData.stats.currentStreak}d`, 
                  icon: <Flame size={20} />,
                  gradient: 'from-amber-400 to-orange-500',
                  glow: 'shadow-amber-400/20'
                },
                { 
                  title: "Best Streak", 
                  value: `${profileData.stats.bestStreak}d`, 
                  icon: <TrendingUp size={20} />,
                  gradient: 'from-[var(--accent-secondary)] to-blue-600',
                  glow: 'shadow-[var(--accent-secondary)]/20'
                },
                { 
                  title: "Achievements", 
                  value: `${earnedCount}/${totalCount}`, 
                  icon: <Trophy size={20} />,
                  gradient: 'from-purple-400 to-violet-600',
                  glow: 'shadow-purple-400/20'
                }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className={`topic-card p-5 relative overflow-hidden group shadow-lg ${stat.glow} hover:-translate-y-1 transition-transform duration-200`}
                >
                  <div className={`absolute -top-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity`} />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg ${stat.glow}`}>
                    <span className="text-white">{stat.icon}</span>
                  </div>
                  <div className="text-2xl font-bold font-display mb-0.5">{stat.value}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium">{stat.title}</div>
                </div>
              ))}
            </div>
              
            {/* ═══ MAIN CONTENT — 3-column layout ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ═══ LEFT COLUMN — Rank Card ═══ */}
              <div className="lg:col-span-4 space-y-5">
                <UserRankCard stats={profileData.stats} />
              </div>

              {/* ═══ CENTER COLUMN — Win Rate + Battle Stats ═══ */}
              <div className="lg:col-span-4 space-y-5">
                {/* Win Rate Card — Enhanced Design */}
                <div className="topic-card overflow-hidden relative">
                  {/* Animated ring background */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border-4 border-[var(--accent)]/5" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border-4 border-[var(--accent-secondary)]/5" />
                  
                  <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-400/20 flex items-center justify-center">
                        <Swords className="text-emerald-400" size={16} />
                      </div>
                      <h3 className="text-sm font-bold font-display">Battle Stats</h3>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Win Rate Circle */}
                    <div className="flex justify-center mb-5">
                      <div className="relative w-32 h-32">
                        {/* Background ring */}
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                          <circle
                            cx="64" cy="64" r="56"
                            fill="none"
                            stroke="url(#winRateGradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${winRate * 3.52} ${352 - winRate * 3.52}`}
                            className="transition-all duration-1000 ease-out"
                          />
                          <defs>
                            <linearGradient id="winRateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="var(--accent)" />
                              <stop offset="50%" stopColor="var(--accent-secondary)" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black font-display bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                            {winRate}%
                          </span>
                          <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold mt-0.5">
                            Win Rate
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative p-3 rounded-xl bg-gradient-to-br from-emerald-500/[0.06] to-transparent border border-emerald-400/10 text-center group hover:border-emerald-400/25 transition-colors">
                        <div className="text-xs text-emerald-400 font-semibold mb-0.5 flex items-center justify-center gap-1">
                          <Trophy size={11} />
                          WINS
                        </div>
                        <div className="text-xl font-bold font-display">{profileData.stats.rankWins || 0}</div>
                      </div>
                      <div className="relative p-3 rounded-xl bg-gradient-to-br from-[var(--accent)]/[0.06] to-transparent border border-[var(--accent)]/10 text-center group hover:border-[var(--accent)]/25 transition-colors">
                        <div className="text-xs text-[var(--accent)] font-semibold mb-0.5 flex items-center justify-center gap-1">
                          <Swords size={11} />
                          PLAYED
                        </div>
                        <div className="text-xl font-bold font-display">{profileData.stats.rankMatches || 0}</div>
                      </div>
                    </div>

                    {/* Rank Points bar */}
                    <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1">
                          <Zap size={10} className="text-[var(--accent-tertiary)]" />
                          Rank Points
                        </span>
                        <span className="text-[var(--accent-tertiary)] font-bold">{profileData.stats.totalRankPoints} RP</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-tertiary)] via-[var(--accent)] to-[var(--accent-secondary)]"
                          style={{ width: `${Math.min(100, profileData.stats.totalRankPoints)}%`, transition: 'width 1s ease-out' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ RIGHT COLUMN — Achievements Earned ═══ */}
              <div className="lg:col-span-4 space-y-5">
                {/* Earned Achievements Card — Enhanced */}
                <div className="topic-card overflow-hidden relative">
                  {/* Subtle decorative */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/5 to-purple-500/5" />
                  
                  <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-purple-500/20 border border-amber-400/20 flex items-center justify-center">
                          <Award className="text-amber-400" size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold font-display">Achievements</h3>
                          <p className="text-[10px] text-[var(--text-secondary)]">{earnedCount} of {totalCount} earned</p>
                        </div>
                      </div>
                      {/* Progress chip */}
                      <div className="px-2 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/15">
                        <span className="text-[10px] font-bold text-[var(--accent)]">
                          {Math.round((earnedCount / totalCount) * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Overall progress bar */}
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-[var(--accent)] to-purple-500"
                          style={{ width: `${(earnedCount / totalCount) * 100}%`, transition: 'width 1s ease-out' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    {earnedAchievementsList.length > 0 ? (
                      earnedAchievementsList.map((achievement) => (
                        <div 
                          key={achievement.id}
                          className="group flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] hover:border-[var(--accent)]/25 transition-all hover:-translate-y-0.5 duration-200"
                        >
                          {/* Icon with glow */}
                          <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 rounded-xl bg-[var(--accent)]/10 blur-sm group-hover:bg-[var(--accent)]/20 transition-colors" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)]/15 to-[var(--accent-secondary)]/10 flex items-center justify-center text-2xl shadow-inner border border-white/[0.06]">
                              {achievement.icon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{achievement.name}</p>
                            <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{achievement.description}</p>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-emerald-400/15 flex items-center justify-center shrink-0">
                            <Check size={13} className="text-emerald-400" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                          <Trophy className="text-[var(--text-secondary)] opacity-40" size={24} />
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-secondary)] mb-1">No achievements yet</p>
                        <p className="text-[11px] text-[var(--text-secondary)]/60">Start solving problems to earn badges!</p>
                      </div>
                    )}
                    
                    {/* View all link */}
                    <div className="pt-2 border-t border-white/[0.04]">
                      <a 
                        href="/stats" 
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors group"
                      >
                        <span>View All Achievements</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      {/* Achievement Banner */}
      <AnimatePresence>
        {showAchievementBanner && newAchievement && (
          <motion.div 
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/30 shadow-2xl shadow-[var(--accent)]/30 min-w-[340px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 via-[var(--accent-secondary)]/5 to-[var(--accent)]/10" />
              <div className="relative bg-[var(--primary)]/95 backdrop-blur-xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-secondary)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-3xl shrink-0">
                  {newAchievement.icon}
                </div>
                
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-0.5 flex items-center gap-1">
                    <Sparkles size={10} /> Achievement Unlocked!
                  </p>
                  <p className="text-sm font-bold font-display truncate">{newAchievement.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{newAchievement.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default ProfilePage;