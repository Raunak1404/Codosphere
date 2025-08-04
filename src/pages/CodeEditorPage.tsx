import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Copy, Download, RotateCcw, ArrowLeft, Loader, Check, X, AlertCircle, Swords, Trophy as TrophyIcon, Clock, ArrowRight, FileText, List, HelpCircle } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { getInitialCodeSnippet } from '../data/codingProblems';
import { useProblems } from '../hooks/useProblems';
import { evaluateCode } from '../utils/judge0';
import { SubmissionResult as SubmissionResultType, TestCase, statusCodes } from '../types/judge0';
import SubmissionResult from '../components/SubmissionResult';
import { useAuth } from '../context/AuthContext';
import { updateProblemSolved, updateMatchResults, getUserProfile } from '../firebase/firebase';
import { submitMatchSolution, getMatch } from '../services/matchmaking';

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' }
];

const CodeEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId, isRankedMatch, opponent } = location.state || {};
  
  const { getProblemById } = useProblems();
  const problemId = id ? parseInt(id, 10) : 0;
  const [problem, setProblem] = useState<any>(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { currentUser } = useAuth();
  const [startTime] = useState(Date.now());
  
  // New state for tabs
  const [activeTab, setActiveTab] = useState('question');
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResults, setSubmissionResults] = useState<SubmissionResultType[]>([]);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Add match-specific state
  const [matchTimeRemaining, setMatchTimeRemaining] = useState(600); // 10 minutes in seconds
  const [matchStatus, setMatchStatus] = useState<'waiting' | 'in_progress' | 'completed'>('waiting');
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [opponentName, setOpponentName] = useState<string>(opponent || 'Opponent');
  const [opponentUpdates, setOpponentUpdates] = useState<string | null>(null);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [matchLoser, setMatchLoser] = useState<string | null>(null);
  const [showMatchResults, setShowMatchResults] = useState(false);
  const [resultsUpdated, setResultsUpdated] = useState(false);
  const [winnerProfile, setWinnerProfile] = useState<any>(null);
  const [loserProfile, setLoserProfile] = useState<any>(null);
  const [checkingInterval, setCheckingInterval] = useState<NodeJS.Timeout | null>(null);

  // Find problem by id
  useEffect(() => {
    const loadProblem = async () => {
      if (id) {
        // Use the getProblemById function from the hook
        const foundProblem = getProblemById(problemId);
        
        if (foundProblem) {
          setProblem(foundProblem);
          // Set initial code snippet based on problem and language
          setCode(getInitialCodeSnippet(language, problemId));
        }
      }
    };
    
    loadProblem();
  }, [id, problemId, getProblemById]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (checkingInterval) {
        clearInterval(checkingInterval);
      }
    };
  }, [checkingInterval]);

  // Load opponent profile
  useEffect(() => {
    const loadOpponentProfile = async () => {
      if (opponent && currentUser) {
        try {
          const { data } = await getUserProfile(opponent);
          if (data) {
            setOpponentName(data.name || data.coderName || opponent.substring(0, 8));
          }
        } catch (error) {
          console.error("Failed to load opponent profile:", error);
        }
      }
    };

    loadOpponentProfile();
  }, [opponent, currentUser]);

  // Load match details if this is a ranked match
  useEffect(() => {
    const loadMatchDetails = async () => {
      if (isRankedMatch && matchId) {
        try {
          const match = await getMatch(matchId);
          if (match) {
            setMatchDetails(match);
            setMatchStatus('in_progress');
            
            // If match already has submissions, check if we need to show results
            if (match.submissions && match.submissions[currentUser?.uid || '']) {
              // User has already submitted, show their results
              setShowResults(true);
              setMatchStatus('completed');
            }
            
            // Check if match is completed and has a winner
            if (match.status === 'completed' && match.winner) {
              const winnerId = match.winner;
              const loserId = winnerId === match.player1 ? match.player2 : match.player1;
              
              setMatchWinner(winnerId);
              setMatchLoser(loserId);
              setShowMatchResults(true);
              
              // Load profiles for winner and loser
              try {
                const { data: winnerData } = await getUserProfile(winnerId);
                const { data: loserData } = await getUserProfile(loserId);
                
                if (winnerData) setWinnerProfile(winnerData);
                if (loserData) setLoserProfile(loserData);
              } catch (error) {
                console.error("Failed to load winner/loser profiles:", error);
              }
            }
            
            // Set up interval to check for opponent updates
            const intervalId = setInterval(async () => {
              try {
                const updatedMatch = await getMatch(matchId);
                if (updatedMatch && updatedMatch.submissions) {
                  // Check for opponent submission
                  const opponentId = updatedMatch.player1 === currentUser?.uid ? 
                    updatedMatch.player2 : updatedMatch.player1;
                  
                  if (updatedMatch.submissions[opponentId]) {
                    // Opponent has submitted
                    const submissionTime = new Date(updatedMatch.submissions[opponentId].submissionTime)
                      .toLocaleTimeString();
                    
                    setOpponentUpdates(
                      `${opponentName} submitted their solution at ${submissionTime}.`
                    );
                    
                    // If match is completed and has a winner
                    if (updatedMatch.status === 'completed' && updatedMatch.winner) {
                      const winnerId = updatedMatch.winner;
                      const loserId = winnerId === updatedMatch.player1 ? updatedMatch.player2 : updatedMatch.player1;
                      
                      setMatchWinner(winnerId);
                      setMatchLoser(loserId);
                      setShowMatchResults(true);
                      setMatchStatus('completed');
                      
                      // Load profiles for winner and loser
                      try {
                        const { data: winnerData } = await getUserProfile(winnerId);
                        const { data: loserData } = await getUserProfile(loserId);
                        
                        if (winnerData) setWinnerProfile(winnerData);
                        if (loserData) setLoserProfile(loserData);
                        
                        // Update rank points for winner and loser if not already updated
                        if (!resultsUpdated && currentUser && !updatedMatch.pointsAwarded) {
                          try {
                            // Only update once, and only if the match hasn't been processed
                            const updateResult = await updateMatchResults(winnerId, loserId);
                            
                            if (updateResult.success) {
                              if (updateResult.alreadyProcessed) {
                                console.log("Points were already awarded for this match");
                              } else {
                                console.log("Match results updated successfully");
                              }
                              setResultsUpdated(true);
                            } else {
                              console.error("Match results update failed:", updateResult.error);
                              setSubmissionError(`Failed to update match results: ${updateResult.error}`);
                            }
                          } catch (error: any) {
                            console.error("Error updating match results:", error);
                            setSubmissionError(`Error updating match results: ${error.message}`);
                          }
                        }
                      } catch (error) {
                        console.error("Failed to load winner/loser profiles:", error);
                      }
                    }
                  }
                }
              } catch (e) {
                console.error("Error checking for match updates:", e);
              }
            }, 5000); // Check less frequently (5 seconds instead of 3)
            
            // Save the interval ID for cleanup
            setCheckingInterval(intervalId);
          }
        } catch (error) {
          console.error("Failed to load match details:", error);
          setSubmissionError("Failed to load match details. Please try again.");
        }
      }
    };
    
    if (isRankedMatch && matchId && currentUser) {
      loadMatchDetails();
    }
  }, [isRankedMatch, matchId, currentUser, opponentName, resultsUpdated]);

  // Handle language change
  useEffect(() => {
    if (problemId) {
      setCode(getInitialCodeSnippet(language, problemId));
    }
  }, [language, problemId]);

  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  // Handle match timer
  useEffect(() => {
    if (isRankedMatch && matchStatus === 'in_progress') {
      const timer = setInterval(() => {
        setMatchTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            handleSubmit(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isRankedMatch, matchStatus]);

  // Start timer when typing begins
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);

    if (!isTyping) {
      setIsTyping(true);
      setTimerRunning(true);
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format match time for display
  const formatMatchTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle language selection
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  // Create default test cases if none exist
  const getTestCases = useCallback((): TestCase[] => {
    if (problem && problem.testCases && problem.testCases.length > 0) {
      return problem.testCases;
    }
    
    // If no test cases exist, create default ones from examples
    if (problem && problem.examples && problem.examples.length > 0) {
      return problem.examples.map((example: any, index: number) => {
        // Clean up the input and output
        const input = example.input
          .replace(/^.*=\s*/, '') // Remove variable name and equals
          .replace(/\[|\]|\"|\'/g, '') // Remove brackets and quotes
          .trim();
        
        const output = example.output
          .replace(/\[|\]|\"|\'/g, '') // Remove brackets and quotes
          .trim();
        
        return {
          input,
          expectedOutput: output,
          isHidden: false
        };
      });
    }
    
    return [];
  }, [problem]);

  // Handle code submission
  const handleSubmit = async () => {
    if (matchStatus === 'completed') {
      return; // Don't allow resubmission if already completed
    }
    
    try {
      setTimerRunning(false);
      setIsSubmitting(true);
      setSubmissionError(null);
      setSubmissionResults([]);
      setShowResults(true);
      
      const testCases = getTestCases().slice(0, 3); // Process up to 3 test cases
      
      if (testCases.length === 0) {
        setSubmissionError('No test cases available for this problem.');
        return;
      }
      
      const results = await evaluateCode(code, language, testCases);
      setSubmissionResults(results);
      
      const allPassed = results.every(result => result.status.id === statusCodes.ACCEPTED);
      const testCasesPassed = results.filter(result => result.status.id === statusCodes.ACCEPTED).length;

      if (currentUser) {
        const solveTime = Math.round((Date.now() - startTime) / 1000);

        if (isRankedMatch && matchId) {
          console.log('Submitting ranked match solution:', matchId);
          // Submit solution for ranked match
          try {
            const success = await submitMatchSolution(
              matchId,
              currentUser.uid,
              code,
              language,
              testCasesPassed,
              testCases.length
            );
            
            if (success) {
              setMatchStatus('completed');
            } else {
              setSubmissionError('Failed to submit your solution for the match. Please try again.');
            }
          } catch (error: any) {
            setSubmissionError(`Match submission error: ${error.message}`);
            console.error("Match submission error:", error);
          }
        } else if (allPassed) {
          console.log('All tests passed! Updating problem status.');
          // Update regular problem status
          try {
            const updateResult = await updateProblemSolved(currentUser.uid, problemId, solveTime);
            if (!updateResult.success) {
              console.error('Failed to update problem status:', updateResult.error);
            }
          } catch (error: any) {
            console.error("Error updating problem status:", error);
          }
        }
      }
      
    } catch (error: any) {
      setSubmissionError(error.message || 'An error occurred during submission');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back button click
  const handleGoBack = () => {
    if (isRankedMatch) {
      if (window.confirm('Are you sure you want to leave the ranked match?')) {
        navigate('/ranked-match');
      }
    } else {
      navigate('/code');
    }
  };

  // Navigate to leaderboard
  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert('Code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Download code
  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${problem?.title.replace(/\s+/g, '_').toLowerCase() || 'solution'}.${language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Reset code to initial state
  const handleResetCode = () => {
    if (window.confirm('Are you sure you want to reset your code to the initial template?')) {
      setCode(getInitialCodeSnippet(language, problemId));
    }
  };

  // Find new match
  const handleFindNewMatch = () => {
    navigate('/ranked-match');
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-400 bg-opacity-10 border-green-400';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400 bg-opacity-10 border-yellow-400';
      case 'Hard':
        return 'text-red-400 bg-red-400 bg-opacity-10 border-red-400';
      default:
        return 'text-[var(--text)] bg-gray-500 bg-opacity-10 border-gray-500';
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'question', label: 'Question', icon: <FileText size={16} /> },
    { id: 'examples', label: 'Examples', icon: <List size={16} /> },
    { id: 'constraints', label: 'Constraints', icon: <HelpCircle size={16} /> },
  ];

  if (!problem) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl">Problem not found</p>
              <button
                onClick={handleGoBack}
                className="mt-4 flex items-center text-[var(--accent)] hover:underline"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to problems
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  // Render match results overlay if the match is complete
  if (showMatchResults && matchWinner && matchLoser) {
    const isWinner = currentUser && matchWinner === currentUser.uid;
    const profileToShow = isWinner ? winnerProfile : loserProfile;
    const opponentProfile = isWinner ? loserProfile : winnerProfile;
    
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="card max-w-4xl w-full mx-auto"
            >
              <div className="text-center mb-12">
                <TrophyIcon className="text-yellow-400 mx-auto mb-6" size={80} />
                <h1 className="text-4xl font-bold mb-4">
                  Match {isWinner ? 'Won!' : 'Completed'}
                </h1>
                <p className="text-lg text-[var(--text-secondary)]">
                  {isWinner 
                    ? 'Congratulations! You won the ranked match.' 
                    : `${opponentName} won the match.`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className={`p-8 rounded-xl ${isWinner ? 'bg-green-500 bg-opacity-20' : 'bg-[var(--primary)]'}`}>
                  <h3 className="font-bold text-xl mb-4">Your Results</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-base">Tests Passed:</span>
                      <span className="font-medium text-lg">
                        {matchDetails?.submissions[currentUser?.uid || '']?.testCasesPassed || 0}/
                        {matchDetails?.submissions[currentUser?.uid || '']?.totalTestCases || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base">Submission Time:</span>
                      <span className="font-medium text-lg">
                        {matchDetails?.submissions[currentUser?.uid || '']
                          ? formatTime(Math.floor((matchDetails.submissions[currentUser.uid].submissionTime - matchDetails.startTime) / 1000))
                          : '00:00:00'}
                      </span>
                    </div>
                    {isWinner && (
                      <div className="flex justify-between">
                        <span className="text-base">Points Earned:</span>
                        <span className="font-medium text-lg text-green-400">+1 Rank Point</span>
                      </div>
                    )}
                    {profileToShow && (
                      <div className="flex justify-between">
                        <span className="text-base">Current Rank:</span>
                        <span className="font-medium text-lg">{profileToShow.stats?.rank || 'Unranked'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--primary)] p-8 rounded-xl">
                  <h3 className="font-bold text-xl mb-4">{opponentName}'s Results</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-base">Tests Passed:</span>
                      <span className="font-medium text-lg">
                        {matchDetails?.submissions[opponent]?.testCasesPassed || 0}/
                        {matchDetails?.submissions[opponent]?.totalTestCases || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base">Submission Time:</span>
                      <span className="font-medium text-lg">
                        {matchDetails?.submissions[opponent]
                          ? formatTime(Math.floor((matchDetails.submissions[opponent].submissionTime - matchDetails.startTime) / 1000))
                          : '00:00:00'}
                      </span>
                    </div>
                    {!isWinner && (
                      <div className="flex justify-between">
                        <span className="text-base">Points Earned:</span>
                        <span className="font-medium text-lg text-green-400">+1 Rank Point</span>
                      </div>
                    )}
                    {opponentProfile && (
                      <div className="flex justify-between">
                        <span className="text-base">Current Rank:</span>
                        <span className="font-medium text-lg">{opponentProfile.stats?.rank || 'Unranked'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[var(--primary)] p-6 rounded-xl mb-8">
                <h3 className="font-bold text-xl mb-4">Match Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-base">Problem:</span>
                    <span className="font-medium text-lg">{problem.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base">Difficulty:</span>
                    <span className={`font-medium text-lg ${
                      problem.difficulty === 'Easy' ? 'text-green-400' :
                      problem.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base">Winner:</span>
                    <span className="font-medium text-lg text-yellow-400">
                      {isWinner ? 'You' : opponentName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base">Reason:</span>
                    <span className="font-medium text-lg">
                      {(() => {
                        const myTests = matchDetails?.submissions[currentUser?.uid || '']?.testCasesPassed || 0;
                        const opponentTests = matchDetails?.submissions[opponent]?.testCasesPassed || 0;
                        
                        if (myTests !== opponentTests) {
                          return isWinner ? 
                            'More test cases passed' : 
                            'Opponent passed more test cases';
                        } else {
                          return isWinner ? 
                            'Faster submission time' : 
                            'Opponent had faster submission time';
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={handleViewLeaderboard}
                  className="btn-secondary flex-1 flex items-center justify-center py-3 text-lg"
                >
                  <TrophyIcon size={20} className="mr-3" />
                  View Leaderboard
                </button>
                <button 
                  onClick={handleFindNewMatch}
                  className="btn-primary flex-1 flex items-center justify-center py-3 text-lg"
                >
                  <Swords size={20} className="mr-3" />
                  Find New Match
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)]">
        <Navbar />

        <main className="flex-grow flex flex-col md:flex-row">
          {/* Problem Description Panel - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-1/2 bg-[var(--secondary)] bg-opacity-60 backdrop-blur-md border-r border-white/10 overflow-hidden flex flex-col"
          >
            {/* Ranked Match Header */}
            {isRankedMatch && (
              <motion.div 
                className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-secondary)] to-[var(--accent)] bg-opacity-20 backdrop-blur-sm p-4 border-b border-white/10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <Swords className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">Ranked Match</h3>
                      <p className="text-white text-opacity-80 text-xs">vs. {opponentName}</p>
                    </div>
                  </div>
                  <div className="text-right bg-black bg-opacity-20 px-3 py-2 rounded-lg">
                    <div className={`text-xl font-bold text-white ${matchTimeRemaining < 60 ? 'animate-pulse' : ''}`}>
                      {formatMatchTime(matchTimeRemaining)}
                    </div>
                    <p className="text-white text-opacity-70 text-xs">Time Left</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Problem Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.button 
                      onClick={handleGoBack}
                      className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
                    </motion.button>
                    <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <div className="flex gap-2">
                      {problem.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span key={idx} className="bg-white bg-opacity-10 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-black bg-opacity-20 rounded-lg p-1 backdrop-blur-sm">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[var(--accent)] text-white shadow-lg'
                        : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  {activeTab === 'question' && (
                    <div className="prose prose-invert max-w-none">
                      <div className="text-[var(--text)] leading-relaxed whitespace-pre-line rounded-lg bg-black bg-opacity-20 p-6 shadow-inner border border-white/5 font-sans text-base">
                        <div className="font-medium text-lg text-white/90 mb-4 font-serif tracking-wide">{problem.title}</div>
                        <div className="space-y-4 font-light tracking-wide">
                          {problem.description.split('\n\n').map((paragraph: string, i: number) => (
                            <p key={i} className="leading-7 text-[1.05rem]">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'examples' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Examples</h3>
                      {problem.examples && problem.examples.length > 0 ? (
                        <div className="space-y-4">
                          {problem.examples.map((example: any, idx: number) => (
                            <motion.div 
                              key={idx} 
                              className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <div className="mb-3">
                                <span className="text-[var(--accent)] font-semibold">Input:</span>
                                <div className="bg-black bg-opacity-40 p-2 rounded mt-1 font-mono text-sm text-green-300">
                                  {example.input}
                                </div>
                              </div>
                              <div className="mb-3">
                                <span className="text-[var(--accent-secondary)] font-semibold">Output:</span>
                                <div className="bg-black bg-opacity-40 p-2 rounded mt-1 font-mono text-sm text-blue-300">
                                  {example.output}
                                </div>
                              </div>
                              {example.explanation && (
                                <div>
                                  <span className="text-yellow-400 font-semibold">Explanation:</span>
                                  <div className="text-[var(--text-secondary)] mt-1 text-sm leading-relaxed">
                                    {example.explanation}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-[var(--text-secondary)]">
                          <List size={32} className="mx-auto mb-2 opacity-50" />
                          <p>No examples available for this problem.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'constraints' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Constraints</h3>
                      {problem.constraints && problem.constraints.length > 0 ? (
                        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                          <ul className="space-y-2">
                            {problem.constraints.map((constraint: string, idx: number) => (
                              <motion.li 
                                key={idx} 
                                className="flex items-start gap-3 text-[var(--text)] text-sm leading-relaxed"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                <span className="text-[var(--accent)] font-bold mt-0.5">•</span>
                                <span>{constraint}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-[var(--text-secondary)]">
                          <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
                          <p>No constraints specified for this problem.</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Opponent Updates */}
              {opponentUpdates && (
                <motion.div 
                  className="mx-6 mb-6 bg-blue-500 bg-opacity-20 backdrop-blur-sm text-blue-300 p-4 rounded-lg border border-blue-400 border-opacity-30"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm">{opponentUpdates}</p>
                </motion.div>
              )}

              {/* Submission Results */}
              {showResults && (
                <div className="mx-6 mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Submission Results</h3>
                  
                  {submissionError && (
                    <motion.div 
                      className="bg-red-500 bg-opacity-20 backdrop-blur-sm text-red-300 p-4 rounded-lg mb-4 flex items-center border border-red-400 border-opacity-30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                      <span className="text-sm">{submissionError}</span>
                    </motion.div>
                  )}

                  {isSubmitting ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="animate-spin text-[var(--accent)] mr-3" size={24} />
                      <span className="text-white">Running tests...</span>
                    </div>
                  ) : (
                    <>
                      {submissionResults.length > 0 && (
                        <div className="space-y-4">
                          {submissionResults.map((result, index) => (
                            <div key={index}>
                              <SubmissionResult 
                                result={result} 
                                testCaseIndex={index} 
                                isHidden={getTestCases()[index]?.isHidden || false} 
                              />
                            </div>
                          ))}
                          
                          {/* Overall Result Summary */}
                          <motion.div 
                            className="bg-black bg-opacity-40 backdrop-blur-sm p-4 rounded-lg border border-white/10"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="flex items-center">
                              {submissionResults.every(result => result.status.id === statusCodes.ACCEPTED) ? (
                                <>
                                  <Check className="text-green-400 mr-3 flex-shrink-0" size={24} />
                                  <div>
                                    <h4 className="font-semibold text-green-400 text-lg mb-1">All Tests Passed!</h4>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                      Your solution passed all {submissionResults.length} test cases.
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <X className="text-red-400 mr-3 flex-shrink-0" size={24} />
                                  <div>
                                    <h4 className="font-semibold text-red-400 text-lg mb-1">Tests Failed</h4>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                      Your solution passed {submissionResults.filter(r => r.status.id === statusCodes.ACCEPTED).length} out of {submissionResults.length} test cases.
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Code Editor Panel - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-1/2 bg-[var(--primary)] bg-opacity-80 backdrop-blur-md flex flex-col"
          >
            {/* Editor Header */}
            <div className="bg-[var(--secondary)] bg-opacity-80 backdrop-blur-sm p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-black bg-opacity-40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border border-white/20 min-w-[120px]"
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                    <Clock size={16} />
                    <span>Time:</span>
                    <span className="font-mono font-semibold text-[var(--accent)]">{formatTime(timer)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button 
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 text-[var(--text-secondary)] hover:text-white transition-colors"
                    onClick={handleResetCode}
                    title="Reset code"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw size={18} />
                  </motion.button>
                  <motion.button 
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 text-[var(--text-secondary)] hover:text-white transition-colors"
                    onClick={handleCopyCode}
                    title="Copy code"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy size={18} />
                  </motion.button>
                  <motion.button 
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 text-[var(--text-secondary)] hover:text-white transition-colors"
                    onClick={handleDownloadCode}
                    title="Download code"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Code Editor */}
            <div className="flex-grow overflow-hidden p-4">
              <div className="h-full bg-black bg-opacity-60 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                <Editor
                  value={code}
                  onValueChange={handleCodeChange}
                  highlight={(code) => 
                    highlight(
                      code, 
                      languages[language as keyof typeof languages] || languages.javascript, 
                      language || 'javascript'
                    )
                  }
                  padding={20}
                  style={{
                    fontFamily: '"Fira Code", "Menlo", monospace',
                    fontSize: 14,
                    lineHeight: 1.6,
                    backgroundColor: 'transparent',
                    minHeight: '100%',
                    height: 'auto',
                    width: '100%',
                    overflow: 'auto'
                  }}
                  className="w-full h-full"
                  textareaClassName="w-full h-full overflow-y-auto resize-none outline-none"
                />
              </div>
            </div>
            
            {/* Editor Footer */}
            <div className="bg-[var(--secondary)] bg-opacity-80 backdrop-blur-sm p-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <motion.button 
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {timerRunning ? 'Pause Timer' : 'Resume Timer'}
                </motion.button>
                
                <motion.button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || matchStatus === 'completed'}
                  className={`flex items-center bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] hover:from-[var(--accent-secondary)] hover:to-[var(--accent)] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isSubmitting || matchStatus === 'completed' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'
                  }`}
                  whileHover={!(isSubmitting || matchStatus === 'completed') ? { scale: 1.02 } : {}}
                  whileTap={!(isSubmitting || matchStatus === 'completed') ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : matchStatus === 'completed' ? (
                    <>
                      <Check size={18} className="mr-2" />
                      Submitted
                    </>
                  ) : (
                    <>
                      <Play size={18} className="mr-2" />
                      Submit Solution
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default CodeEditorPage;