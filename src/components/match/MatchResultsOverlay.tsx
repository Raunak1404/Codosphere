import React from 'react';
import { motion } from 'framer-motion';
import { Trophy as TrophyIcon, Swords } from 'lucide-react';
import Navbar from '../common/Navbar';
import PageTransition from '../common/PageTransition';

interface MatchResultsOverlayProps {
  isWinner: boolean;
  opponentName: string;
  problem: { title: string; difficulty: string };
  matchDetails: any;
  currentUserId: string;
  opponentId: string;
  winnerProfile: any;
  loserProfile: any;
  formatTime: (seconds: number) => string;
  onViewLeaderboard: () => void;
  onFindNewMatch: () => void;
}

const MatchResultsOverlay: React.FC<MatchResultsOverlayProps> = ({
  isWinner,
  opponentName,
  problem,
  matchDetails,
  currentUserId,
  opponentId,
  winnerProfile,
  loserProfile,
  formatTime,
  onViewLeaderboard,
  onFindNewMatch,
}) => {
  const profileToShow = isWinner ? winnerProfile : loserProfile;
  const opponentProfile = isWinner ? loserProfile : winnerProfile;

  const myTests = matchDetails?.submissions[currentUserId]?.testCasesPassed || 0;
  const opponentTests = matchDetails?.submissions[opponentId]?.testCasesPassed || 0;

  const winReason = (() => {
    // Check for forfeit
    if (matchDetails?.forfeitedBy) {
      if (matchDetails.forfeitedBy === currentUserId) {
        return 'You forfeited the match';
      }
      return 'Opponent forfeited the match';
    }
    if (myTests !== opponentTests) {
      return isWinner ? 'More test cases passed' : 'Opponent passed more test cases';
    }
    return isWinner ? 'Faster submission time' : 'Opponent had faster submission time';
  })();

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="card-interactive max-w-4xl w-full mx-auto"
          >
            <div className="text-center mb-12">
              <TrophyIcon className="text-yellow-400 mx-auto mb-6" size={80} />
              <h1 className="text-4xl font-bold font-display mb-4">
                Match {isWinner ? 'Won!' : 'Completed'}
              </h1>
              <p className="text-lg text-[var(--text-secondary)]">
                {isWinner
                  ? 'Congratulations! You won the ranked match.'
                  : `${opponentName} won the match.`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Your Results */}
              <div className={`p-8 rounded-xl ${isWinner ? 'bg-green-500 bg-opacity-20' : 'bg-[var(--primary)]'}`}>
                <h3 className="font-bold font-display text-xl mb-4">Your Results</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-base">Tests Passed:</span>
                    <span className="font-medium text-lg">
                      {matchDetails?.submissions[currentUserId]?.testCasesPassed || 0}/
                      {matchDetails?.submissions[currentUserId]?.totalTestCases || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base">Submission Time:</span>
                    <span className="font-medium text-lg">
                      {matchDetails?.submissions[currentUserId]
                        ? formatTime(Math.floor((matchDetails.submissions[currentUserId].submissionTime - matchDetails.startTime) / 1000))
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

              {/* Opponent Results */}
              <div className="bg-[var(--primary)] p-8 rounded-xl">
                <h3 className="font-bold font-display text-xl mb-4">{opponentName}'s Results</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-base">Tests Passed:</span>
                    <span className="font-medium text-lg">
                      {matchDetails?.submissions[opponentId]?.testCasesPassed || 0}/
                      {matchDetails?.submissions[opponentId]?.totalTestCases || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base">Submission Time:</span>
                    <span className="font-medium text-lg">
                      {matchDetails?.submissions[opponentId]
                        ? formatTime(Math.floor((matchDetails.submissions[opponentId].submissionTime - matchDetails.startTime) / 1000))
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

            {/* Match Summary */}
            <div className="bg-[var(--primary)] p-6 rounded-xl mb-8">
              <h3 className="font-bold font-display text-xl mb-4">Match Summary</h3>
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
                  <span className="font-medium text-lg">{winReason}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={onViewLeaderboard}
                className="btn-secondary flex-1 flex items-center justify-center py-3 text-lg"
              >
                <TrophyIcon size={20} className="mr-3" />
                View Leaderboard
              </button>
              <button
                onClick={onFindNewMatch}
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
};

export default MatchResultsOverlay;
