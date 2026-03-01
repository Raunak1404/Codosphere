import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Code, ListTree, FileText, BarChart2, Network,
  Layers, GitBranch, Sparkles, Target, Clock, Zap, Trophy,
  ChevronRight, Search, TrendingUp, Star, Flame
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import { studyTopics } from '../data/studyTopics';
import '../styles/study.css';

// Icon mapping
const getIconComponent = (iconName: string, size: number = 24) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Code': <Code size={size} />,
    'ListTree': <ListTree size={size} />,
    'FileText': <FileText size={size} />,
    'BarChart2': <BarChart2 size={size} />,
    'Network': <Network size={size} />,
    'Layers': <Layers size={size} />,
    'GitBranch': <GitBranch size={size} />,
  };
  return iconMap[iconName] || <BookOpen size={size} />;
};

// Difficulty config
const difficultyConfig: Record<string, { color: string; bg: string; border: string; glow: string; dots: number }> = {
  Beginner: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/20',
    glow: 'rgba(16, 185, 129, 0.15)',
    dots: 1,
  },
  Intermediate: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/20',
    glow: 'rgba(245, 158, 11, 0.15)',
    dots: 2,
  },
  Advanced: {
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/20',
    glow: 'rgba(244, 63, 94, 0.15)',
    dots: 3,
  },
};

type FilterType = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';

// Mini progress ring SVG
const ProgressRing: React.FC<{ percent: number; size?: number }> = ({ percent, size = 40 }) => {
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="url(#progressGrad)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        className="progress-ring-circle"
        style={{ '--ring-circumference': circ } as React.CSSProperties}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-secondary)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Difficulty dots
const DifficultyDots: React.FC<{ level: number }> = ({ level }) => (
  <div className="difficulty-dots">
    {[1, 2, 3].map(i => (
      <div
        key={i}
        className={`difficulty-dot ${
          i <= level
            ? 'bg-[var(--accent)] shadow-[0_0_4px_rgba(244,91,105,0.4)]'
            : 'bg-white/10'
        }`}
      />
    ))}
  </div>
);

const StudyPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filteredTopics = useMemo(() => {
    return studyTopics.filter(topic => {
      const matchesFilter = activeFilter === 'all' || topic.difficulty === activeFilter;
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  // Aggregate stats
  const totalProblems = studyTopics.reduce((sum, t) => sum + t.problems, 0);
  const totalTopics = studyTopics.length;

  const filters: { label: string; value: FilterType; icon: React.ReactNode }[] = [
    { label: 'All Topics', value: 'all', icon: <Layers size={14} /> },
    { label: 'Beginner', value: 'Beginner', icon: <Zap size={14} /> },
    { label: 'Intermediate', value: 'Intermediate', icon: <TrendingUp size={14} /> },
    { label: 'Advanced', value: 'Advanced', icon: <Flame size={14} /> },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow">
          {/* ===== HERO SECTION ===== */}
          <section className="relative pt-16 pb-12 overflow-hidden">
            {/* Background decorative elements */}
            <div className="study-hex-grid" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[var(--accent)] filter blur-[200px] opacity-[0.04]" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[var(--accent-secondary)] filter blur-[150px] opacity-[0.03]" />

            <div className="container-custom relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="max-w-3xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="p-2.5 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20"
                    whileHover={{ rotate: 12 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <BookOpen className="text-[var(--accent)]" size={24} />
                  </motion.div>
                  <span className="text-sm font-medium text-[var(--accent)] tracking-wide uppercase">
                    Learning Hub
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
                  Master the Art of{' '}
                  <span
                    className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-secondary)] to-[var(--accent)] bg-clip-text text-transparent text-shimmer"
                  >
                    Problem Solving
                  </span>
                </h1>

                <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                  Structured learning paths with interactive lessons, code examples, and practice problems.
                  Level up your algorithms & data structures skills.
                </p>
              </motion.div>

              {/* ===== QUICK STATS ===== */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-6 mt-8"
              >
                {[
                  { icon: <BookOpen size={18} />, label: 'Topics', value: totalTopics, color: 'var(--accent)' },
                  { icon: <Code size={18} />, label: 'Problems', value: totalProblems, color: 'var(--accent-secondary)' },
                  { icon: <Target size={18} />, label: 'Skill Levels', value: 3, color: 'var(--accent-tertiary)' },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
                    whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.12)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="p-1.5 rounded-lg" style={{ background: `${stat.color}15` }}>
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold font-display stat-glow" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] -mt-0.5">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ===== FILTERS & SEARCH ===== */}
          <section className="py-4">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                  {filters.map(f => (
                    <motion.button
                      key={f.value}
                      onClick={() => setActiveFilter(f.value)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeFilter === f.value
                          ? 'bg-[var(--accent)] text-white shadow-[0_0_16px_rgba(244,91,105,0.3)]'
                          : 'bg-white/[0.04] text-[var(--text-secondary)] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                      }`}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {f.icon}
                      {f.label}
                    </motion.button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)]/40 focus:bg-white/[0.06] transition-all duration-300"
                  />
                </div>
              </motion.div>
            </div>
          </section>

          {/* ===== TOPIC CARDS GRID ===== */}
          <section className="py-8">
            <div className="container-custom">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFilter + searchQuery}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                  {filteredTopics.map((topic, index) => {
                    const dc = difficultyConfig[topic.difficulty] || difficultyConfig.Beginner;
                    const isHovered = hoveredCard === topic.id;
                    const simulatedProgress = 0;

                    return (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.06,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        onMouseEnter={() => setHoveredCard(topic.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <Link to={`/study/${topic.id}`} className="block h-full">
                          <div className="topic-card h-full p-5 flex flex-col">
                            {/* Card top: Icon + mini progress */}
                            <div className="flex items-start justify-between mb-4">
                              <motion.div
                                className="topic-icon-wrap w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-400"
                                style={{
                                  background: `linear-gradient(135deg, ${dc.glow}, transparent)`,
                                  border: `1px solid ${dc.glow}`,
                                }}
                              >
                                <span className={`topic-icon-spin ${dc.color}`}>
                                  {getIconComponent(topic.icon, 22)}
                                </span>
                              </motion.div>

                              <ProgressRing percent={simulatedProgress} size={36} />
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold font-display mb-1.5 text-white transition-colors">
                              {topic.title}
                            </h3>

                            {/* Difficulty + dots */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dc.bg} ${dc.color} border ${dc.border}`}>
                                {topic.difficulty}
                              </span>
                              <DifficultyDots level={dc.dots} />
                            </div>

                            {/* Description */}
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 flex-grow line-clamp-2">
                              {topic.description}
                            </p>

                            {/* Stats row */}
                            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-3 border-t border-white/[0.06]">
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} className="opacity-60" />
                                {topic.estimatedTime}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Code size={12} className="opacity-60" />
                                {topic.problems} problems
                              </span>
                              <span className="flex items-center gap-1.5">
                                <FileText size={12} className="opacity-60" />
                                {topic.sections?.length || 0} lessons
                              </span>
                            </div>

                            {/* Hover CTA */}
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={isHovered ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium">
                                <Sparkles size={14} />
                                Start Learning
                                <ChevronRight size={14} />
                              </div>
                            </motion.div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Empty state */}
              {filteredTopics.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <Search size={48} className="mx-auto text-[var(--text-secondary)] opacity-30 mb-4" />
                  <p className="text-lg text-[var(--text-secondary)]">No topics match your search.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                    className="mt-3 text-sm text-[var(--accent)] hover:underline"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </div>
          </section>

          {/* ===== LEARNING PATHS ===== */}
          <section className="py-12">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-[var(--accent-tertiary)]/10 border border-[var(--accent-tertiary)]/20">
                    <Target className="text-[var(--accent-tertiary)]" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold font-display">Learning Paths</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-tertiary)]/15 text-[var(--accent-tertiary)] font-medium badge-float">
                    Curated
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Interview Preparation',
                      description: 'A comprehensive path to ace technical interviews at top tech companies.',
                      topics: ['Arrays', 'Linked Lists', 'Trees', 'Dynamic Programming'],
                      duration: '8 weeks',
                      level: 'Intermediate → Advanced',
                      icon: <Trophy size={20} />,
                      gradient: 'from-[var(--accent)]/20 to-transparent',
                      accentColor: 'var(--accent)',
                    },
                    {
                      title: 'Competitive Programming',
                      description: 'Master advanced algorithms and optimization for contest-level coding.',
                      topics: ['Graph Algorithms', 'Advanced DP', 'Number Theory', 'Backtracking'],
                      duration: '12 weeks',
                      level: 'Advanced',
                      icon: <Flame size={20} />,
                      gradient: 'from-[var(--accent-secondary)]/20 to-transparent',
                      accentColor: 'var(--accent-secondary)',
                    },
                  ].map((path, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.15 }}
                      className="group relative rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-400"
                    >
                      {/* Top accent gradient */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${path.gradient}`} />

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2.5 rounded-xl"
                              style={{ background: `${path.accentColor}15`, border: `1px solid ${path.accentColor}25` }}
                            >
                              <span style={{ color: path.accentColor }}>{path.icon}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold font-display">{path.title}</h3>
                              <p className="text-xs text-[var(--text-secondary)]">{path.level}</p>
                            </div>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-[var(--text-secondary)] flex items-center gap-1">
                            <Clock size={11} />
                            {path.duration}
                          </span>
                        </div>

                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                          {path.description}
                        </p>

                        {/* Topic pills */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {path.topics.map((t, i) => (
                            <span
                              key={i}
                              className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[var(--text-secondary)]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <motion.button
                          className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300"
                          style={{
                            background: `${path.accentColor}12`,
                            color: path.accentColor,
                            border: `1px solid ${path.accentColor}20`,
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Explore Path
                          <ChevronRight size={14} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ===== CTA BANNER ===== */}
          <section className="py-8 pb-16">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative rounded-2xl overflow-hidden border border-white/[0.06]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/[0.08] via-transparent to-[var(--accent-secondary)]/[0.06]" />

                <div className="relative p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/15">
                    <Star className="text-[var(--accent)]" size={28} />
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-bold font-display mb-1">
                      Ready to test your skills?
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Jump into the code editor and solve problems after studying each topic. Practice makes perfect!
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/code"
                      className="btn-primary whitespace-nowrap flex items-center gap-2"
                    >
                      <Code size={16} />
                      Start Coding
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default StudyPage;