import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Swords, Clock, Code2, Terminal } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import ProblemPanel from '../components/problem/ProblemPanel';
import CodeEditorPanel from '../components/editor/CodeEditorPanel';
import MatchResultsOverlay from '../components/match/MatchResultsOverlay';
import { getInitialCodeSnippet } from '../data/codingProblems';
import { useProblems } from '../hooks/useProblems';
import { evaluateCode } from '../services/api/judge0';
import { SubmissionResult as SubmissionResultType, TestCase, statusCodes } from '../services/api/judge0.types';
import { useAuth } from '../context/AuthContext';
import { updateProblemSolved, getUserProfile } from '../services/firebase';
import { wrapCode } from '../services/api/codeWrapper';
import { submitMatchSolution, getMatch, subscribeToMatch, forfeitMatch } from '../services/matchmaking/index';
import type { SubmitMatchResult } from '../services/matchmaking/index';

const CodeEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId, isRankedMatch, opponent, matchStartTime: routeMatchStartTime } = location.state || {};

  const { getProblemById, loading: problemsLoading } = useProblems();
  const problemId = id ? parseInt(id, 10) : 0;
  const [problem, setProblem] = useState<any>(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { currentUser } = useAuth();
  const [startTime] = useState(Date.now());

  // Tab state
  const [activeTab, setActiveTab] = useState('question');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResults, setSubmissionResults] = useState<SubmissionResultType[]>([]);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Match-specific state
  // Compute initial remaining time from server startTime if available
  const MATCH_DURATION = 600; // 10 minutes in seconds
  const [matchTimeRemaining, setMatchTimeRemaining] = useState(() => {
    if (routeMatchStartTime) {
      const elapsed = Math.floor((Date.now() - routeMatchStartTime) / 1000);
      return Math.max(MATCH_DURATION - elapsed, 0);
    }
    return MATCH_DURATION;
  });
  const [matchStartTimeMs, setMatchStartTimeMs] = useState<number | null>(routeMatchStartTime || null);
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

  // Refs to prevent stale closures and double-handling
  const hasSubmittedRef = useRef(false);
  const matchCompletedRef = useRef(false);
  const hasForfeitedRef = useRef(false);

  // Resizable panel state
  const [panelWidth, setPanelWidth] = useState(45);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Forfeit / disconnect handling for ranked matches ---
  useEffect(() => {
    if (!isRankedMatch || !matchId || !currentUser) return;

    // Warn user before closing/refreshing during an active match
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (matchCompletedRef.current || hasForfeitedRef.current) return;
      e.preventDefault();
      // Modern browsers show a generic message; the returnValue is required
      e.returnValue = '';

      // Best-effort forfeit via sendBeacon (fire-and-forget)
      try {
        // sendBeacon can't call Firestore SDK, but we set a flag so
        // the opponent's listener / safety-net poll can detect it.
        // The opponent's subscribeToMatch will see the match was not
        // completed and their timer will eventually expire.
      } catch (_) { /* ignore */ }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRankedMatch, matchId, currentUser]);

  // ---------- Effects ----------

  // Load problem (code initialization is handled by the language-change effect below)
  useEffect(() => {
    if (id) {
      const foundProblem = getProblemById(problemId);
      if (foundProblem) {
        setProblem(foundProblem);
      }
    }
  }, [id, problemId, getProblemById]);

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
          console.error('Failed to load opponent profile:', error);
        }
      }
    };
    loadOpponentProfile();
  }, [opponent, currentUser]);

  // Load match details + subscribe to real-time updates (ranked matches)
  useEffect(() => {
    if (!isRankedMatch || !matchId || !currentUser) return;

    let unsubscribe: (() => void) | null = null;

    const loadMatchDetails = async () => {
      try {
        const match = await getMatch(matchId);
        if (!match) return;

        setMatchDetails(match);
        setMatchStatus('in_progress');

        // Use server startTime for the timer so both players are in sync
        if (match.startTime && !matchStartTimeMs) {
          setMatchStartTimeMs(match.startTime);
          const elapsed = Math.floor((Date.now() - match.startTime) / 1000);
          setMatchTimeRemaining(Math.max(MATCH_DURATION - elapsed, 0));
        }

        // Check if current user already submitted (e.g. page refresh)
        if (match.submissions && match.submissions[currentUser.uid]) {
          setShowResults(true);
          hasSubmittedRef.current = true;
        }

        // Check if match is already completed
        if (match.status === 'completed' && match.winner) {
          await handleMatchCompleted(match);
          return; // Don't subscribe — already done
        }

        // Subscribe to real-time updates on the match document.
        // This fires instantly when the opponent submits or the match
        // status changes — no polling delay, no stale cache.
        unsubscribe = subscribeToMatch(matchId, async (updatedMatch) => {
          // Always keep matchDetails in sync with the latest Firestore
          // data so the MatchResultsOverlay has current submissions, etc.
          setMatchDetails(updatedMatch);

          if (matchCompletedRef.current) {
            if (unsubscribe) unsubscribe();
            return;
          }

          const opponentId = updatedMatch.player1 === currentUser.uid
            ? updatedMatch.player2
            : updatedMatch.player1;

          if (updatedMatch.submissions?.[opponentId]) {
            const submissionTime = new Date(updatedMatch.submissions[opponentId].submissionTime)
              .toLocaleTimeString();
            setOpponentUpdates(`Opponent submitted their solution at ${submissionTime}.`);
          }

          if (updatedMatch.status === 'completed' && updatedMatch.winner) {
            if (unsubscribe) unsubscribe();
            await handleMatchCompleted(updatedMatch);
          }
        });
      } catch (error) {
        console.error('Failed to load match details:', error);
        setSubmissionError('Failed to load match details. Please try again.');
      }
    };

    loadMatchDetails();

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRankedMatch, matchId, currentUser?.uid]);

  // Update code when language changes or problem loads (e.g. from Firebase)
  useEffect(() => {
    if (problemId) setCode(getInitialCodeSnippet(language, problemId, problem ?? undefined));
  }, [language, problemId, problem]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerRunning]);

  // Safety net: poll for match completion if the submission succeeded
  // but neither handleSubmit nor the subscribeToMatch listener managed
  // to trigger handleMatchCompleted (edge-case recovery).
  useEffect(() => {
    if (!isRankedMatch || !matchId || isSubmitting) return;
    // Only activate after the user has submitted but results aren't showing
    if (!hasSubmittedRef.current || matchCompletedRef.current) return;

    const pollId = setInterval(async () => {
      if (matchCompletedRef.current) {
        clearInterval(pollId);
        return;
      }
      try {
        const match = await getMatch(matchId);
        if (match?.status === 'completed' && match.winner) {
          clearInterval(pollId);
          await handleMatchCompleted(match);
        }
      } catch (err) {
        console.error('Safety poll error:', err);
      }
    }, 3000);

    // Stop polling after 30 seconds
    const timeoutId = setTimeout(() => clearInterval(pollId), 30000);

    return () => {
      clearInterval(pollId);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRankedMatch, matchId, isSubmitting]);

  // Match countdown timer — synced to server startTime
  useEffect(() => {
    if (isRankedMatch && matchStatus === 'in_progress' && matchStartTimeMs) {
      const countdown = setInterval(() => {
        const elapsed = Math.floor((Date.now() - matchStartTimeMs) / 1000);
        const remaining = Math.max(MATCH_DURATION - elapsed, 0);
        setMatchTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(countdown);
          handleSubmit();
        }
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [isRankedMatch, matchStatus, matchStartTimeMs]);

  // Resizable panel drag handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setPanelWidth(Math.min(Math.max(pct, 20), 75));
    };
    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // ---------- Helpers ----------

  const handleMatchCompleted = async (match: any) => {
    // Guard against duplicate calls (polling + submit can both trigger this)
    if (matchCompletedRef.current) return;
    matchCompletedRef.current = true;

    const winnerId = match.winner;
    const loserId = winnerId === match.player1 ? match.player2 : match.player1;

    // Set the critical UI states immediately so the overlay renders
    // without waiting on any network requests.
    setMatchWinner(winnerId);
    setMatchLoser(loserId);
    setShowMatchResults(true);
    setMatchStatus('completed');

    // Refresh matchDetails with the latest data (including both players'
    // submissions) so the MatchResultsOverlay shows correct test results.
    // If the passed match already has both submissions, use it directly;
    // otherwise fetch fresh data from Firestore.
    const hasBothSubmissions =
      match.submissions &&
      match.player1 &&
      match.player2 &&
      match.submissions[match.player1] &&
      match.submissions[match.player2];

    if (hasBothSubmissions) {
      setMatchDetails(match);
    } else if (matchId) {
      try {
        const freshMatch = await getMatch(matchId);
        if (freshMatch) setMatchDetails(freshMatch);
      } catch (e) {
        console.error('Failed to refresh matchDetails:', e);
        // Fall back to whatever data we received
        if (match.submissions) setMatchDetails(match);
      }
    }

    try {
      const { data: winnerData } = await getUserProfile(winnerId);
      const { data: loserData } = await getUserProfile(loserId);
      if (winnerData) setWinnerProfile(winnerData);
      if (loserData) setLoserProfile(loserData);

      // Points are handled atomically by autoUpdateWinnerStats (triggered
      // by submitMatchSolution). No client-side point updates needed here
      // — this prevents the race condition where both clients award points.
      setResultsUpdated(true);
    } catch (error: any) {
      console.error('Error in match completion handling:', error);
      setSubmissionError(`Error updating match results: ${error.message}`);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMatchTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTestCases = useCallback((): TestCase[] => {
    if (problem?.testCases?.length > 0) return problem.testCases;
    if (problem?.examples?.length > 0) {
      return problem.examples.map((example: any) => ({
        input: example.input.replace(/^.*=\s*/, '').replace(/\[|\]|\"|\'/g, '').trim(),
        expectedOutput: example.output.replace(/\[|\]|\"|\'/g, '').trim(),
        isHidden: false,
      }));
    }
    return [];
  }, [problem]);

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

  // ---------- Handlers ----------

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (!isTyping) {
      setIsTyping(true);
      setTimerRunning(true);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleSubmit = async () => {
    if (matchStatus === 'completed' || hasSubmittedRef.current) return;
    try {
      setTimerRunning(false);
      setIsSubmitting(true);
      setSubmissionError(null);
      setSubmissionResults([]);
      setShowResults(true);

      const testCases = getTestCases().slice(0, 3);
      if (testCases.length === 0) {
        setSubmissionError('No test cases available for this problem.');
        return;
      }

      const wrappedCode = wrapCode(code, language, problemId, problem?.functionMeta);
      const results = await evaluateCode(wrappedCode, language, testCases);
      setSubmissionResults(results);

      const allPassed = results.every((r) => r.status.id === statusCodes.ACCEPTED);
      const testCasesPassed = results.filter((r) => r.status.id === statusCodes.ACCEPTED).length;

      if (currentUser) {
        const solveTime = Math.round((Date.now() - startTime) / 1000);

        if (isRankedMatch && matchId) {
          try {
            const result: SubmitMatchResult = await submitMatchSolution(matchId, currentUser.uid, code, language, testCasesPassed, testCases.length);
            if (result.success) {
              hasSubmittedRef.current = true;

              if (result.matchCompleted && result.winnerId) {
                // Both players submitted. Use the winner/loser from the
                // transaction result directly instead of re-fetching via
                // getMatch — a re-fetch can return stale data (missing
                // the winner field) due to Firestore read-your-writes
                // timing, which would permanently lock out the results
                // overlay by setting matchCompletedRef without a winner.
                const completedMatch = {
                  ...(matchDetails || {}),
                  winner: result.winnerId,
                  player1: matchDetails?.player1 || currentUser.uid,
                  player2: matchDetails?.player2 || opponent,
                  status: 'completed',
                };
                await handleMatchCompleted(completedMatch);
              }
              // If not matchCompleted, the opponent hasn't submitted yet.
              // Keep matchStatus as 'in_progress' so the countdown and
              // the subscribeToMatch listener continue until completion.
            } else {
              setSubmissionError('Failed to submit your solution for the match. Please try again.');
            }
          } catch (error: any) {
            setSubmissionError(`Match submission error: ${error.message}`);
            console.error('Match submission error:', error);
          }
        } else if (allPassed) {
          try {
            const updateResult = await updateProblemSolved(currentUser.uid, problemId, solveTime);
            if (!updateResult.success) {
              console.error('Failed to update problem status:', updateResult.error);
            }
          } catch (error: any) {
            console.error('Error updating problem status:', error);
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

  const handleGoBack = async () => {
    if (isRankedMatch) {
      if (matchCompletedRef.current || hasForfeitedRef.current) {
        navigate('/ranked-match');
        return;
      }
      if (window.confirm('Leaving will forfeit the match and your opponent wins. Are you sure?')) {
        hasForfeitedRef.current = true;
        try {
          if (matchId && currentUser) {
            await forfeitMatch(matchId, currentUser.uid);
          }
        } catch (err) {
          console.error('Error forfeiting match:', err);
        }
        navigate('/ranked-match');
      }
    } else {
      navigate('/code');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => alert('Code copied to clipboard!'))
      .catch((err) => console.error('Failed to copy: ', err));
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${problem?.title.replace(/\s+/g, '_').toLowerCase() || 'solution'}.${language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleResetCode = () => {
    if (window.confirm('Are you sure you want to reset your code to the initial template?')) {
      setCode(getInitialCodeSnippet(language, problemId, problem ?? undefined));
    }
  };

  // ---------- Render ----------

  // Still loading problems from Firebase — show spinner instead of "not found"
  if (!problem && problemsLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-[var(--primary)]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-transparent"
              style={{
                backgroundImage: 'linear-gradient(var(--primary), var(--primary)), linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                backgroundOrigin: 'border-box',
                backgroundClip: 'content-box, border-box',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-sm text-[var(--text-secondary)]">Loading problem...</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // Problem not found
  if (!problem) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-[var(--primary)] relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--accent)] filter blur-[200px] opacity-[0.04]" />
          </div>
          <main className="flex-grow flex items-center justify-center relative z-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Terminal size={48} className="mx-auto mb-4 text-[var(--accent)] opacity-50" />
              <p className="text-xl text-[var(--text-secondary)] mb-4">Problem not found</p>
              <button
                onClick={handleGoBack}
                className="flex items-center mx-auto gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[var(--accent)] hover:bg-white/[0.1] transition-all duration-200"
              >
                <ArrowLeft size={16} />
                Back to problems
              </button>
            </motion.div>
          </main>
        </div>
      </PageTransition>
    );
  }

  // Match results overlay
  if (showMatchResults && matchWinner && matchLoser && currentUser) {
    return (
      <MatchResultsOverlay
        isWinner={matchWinner === currentUser.uid}
        opponentName={opponentName}
        problem={problem}
        matchDetails={matchDetails}
        currentUserId={currentUser.uid}
        opponentId={opponent}
        winnerProfile={winnerProfile}
        loserProfile={loserProfile}
        formatTime={formatTime}
        onViewLeaderboard={() => navigate('/leaderboard')}
        onFindNewMatch={() => navigate('/ranked-match')}
      />
    );
  }

  // Main editor view — full-screen IDE layout
  return (
    <PageTransition>
      <div className="h-screen flex flex-col overflow-hidden bg-[var(--primary)] relative">
        {/* Ambient background effects */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[var(--accent)] filter blur-[250px] opacity-[0.03]" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-[var(--accent-secondary)] filter blur-[220px] opacity-[0.02]" />
        </div>

        {/* Glassmorphic top bar */}
        <motion.div
          className="relative flex items-center justify-between h-12 px-4 bg-[var(--secondary)]/80 backdrop-blur-xl border-b border-white/[0.06] flex-shrink-0 z-20"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />

          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleGoBack}
              className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-white text-sm transition-all duration-200 px-2 py-1 rounded-lg hover:bg-white/[0.05]"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </motion.button>
            <div className="w-px h-5 bg-white/[0.08]" />
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Code2 size={16} className="text-[var(--accent)]" />
                <div className="absolute inset-0 bg-[var(--accent)] filter blur-[6px] opacity-30" />
              </div>
              <span className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-none tracking-tight">{problem.title}</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isRankedMatch && (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <Swords size={13} className="text-[var(--accent)]" />
                  <span className="font-medium">vs {opponentName}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-mono font-bold transition-all duration-300 ${
                  matchTimeRemaining < 60
                    ? 'text-red-400 bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : matchTimeRemaining < 180
                    ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20'
                    : 'text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20'
                }`}>
                  <Clock size={13} className={matchTimeRemaining < 60 ? 'animate-pulse' : ''} />
                  {formatMatchTime(matchTimeRemaining)}
                </div>
              </motion.div>
            )}
            {!isRankedMatch && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <Clock size={13} className="text-[var(--accent-secondary)]" />
                <span className="font-mono font-medium">{formatTime(timer)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Split panels with resizer */}
        <main ref={containerRef} className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10">
          {/* Problem Panel */}
          <motion.div
            className="editor-layout-problem"
            style={{ '--panel-w': `${panelWidth}%` } as React.CSSProperties}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ProblemPanel
              problem={problem}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isRankedMatch={!!isRankedMatch}
              opponentName={opponentName}
              matchTimeRemaining={matchTimeRemaining}
              formatMatchTime={formatMatchTime}
              showResults={showResults}
              isSubmitting={isSubmitting}
              submissionResults={submissionResults}
              submissionError={submissionError}
              testCases={getTestCases()}
              opponentUpdates={opponentUpdates}
              onGoBack={handleGoBack}
              getDifficultyColor={getDifficultyColor}
            />
          </motion.div>

          {/* Resizer handle */}
          <div
            className="editor-resizer"
            onMouseDown={(e) => {
              e.preventDefault();
              isDraggingRef.current = true;
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
            }}
          >
            <div className="editor-resizer-bar" />
          </div>

          {/* Code Editor Panel */}
          <motion.div
            className="flex-1 min-w-0 min-h-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <CodeEditorPanel
              code={code}
              language={language}
              timer={timer}
              timerRunning={timerRunning}
              isSubmitting={isSubmitting}
              matchStatus={matchStatus}
              formatTime={formatTime}
              onCodeChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
              onSubmit={handleSubmit}
              onToggleTimer={() => setTimerRunning(!timerRunning)}
              onResetCode={handleResetCode}
              onCopyCode={handleCopyCode}
              onDownloadCode={handleDownloadCode}
            />
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default CodeEditorPage;
