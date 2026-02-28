import React from 'react';
import { motion } from 'framer-motion';
import { SubmissionResult as SubmissionResultType, statusCodes } from '../../services/api/judge0.types';
import { Check, X, AlertTriangle, Clock, TerminalSquare, Cpu } from 'lucide-react';

interface SubmissionResultProps {
  result: SubmissionResultType;
  testCaseIndex: number;
  isHidden: boolean;
}

const SubmissionResult: React.FC<SubmissionResultProps> = ({ result, testCaseIndex, isHidden }) => {
  const getStatusConfig = () => {
    switch (result.status.id) {
      case statusCodes.ACCEPTED:
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.1)]', icon: <Check size={16} /> };
      case statusCodes.WRONG_ANSWER:
        return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.1)]', icon: <X size={16} /> };
      case statusCodes.TIME_LIMIT_EXCEEDED:
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.1)]', icon: <Clock size={16} /> };
      case statusCodes.COMPILATION_ERROR:
      case statusCodes.RUNTIME_ERROR:
        return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.1)]', icon: <AlertTriangle size={16} /> };
      default:
        return { color: 'text-[var(--text-secondary)]', bg: 'bg-white/[0.03]', border: 'border-white/[0.08]', glow: '', icon: <TerminalSquare size={16} /> };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      className={`rounded-xl border ${config.border} ${config.bg} ${config.glow} backdrop-blur-sm overflow-hidden mb-3`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: testCaseIndex * 0.08 }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${config.bg} ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <span className={`text-sm font-semibold ${config.color}`}>
              Test Case {testCaseIndex + 1} {isHidden ? '(Hidden)' : ''}
            </span>
            <p className="text-[10px] text-[var(--text-secondary)]">{result.status.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {result.time && (
            <div className="flex items-center gap-1 text-[var(--text-secondary)]">
              <Cpu size={11} />
              <span className="text-[11px] font-mono">{parseFloat(result.time).toFixed(2)}s</span>
            </div>
          )}
        </div>
      </div>

      {(!isHidden || result.status.id !== statusCodes.ACCEPTED) && (
        <div className="px-4 pb-3 space-y-2">
          {result.compile_output && (
            <div>
              <p className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Compile Output</p>
              <pre className="bg-black/30 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap text-red-400 border border-red-500/10">
                {result.compile_output}
              </pre>
            </div>
          )}

          {result.stderr && (
            <div>
              <p className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Error</p>
              <pre className="bg-black/30 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap text-red-400 border border-red-500/10">
                {result.stderr}
              </pre>
            </div>
          )}

          {result.stdout && (
            <div>
              <p className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Your Output</p>
              <pre className="bg-black/30 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap text-[var(--text)] border border-white/[0.06]">
                {result.stdout}
              </pre>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SubmissionResult;