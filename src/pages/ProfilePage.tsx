import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit2, Camera, Check, X, Trophy, Star, Calendar, Target, Upload } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import RevealOnScroll from '../components/common/RevealOnScroll';
import AnimatedAvatar from '../components/common/AnimatedAvatar';
import UserRankCard from '../components/match/UserRankCard';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../services/firebase';

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
              <div className="card p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
                <p className="text-[var(--text-secondary)] mb-6">You need to be logged in to view your profile</p>
                <a href="/login" className="btn-primary inline-block">Log In</a>
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
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

        <main className="flex-grow py-12 relative overflow-hidden">
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-8">
                <User className="text-[var(--accent)] mr-3" size={28} />
                <h1 className="text-3xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text)] to-[var(--text-secondary)]">Your Profile</h1>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Card - Moved further left */}
                <div className="lg:col-span-3 space-y-6">
                  <motion.div 
                    className="card-interactive text-center"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative inline-block mb-6">
                      {profileData.profileImage ? (
                        <div className="relative">
                          <img
                            src={profileData.profileImage}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-[var(--accent)] shadow-lg"
                          />
                          <label
                            htmlFor="profile-image-upload"
                            className="absolute bottom-0 right-0 bg-[var(--accent)] rounded-full p-2 cursor-pointer hover:bg-[var(--accent-hover)] transition-colors shadow-lg"
                          >
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            ) : (
                              <Camera size={16} className="text-white" />
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <AnimatedAvatar 
                            type={profileData.selectedAvatar}
                            size={128}
                            interval={8000}
                          />
                          <label
                            htmlFor="profile-image-upload"
                            className="absolute bottom-0 right-0 bg-[var(--accent)] rounded-full p-2 cursor-pointer hover:bg-[var(--accent-hover)] transition-colors shadow-lg"
                          >
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            ) : (
                              <Upload size={16} className="text-white" />
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
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Display Name</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                            placeholder="Enter your display name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Coder Name</label>
                          <input
                            type="text"
                            value={editForm.coderName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, coderName: e.target.value }))}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                            placeholder="Enter your coder name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-3">Avatar Style</label>
                          <div className="grid grid-cols-2 gap-3">
                            {(['boy1', 'boy2', 'girl1', 'girl2'] as const).map((avatarType) => (
                              <div
                                key={avatarType}
                                className={`cursor-pointer p-2 rounded-lg border-2 transition-all ${
                                  editForm.selectedAvatar === avatarType 
                                    ? 'border-[var(--accent)] bg-[var(--accent)] bg-opacity-20' 
                                    : 'border-gray-700 hover:border-[var(--accent)] hover:border-opacity-50'
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
                        
                        <div className="flex space-x-2 pt-4">
                          <button onClick={handleSaveProfile} className="btn-primary flex-1 flex items-center justify-center">
                            <Check size={16} className="mr-1" />
                            Save
                          </button>
                          <button onClick={handleCancelEdit} className="btn-secondary flex-1 flex items-center justify-center">
                            <X size={16} className="mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold font-display mb-1">{profileData.name || 'Anonymous Coder'}</h2>
                        {profileData.coderName && (
                          <p className="text-[var(--accent)] font-medium mb-4">@{profileData.coderName}</p>
                        )}
                        <p className="text-[var(--text-secondary)] mb-6">{currentUser.email}</p>
                        
                        <button onClick={handleEditProfile} className="btn-primary flex items-center justify-center w-full">
                          <Edit2 size={16} className="mr-2" />
                          Edit Profile
                        </button>
                      </>
                    )}
                  </motion.div>
                  
                  {/* Achievement Showcase Section */}
                  <motion.div 
                    className="card-interactive"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="flex items-center mb-4">
                      <Trophy className="text-[var(--accent)] mr-2" size={20} />
                      <h3 className="text-lg font-semibold font-display">Showcased Achievements</h3>
                    </div>
                    
                    {showcasedAchievements.length > 0 ? (
                      <div className="space-y-3">
                        {achievementsList
                          .filter(achievement => showcasedAchievements.includes(achievement.id))
                          .slice(0, 3) // Only show first 3
                          .map((achievement) => {
                            const isEarned = userAchievements.includes(achievement.id);
                            return (
                              <motion.div 
                                key={achievement.id}
                                className={`flex items-center p-3 rounded-lg ${
                                  isEarned ? 'bg-[var(--accent)] bg-opacity-15 border border-[var(--accent)]' : 'bg-[var(--primary)] opacity-60'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <div className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center mr-3 text-lg">
                                  <span>{achievement.icon}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{achievement.name}</p>
                                  <p className="text-xs text-[var(--text-secondary)]">{achievement.description}</p>
                                </div>
                                {isEarned && (
                                  <div className="text-xs text-green-400">✓</div>
                                )}
                              </motion.div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Trophy className="mx-auto text-[var(--text-secondary)] mb-2" size={24} />
                        <p className="text-sm text-[var(--text-secondary)]">No achievements showcased</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          Visit your stats page to select achievements to showcase
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <a 
                        href="/stats" 
                        className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] block text-center"
                      >
                        Manage achievements in Stats →
                      </a>
                    </div>
                  </motion.div>
                </div>
                
                {/* Stats and Other Content - More Space */}
                <div className="lg:col-span-9 space-y-8">
                  {/* Rank Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <UserRankCard />
                  </motion.div>
                  
                  {/* Quick Stats Grid */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {[
                      { 
                        title: "Problems Solved", 
                        value: profileData.stats.problemsSolved, 
                        icon: <Target className="text-[var(--accent)]" size={24} /> 
                      },
                      { 
                        title: "Current Streak", 
                        value: `${profileData.stats.currentStreak} days`, 
                        icon: <Calendar className="text-[var(--accent)]" size={24} /> 
                      },
                      { 
                        title: "Best Streak", 
                        value: `${profileData.stats.bestStreak} days`, 
                        icon: <Star className="text-[var(--accent)]" size={24} /> 
                      }
                    ].map((stat, index) => (
                      <div key={index} className="card-interactive text-center">
                        <div className="flex justify-center mb-3">
                          {stat.icon}
                        </div>
                        <h3 className="text-2xl font-bold font-display mb-1">{stat.value}</h3>
                        <p className="text-[var(--text-secondary)] text-sm">{stat.title}</p>
                      </div>
                    ))} 
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      {/* Achievement Banner */}
      <AnimatePresence>
        {showAchievementBanner && newAchievement && (
          <motion.div 
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] p-6 rounded-xl shadow-xl flex items-center gap-5 relative overflow-hidden"
              animate={{ 
                boxShadow: [
                  "0 0 0px rgba(244, 91, 105, 0.3)",
                  "0 0 30px rgba(244, 91, 105, 0.6)",
                  "0 0 0px rgba(244, 91, 105, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: 3 }}
            >
              <motion.div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white"
                    initial={{
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%',
                      opacity: 0
                    }}
                    animate={{
                      x: [null, Math.random() * 100 + '%'],
                      y: [null, Math.random() * 100 + '%'],
                      opacity: [0, 0.7, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 3,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                ))}
              </motion.div>
              
              <motion.div
                className="w-16 h-16 bg-[var(--secondary)] rounded-full flex items-center justify-center text-4xl shrink-0"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 1.5, repeat: 2 }}
              >
                {newAchievement.icon}
              </motion.div>
              
              <div className="text-left">
                <motion.h3 
                  className="text-xl font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, repeat: 3 }}
                >
                  Achievement Unlocked!
                </motion.h3>
                <p className="text-lg font-medium">{newAchievement.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{newAchievement.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default ProfilePage;