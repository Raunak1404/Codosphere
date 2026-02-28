import React from 'react';
import { motion } from 'framer-motion';
import { Play, Loader, Check, ChevronDown, Zap } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import EditorToolbar from './EditorToolbar';

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
];

interface CodeEditorPanelProps {
  code: string;
  language: string;
  timer: number;
  timerRunning: boolean;
  isSubmitting: boolean;
  matchStatus: 'waiting' | 'in_progress' | 'completed';
  formatTime: (seconds: number) => string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => void;
  onToggleTimer: () => void;
  onResetCode: () => void;
  onCopyCode: () => void;
  onDownloadCode: () => void;
}

const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  code,
  language,
  isSubmitting,
  matchStatus,
  onCodeChange,
  onLanguageChange,
  onSubmit,
  onResetCode,
  onCopyCode,
  onDownloadCode,
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full bg-[var(--primary)] relative">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-secondary)]/20 to-transparent" />

      {/* Editor toolbar */}
      <div className="flex items-center justify-between h-11 px-4 bg-[var(--secondary)]/60 backdrop-blur-sm border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative group">
            <select
              value={language}
              onChange={onLanguageChange}
              className="appearance-none bg-white/[0.05] hover:bg-white/[0.08] pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/40 border border-white/[0.08] cursor-pointer transition-all duration-200 hover:border-white/[0.15]"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[var(--secondary)]">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>
          <div className="w-px h-4 bg-white/[0.06]" />
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.02] text-[10px] text-[var(--text-secondary)] font-mono">
            <Zap size={10} className="text-[var(--accent-tertiary)]" />
            <span>Editor</span>
          </div>
        </div>

        <EditorToolbar onReset={onResetCode} onCopy={onCopyCode} onDownload={onDownloadCode} />
      </div>

      {/* Code Editor with ambient glow */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/[0.02] filter blur-[60px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--accent-secondary)]/[0.02] filter blur-[50px] rounded-full" />
        </div>
        <Editor
          value={code}
          onValueChange={onCodeChange}
          highlight={(code) =>
            highlight(
              code,
              languages[language as keyof typeof languages] || languages.javascript,
              language || 'javascript'
            )
          }
          padding={16}
          style={{
            fontFamily: '"JetBrains Mono", "Fira Code", "Menlo", monospace',
            fontSize: 13,
            lineHeight: 1.7,
            backgroundColor: 'transparent',
            minHeight: '100%',
            width: '100%',
          }}
          className="w-full h-full"
          textareaClassName="w-full h-full outline-none resize-none"
        />
      </div>

      {/* Submit bar — glassmorphic */}
      <div className="relative flex items-center justify-between h-14 px-4 bg-[var(--secondary)]/60 backdrop-blur-sm border-t border-white/[0.06] flex-shrink-0">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

        <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
          {isSubmitting && (
            <motion.span
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Evaluating...
            </motion.span>
          )}
        </div>

        <motion.button
          onClick={onSubmit}
          disabled={isSubmitting || matchStatus === 'completed'}
          className={`relative flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${
            isSubmitting || matchStatus === 'completed'
              ? 'bg-white/[0.04] text-[var(--text-secondary)] cursor-not-allowed border border-white/[0.06]'
              : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white shadow-[0_0_20px_rgba(244,91,105,0.25)] hover:shadow-[0_0_30px_rgba(244,91,105,0.4)] border border-[var(--accent)]/30'
          }`}
          whileHover={!(isSubmitting || matchStatus === 'completed') ? { scale: 1.03, y: -1 } : {}}
          whileTap={!(isSubmitting || matchStatus === 'completed') ? { scale: 0.97 } : {}}
        >
          {/* Shimmer effect */}
          {!(isSubmitting || matchStatus === 'completed') && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer-sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          )}

          {isSubmitting ? (
            <>
              <Loader size={14} className="animate-spin" />
              Running...
            </>
          ) : matchStatus === 'completed' ? (
            <>
              <Check size={14} />
              Submitted
            </>
          ) : (
            <>
              <Play size={14} className="fill-current" />
              Submit
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default CodeEditorPanel;
