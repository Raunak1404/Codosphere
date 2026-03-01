import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle, BookOpen, Code, ExternalLink,
  ChevronRight, Clock, FileText, Copy, Check, Sparkles, Trophy, Zap
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import { getTopicById, StudyTopic } from '../data/studyTopics';
import { getProblemById } from '../data/codingProblems';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import '../styles/study.css';

// Difficulty styling
const diffStyles: Record<string, { bg: string; text: string; border: string }> = {
  Beginner: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Intermediate: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
  Advanced: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/20' },
};

const problemDiffStyles: Record<string, { bg: string; text: string }> = {
  Easy: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  Hard: { bg: 'bg-rose-500/15', text: 'text-rose-400' },
};

// Circular progress for sidebar
const SidebarProgress: React.FC<{ percent: number }> = ({ percent }) => {
  const size = 56;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="url(#topicProgressGrad)" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-ring-circle"
        />
        <defs>
          <linearGradient id="topicProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-sm font-bold font-display">{percent}%</span>
    </div>
  );
};

const TopicPage: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const [studyTopic, setStudyTopic] = useState<StudyTopic | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (topic) {
      const topicData = getTopicById(topic);
      if (topicData) {
        setStudyTopic(topicData);
        setActiveSection(0);
        setCompletedSections([]);
      }
    }
  }, [topic]);

  useEffect(() => {
    if (studyTopic) {
      setTimeout(() => Prism.highlightAll(), 50);
    }
  }, [studyTopic, activeSection]);

  const markSectionCompleted = useCallback((index: number) => {
    if (!completedSections.includes(index)) {
      setCompletedSections(prev => [...prev, index]);
      // Quick celebration flash
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1200);
    }
  }, [completedSections]);

  const goToNextSection = useCallback(() => {
    if (studyTopic && activeSection < studyTopic.sections.length - 1) {
      markSectionCompleted(activeSection);
      setActiveSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [studyTopic, activeSection, markSectionCompleted]);

  const goToPreviousSection = useCallback(() => {
    if (activeSection > 0) {
      setActiveSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSection]);

  const completionPercent = studyTopic
    ? Math.round((completedSections.length / studyTopic.sections.length) * 100)
    : 0;

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Not found
  if (!studyTopic) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <BookOpen size={48} className="mx-auto text-[var(--text-secondary)] opacity-30 mb-4" />
              <p className="text-xl mb-3">Topic not found</p>
              <Link
                to="/study"
                className="text-[var(--accent)] hover:text-[var(--accent-hover)] inline-flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Learning Hub
              </Link>
            </motion.div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const ds = diffStyles[studyTopic.difficulty] || diffStyles.Beginner;
  const currentSection = studyTopic.sections[activeSection];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Celebration overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-[var(--accent)]/20 backdrop-blur-xl border border-[var(--accent)]/30 rounded-2xl px-8 py-5 flex items-center gap-4"
              >
                <div className="p-3 rounded-full bg-[var(--accent)]/20">
                  <Sparkles className="text-[var(--accent)]" size={24} />
                </div>
                <div>
                  <p className="text-lg font-bold font-display text-white">Section Complete!</p>
                  <p className="text-sm text-[var(--text-secondary)]">Keep up the great work</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-grow py-8">
          <div className="container-custom">
            {/* ===== TOP HEADER BAR ===== */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
                <Link to="/study" className="hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                  <ArrowLeft size={14} />
                  Learning Hub
                </Link>
                <ChevronRight size={12} className="opacity-40" />
                <span className="text-[var(--text)]">{studyTopic.title}</span>
              </div>

              {/* Title row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight flex items-center gap-3 flex-wrap">
                    {studyTopic.title}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ds.bg} ${ds.text} border ${ds.border}`}>
                      {studyTopic.difficulty}
                    </span>
                  </h1>
                  <p className="text-[var(--text-secondary)] mt-2 max-w-2xl">{studyTopic.description}</p>
                </div>

                {/* Quick info badges */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Clock size={12} />
                    {studyTopic.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <FileText size={12} />
                    {studyTopic.sections.length} lessons
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Code size={12} />
                    {studyTopic.problems} problems
                  </div>
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {completedSections.length} of {studyTopic.sections.length} sections completed
                  </span>
                  <span className="text-xs font-medium text-[var(--accent)]">{completionPercent}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] xp-bar-glow"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* ===== MAIN LAYOUT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* ===== LEFT SIDEBAR ===== */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="sticky top-20 space-y-5">
                  {/* Progress card */}
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <BookOpen size={15} className="text-[var(--accent)]" />
                        Journey
                      </h3>
                      <SidebarProgress percent={completionPercent} />
                    </div>

                    {/* Section list */}
                    <div className="space-y-1">
                      {studyTopic.sections.map((section, index) => {
                        const isActive = index === activeSection;
                        const isCompleted = completedSections.includes(index);

                        return (
                          <button
                            key={index}
                            onClick={() => setActiveSection(index)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 group ${
                              isActive
                                ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20 sidebar-active-indicator'
                                : 'hover:bg-white/[0.04] border border-transparent'
                            }`}
                          >
                            {/* Step indicator */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : isActive
                                ? 'bg-[var(--accent)] text-white shadow-[0_0_12px_rgba(244,91,105,0.3)]'
                                : 'bg-white/[0.06] text-[var(--text-secondary)] group-hover:bg-white/[0.1]'
                            }`}>
                              {isCompleted ? <CheckCircle size={14} /> : index + 1}
                            </div>

                            <span className={`text-sm leading-tight ${
                              isActive ? 'text-white font-medium' : isCompleted ? 'text-emerald-400' : 'text-[var(--text-secondary)]'
                            }`}>
                              {section.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Practice CTA */}
                  <Link
                    to="/code"
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[var(--accent)]/30 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-[var(--accent)]/10">
                      <Zap size={16} className="text-[var(--accent)]" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">Practice Problems</p>
                      <p className="text-xs text-[var(--text-secondary)]">{studyTopic.problems} available</p>
                    </div>
                    <ChevronRight size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
                  </Link>
                </div>
              </motion.div>

              {/* ===== MAIN CONTENT ===== */}
              <div className="lg:col-span-9">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Content card */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                      {/* Section header */}
                      <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/[0.06]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <motion.h2
                              className="text-2xl font-bold font-display text-white mb-1"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              {currentSection.title}
                            </motion.h2>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[var(--text-secondary)]">
                                Section {activeSection + 1} / {studyTopic.sections.length}
                              </span>
                              {completedSections.includes(activeSection) && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1"
                                >
                                  <CheckCircle size={10} />
                                  Complete
                                </motion.span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content body */}
                      <div className="px-6 md:px-8 py-6 md:py-8">
                        {/* Text content */}
                        <div className="rounded-xl bg-black/20 border border-white/[0.04] p-5 md:p-6">
                          <div className="text-[var(--text)] whitespace-pre-line text-[15px] leading-[1.8]">
                            {currentSection.content}
                          </div>
                        </div>

                        {/* Code examples */}
                        {currentSection.examples && currentSection.examples.length > 0 && (
                          <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4">
                              <Code size={18} className="text-[var(--accent)]" />
                              <h3 className="text-lg font-semibold font-display text-white">Code Examples</h3>
                            </div>

                            <div className="space-y-5">
                              {currentSection.examples.map((example, exIndex) => (
                                <motion.div
                                  key={exIndex}
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 + exIndex * 0.08 }}
                                  className="study-code-block"
                                >
                                  {/* Code header */}
                                  <div className="px-4 py-2.5 bg-black/30 border-b border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {/* Traffic light dots */}
                                      <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                                      </div>
                                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                                        {example.language}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06] transition-colors"
                                        onClick={() => handleCopy(example.code, exIndex)}
                                      >
                                        {copiedIndex === exIndex ? (
                                          <>
                                            <Check size={12} className="text-emerald-400" />
                                            <span className="text-emerald-400">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy size={12} />
                                            Copy
                                          </>
                                        )}
                                      </button>
                                      <Link
                                        to="/code"
                                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-white/[0.06] transition-colors"
                                      >
                                        Try it
                                        <ExternalLink size={11} />
                                      </Link>
                                    </div>
                                  </div>
                                  {/* Code content */}
                                  <pre className="p-5 overflow-x-auto text-sm leading-relaxed">
                                    <code className={`language-${example.language.toLowerCase()}`}>
                                      {example.code}
                                    </code>
                                  </pre>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ===== NAVIGATION ===== */}
                        <div className="mt-10 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                          <motion.button
                            onClick={goToPreviousSection}
                            disabled={activeSection === 0}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              activeSection === 0
                                ? 'text-[var(--text-secondary)]/40 cursor-not-allowed'
                                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06]'
                            }`}
                            whileHover={activeSection > 0 ? { x: -3 } : undefined}
                            whileTap={activeSection > 0 ? { scale: 0.97 } : undefined}
                          >
                            <ArrowLeft size={16} />
                            Previous
                          </motion.button>

                          {activeSection < studyTopic.sections.length - 1 ? (
                            <motion.button
                              onClick={goToNextSection}
                              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)]/80 hover:bg-[var(--accent)] text-white shadow-[0_0_20px_rgba(244,91,105,0.2)] transition-all"
                              whileHover={{ scale: 1.03, x: 3 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              {completedSections.includes(activeSection) ? 'Next Lesson' : 'Complete & Continue'}
                              <ArrowRight size={16} />
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => markSectionCompleted(activeSection)}
                              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/80 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Trophy size={16} />
                              {completedSections.includes(activeSection) ? 'Topic Completed!' : 'Complete Topic'}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ===== PRACTICE PROBLEMS ===== */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 md:p-8"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold font-display flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[var(--accent)]/10">
                            <Code size={16} className="text-[var(--accent)]" />
                          </div>
                          Practice Problems
                        </h3>
                        <Link
                          to="/code"
                          className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 transition-colors"
                        >
                          View all
                          <ChevronRight size={12} />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {studyTopic.practiceProblems.map((problem, index) => {
                          const problemData = getProblemById(problem.id);
                          const pds = problemDiffStyles[problem.difficulty] || problemDiffStyles.Easy;

                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.25 + index * 0.04 }}
                            >
                              <Link
                                to={`/code/${problem.id}`}
                                className="group flex items-center justify-between p-3.5 rounded-xl bg-black/20 border border-white/[0.04] hover:border-[var(--accent)]/30 hover:bg-black/30 transition-all"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 text-xs font-bold text-[var(--text-secondary)] group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)] transition-all">
                                    {index + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                                      {problem.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${pds.bg} ${pds.text}`}>
                                        {problem.difficulty}
                                      </span>
                                      {problemData && (
                                        <span className="text-[10px] text-[var(--text-secondary)]">
                                          {problemData.tags.slice(0, 2).join(' · ')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight
                                  size={14}
                                  className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] shrink-0 transition-colors"
                                />
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default TopicPage;