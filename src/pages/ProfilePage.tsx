import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit2, Camera, Check, X, Trophy, Star, Calendar, Target, Upload, Shield, Zap, Award, ArrowRight } from 'lucide-react';
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
      rank: 'Unranked'
    }
  });

  const [editForm, setEditForm] = useState({
    name: '',
    coderName: '',
    selectedAvatar: 'boy1' as 'boy1' | 'boy2' | 'girl1' | 'girl2'
  });

  const [userAchievements, setUserAchievements] = useState<number[]>([]);
  const [showcasedAchievements, setShowcasedAchievements] = useState<number[]>([1, 2]);
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
          stats: data.stats || {
            problemsSolved: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalRankPoints: 0,
            rank: 'Unranked'
          }
        });
        
        setEditForm({
          name: data.name || '',
          coderName: data.coderName || '',
          selectedAvatar: data.selectedAvatar || 'boy1'
        });
        
        setUserAchievements(data.achievements || []);
        setShowcasedAchievements(data.showcasedAchievements || [1, 2]);
        
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
      
      console.log("New achievements saved:", newAchievements);
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
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-[var(--accent)] filter blur-[180px] opacity-[0.03]" />
            <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-[var(--accent-secondary)] filter blur-[160px] opacity-[0.02]" />
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
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                  <User className="text-[var(--accent)]" size={22} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-display tracking-tight">
                    Your <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">Profile</span>
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">Manage your identity and track your progress</p>
                </div>
              </div>
            </motion.div>
              
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-4 space-y-5">
                <motion.div 
                  className="topic-card p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                >
                  <div className="relative inline-block mb-5">
                    {profileData.profileImage ? (
                      <div className="relative">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-[var(--accent)]/30 shadow-lg shadow-[var(--accent)]/10">
                          <img
                            src={profileData.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label
                          htmlFor="profile-image-upload"
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center cursor-pointer hover:bg-[var(--accent-hover)] transition-colors shadow-lg"
                        >
                          {uploadingImage ? (
                            <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-white animate-spin" />
                          ) : (
                            <Camera size={14} className="text-white" />
                          )}
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="rounded-2xl overflow-hidden border-2 border-white/[0.06]">
                          <AnimatedAvatar 
                            type={profileData.selectedAvatar}
                            size={112}
                            interval={8000}
                          />
                        </div>
                        <label
                          htmlFor="profile-image-upload"
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center cursor-pointer hover:bg-[var(--accent-hover)] transition-colors shadow-lg"
                        >
                          {uploadingImage ? (
                            <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-white animate-spin" />
                          ) : (
                            <Upload size={14} className="text-white" />
                          )}
                        </label>
                      </div>
                    )}
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </div>
                  
                  {editing ? (
                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Display Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white/[0.03] rounded-xl border border-white/[0.06] focus:outline-none focus:border-[var(--accent)]/40 text-sm transition-colors"
                          placeholder="Enter your display name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Coder Name</label>
                        <input
                          type="text"
                          value={editForm.coderName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, coderName: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white/[0.03] rounded-xl border border-white/[0.06] focus:outline-none focus:border-[var(--accent)]/40 text-sm transition-colors"
                          placeholder="Enter your coder name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Avatar Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['boy1', 'boy2', 'girl1', 'girl2'] as const).map((avatarType) => (
                            <div
                              key={avatarType}
                              className={`cursor-pointer p-2 rounded-xl border transition-all ${
                                editForm.selectedAvatar === avatarType 
                                  ? 'border-[var(--accent)]/40 bg-[var(--accent)]/10' 
                                  : 'border-white/[0.06] hover:border-white/[0.12]'
                              }`}
                              onClick={() => setEditForm(prev => ({ ...prev, selectedAvatar: avatarType }))}
                            >
                              <AnimatedAvatar 
                                type={avatarType}
                                size={50}
                                interval={5000 + Math.random() * 3000}
                                selected={editForm.selectedAvatar === avatarType}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button onClick={handleSaveProfile} className="btn-primary flex-1 flex items-center justify-center py-2.5">
                          <Check size={14} className="mr-1.5" />
                          Save
                        </button>
                        <button onClick={handleCancelEdit} className="btn-secondary flex-1 flex items-center justify-center py-2.5">
                          <X size={14} className="mr-1.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold font-display mb-0.5">{profileData.name || 'Anonymous Coder'}</h2>
                      {profileData.coderName && (
                        <p className="text-sm text-[var(--accent)] font-medium mb-1">@{profileData.coderName}</p>
                      )}
                      <p className="text-xs text-[var(--text-secondary)] mb-5">{currentUser.email}</p>
                      
                      <button onClick={handleEditProfile} className="btn-primary flex items-center justify-center w-full py-2.5 text-sm group">
                        <Edit2 size={14} className="mr-2" />
                        Edit Profile
                      </button>
                    </>
                  )}
                </motion.div>
                
                {/* Achievement Showcase */}
                <motion.div 
                  className="topic-card p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="text-amber-400" size={16} />
                    <h3 className="text-sm font-semibold font-display">Showcased Achievements</h3>
                  </div>
                  
                  {showcasedAchievements.length > 0 ? (
                    <div className="space-y-2">
                      {achievementsList
                        .filter(achievement => showcasedAchievements.includes(achievement.id))
                        .slice(0, 3)
                        .map((achievement) => {
                          const isEarned = userAchievements.includes(achievement.id);
                          return (
                            <div 
                              key={achievement.id}
                              className={`flex items-center p-2.5 rounded-xl transition-colors ${
                                isEarned 
                                  ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20' 
                                  : 'bg-white/[0.02] border border-white/[0.04] opacity-50'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center mr-2.5 text-lg shrink-0">
                                {achievement.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs truncate">{achievement.name}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] truncate">{achievement.description}</p>
                              </div>
                              {isEarned && (
                                <Check size={14} className="text-emerald-400 ml-1 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <Trophy className="mx-auto text-[var(--text-secondary)] opacity-30 mb-2" size={24} />
                      <p className="text-xs text-[var(--text-secondary)]">No achievements showcased</p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                        Visit your stats page to select achievements
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-white/[0.04]">
                    <a 
                      href="/stats" 
                      className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center justify-center gap-1 group"
                    >
                      Manage in Stats
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              </div>
              
              {/* Stats & Rank */}
              <div className="lg:col-span-8 space-y-5">
                {/* Rank Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <UserRankCard />
                </motion.div>
                
                {/* Quick Stats Grid */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  {[
                    { 
                      title: "Problems Solved", 
                      value: profileData.stats.problemsSolved, 
                      icon: <Target size={18} />,
                      color: 'text-[var(--accent)]',
                      bg: 'bg-[var(--accent)]/10 border-[var(--accent)]/20'
                    },
                    { 
                      title: "Current Streak", 
                      value: `${profileData.stats.currentStreak} days`, 
                      icon: <Zap size={18} />,
                      color: 'text-amber-400',
                      bg: 'bg-amber-400/10 border-amber-400/20'
                    },
                    { 
                      title: "Best Streak", 
                      value: `${profileData.stats.bestStreak} days`, 
                      icon: <Award size={18} />,
                      color: 'text-[var(--accent-secondary)]',
                      bg: 'bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]/20'
                    }
                  ].map((stat, index) => (
                    <div key={index} className="topic-card p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-xl ${stat.bg} border flex items-center justify-center ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] font-medium">{stat.title}</span>
                      </div>
                      <div className="text-2xl font-bold font-display">{stat.value}</div>
                    </div>
                  ))} 
                </motion.div>
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
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="topic-card p-5 flex items-center gap-4 shadow-2xl shadow-[var(--accent)]/20 border-[var(--accent)]/20 min-w-[320px]">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-2xl shrink-0">
                {newAchievement.icon}
              </div>
              
              <div className="text-left min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] mb-0.5">Achievement Unlocked!</p>
                <p className="text-sm font-bold font-display truncate">{newAchievement.name}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{newAchievement.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default ProfilePage;