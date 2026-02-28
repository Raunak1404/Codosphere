import React from 'react';
import { motion } from 'framer-motion';
import { Loader, AlertCircle, Check, X, Trophy } from 'lucide-react';
import { SubmissionResult as SubmissionResultType, statusCodes } from '../../services/api/judge0.types';
import SubmissionResult from '../editor/SubmissionResult';
import ProblemTabs from './ProblemTabs';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface ProblemPanelProps {
  problem: {
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    examples?: { input: string; output: string; explanation?: string }[];
    constraints?: string[];
  };
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isRankedMatch: boolean;
  opponentName: string;
  matchTimeRemaining: number;
  formatMatchTime: (seconds: number) => string;
  showResults: boolean;
  isSubmitting: boolean;
  submissionResults: SubmissionResultType[];
  submissionError: string | null;
  testCases: TestCase[];
  opponentUpdates: string | null;
  onGoBack: () => void;
  getDifficultyColor: (difficulty: string) => string;
}

const ProblemPanel: React.FC<ProblemPanelProps> = ({
  problem,
  activeTab,
  onTabChange,
  showResults,
  isSubmitting,
  submissionResults,
  submissionError,
  testCases,
  opponentUpdates,
}) => {
  return (
    <div className="w-full h-full bg-[var(--primary)]/80 backdrop-blur-sm flex flex-col min-h-0 relative border-r border-white/[0.06]">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--accent)]/[0.03] to-transparent pointer-events-none z-0" />

      {/* Tabs header */}
      <div className="px-4 pt-3 pb-0 flex-shrink-0 relative z-10">
        <ProblemTabs activeTab={activeTab} onTabChange={onTabChange} problem={problem} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        {/* Opponent Updates */}
        {opponentUpdates && (
          <motion.div
            className="mx-4 mb-3 mt-3 bg-[var(--accent-secondary)]/[0.08] text-[var(--accent-secondary)] px-4 py-3 rounded-xl border border-[var(--accent-secondary)]/20 backdrop-blur-sm"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
          >
            <p className="text-sm font-medium">{opponentUpdates}</p>
          </motion.div>
        )}

        {/* Submission Results */}
        {showResults && (
          <motion.div
            className="mx-4 mb-4 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-[var(--accent)]" />
              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Results</h3>
            </div>

            {submissionError && (
              <motion.div
                className="bg-red-500/[0.08] text-red-300 p-3.5 rounded-xl mb-3 flex items-start gap-2.5 border border-red-500/20 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{submissionError}</span>
              </motion.div>
            )}

            {isSubmitting ? (
              <motion.div
                className="flex flex-col items-center justify-center py-10 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="relative">
                  <Loader className="animate-spin text-[var(--accent)]" size={28} />
                  <div className="absolute inset-0 bg-[var(--accent)] filter blur-[12px] opacity-20 animate-pulse" />
                </div>
                <span className="text-sm text-[var(--text-secondary)] font-medium">Running test cases...</span>
                <div className="flex gap-1 mt-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {submissionResults.length > 0 && (
                  <div className="space-y-0">
                    {submissionResults.map((result, index) => (
                      <SubmissionResult
                        key={index}
                        result={result}
                        testCaseIndex={index}
                        isHidden={testCases[index]?.isHidden || false}
                      />
                    ))}

                    {/* Overall Result Summary */}
                    <motion.div
                      className={`p-4 rounded-xl border backdrop-blur-sm ${
                        submissionResults.every((r) => r.status.id === statusCodes.ACCEPTED)
                          ? 'bg-emerald-500/[0.08] border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                          : 'bg-red-500/[0.06] border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.06)]'
                      }`}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: submissionResults.length * 0.08 + 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        {submissionResults.every((result) => result.status.id === statusCodes.ACCEPTED) ? (
                          <>
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20">
                              <Trophy className="text-emerald-400" size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-emerald-400 text-sm">All Tests Passed!</h4>
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                {submissionResults.length}/{submissionResults.length} test cases passed
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20">
                              <X className="text-red-400" size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-red-400 text-sm">Some Tests Failed</h4>
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                {submissionResults.filter((r) => r.status.id === statusCodes.ACCEPTED).length}/{submissionResults.length} test cases passed
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
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProblemPanel;
