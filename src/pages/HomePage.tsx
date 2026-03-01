import React, { useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code, Star, Users, Award, Swords, BookOpen, ChevronDown,
  Sparkles, ArrowRight, Zap, Target, BarChart2, Mail, Phone, MapPin
} from 'lucide-react';
import LogoIcon from '../components/common/LogoIcon';
import GlowText from '../components/common/GlowText';
import RevealOnScroll from '../components/common/RevealOnScroll';
import PageTransition from '../components/common/PageTransition';
import '../styles/study.css';

const HomePage = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    navigate('/profile');
  };

  const features = useMemo(() => [
    {
      icon: <Code size={24} />,
      title: 'Daily Coding Challenges',
      description: 'Practice with new problems every day, sorted by difficulty level to match your skill.',
      color: 'var(--accent)',
      link: '/code',
    },
    {
      icon: <Star size={24} />,
      title: 'Question of the Day',
      description: 'Tackle a specially curated daily problem to expand your problem-solving toolkit.',
      color: 'var(--accent-tertiary)',
      link: '/daily',
    },
    {
      icon: <Swords size={24} />,
      title: '1v1 Ranked Matches',
      description: 'Compete against other coders in real-time to solve problems under pressure.',
      color: 'var(--accent-secondary)',
      link: '/ranked',
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Comprehensive Study Materials',
      description: 'Learn key algorithms and data structures with our detailed guides and examples.',
      color: 'var(--accent)',
      link: '/study',
    },
    {
      icon: <Award size={24} />,
      title: 'Achievements & Badges',
      description: 'Earn recognition for your progress and showcase your accomplishments.',
      color: 'var(--accent-tertiary)',
      link: '/stats',
    },
    {
      icon: <Users size={24} />,
      title: 'Global Leaderboard',
      description: 'See how you rank against other programmers locally and globally.',
      color: 'var(--accent-secondary)',
      link: '/leaderboard',
    },
  ], []);

  const stats = useMemo(() => [
    { value: '50+', label: 'Problems', icon: <Code size={16} /> },
    { value: '1v1', label: 'Ranked', icon: <Swords size={16} /> },
    { value: '8', label: 'Topics', icon: <BookOpen size={16} /> },
    { value: '16', label: 'Badges', icon: <Award size={16} /> },
  ], []);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        {/* ===== HERO SECTION ===== */}
        <header className="bg-[var(--primary)] relative min-h-screen flex items-center overflow-hidden">
          {/* Background mesh */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[15%] left-[20%] w-[600px] h-[600px] rounded-full bg-[var(--accent)] filter blur-[180px] opacity-[0.06]" />
            <div className="absolute bottom-[15%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent-secondary)] filter blur-[160px] opacity-[0.05]" />
            <div className="absolute top-[60%] left-[50%] w-[400px] h-[400px] rounded-full bg-[var(--accent-tertiary)] filter blur-[140px] opacity-[0.03]" />
            {/* Hex grid pattern */}
            <div className="study-hex-grid opacity-[0.015]" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-[#080510] via-transparent to-[var(--primary)] opacity-60" />

          <div className="container-custom z-10 py-24">
            {/* Nav */}
            <nav className="flex justify-between items-center mb-20">
              <motion.div
                className="flex items-center gap-3 hover:scale-105 transition-transform"
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <LogoIcon size={40} variant="hero" />
                <div className="flex flex-col">
                  <GlowText variant="hero" size="lg">CodoSphere</GlowText>
                  <motion.span
                    className="text-sm font-medium text-[var(--accent-secondary)]"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    Compete. Conquer. Repeat.
                  </motion.span>
                </div>
              </motion.div>
              <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <button onClick={handleGetStarted} className="btn-primary">Get Started</button>
              </motion.div>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left - Copy */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                {/* Subtitle badge */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-sm text-[var(--accent)] font-medium mb-6"
                >
                  <Sparkles size={14} />
                  The ultimate coding arena
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight leading-[1.1]">
                  Elevate Your{' '}
                  <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-secondary)] to-[var(--accent)] bg-clip-text text-transparent bg-[length:200%_auto] animate-[text-shimmer_4s_linear_infinite]">
                    Coding Skills
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 leading-relaxed max-w-lg">
                  Practice daily, compete in ranked challenges, and track your progress to become a more skilled programmer.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <button onClick={handleGetStarted} className="btn-hero text-center block flex items-center justify-center gap-2 w-full">
                      Start Your Journey
                      <ArrowRight size={18} />
                    </button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <button
                      onClick={scrollToFeatures}
                      className="btn-hero-secondary flex items-center justify-center gap-2 w-full"
                    >
                      Explore Features
                      <ChevronDown size={16} />
                    </button>
                  </motion.div>
                </div>

                {/* Inline stats */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex flex-wrap gap-4"
                >
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      <span className="text-[var(--accent)]">{s.icon}</span>
                      <div>
                        <p className="text-lg font-bold font-display">{s.value}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] -mt-0.5 uppercase tracking-wider">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right - Code demo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="hidden lg:block"
              >
                <div className="relative">
                  <motion.div
                    className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] shadow-2xl"
                    whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  >
                    {/* Editor header */}
                    <div className="bg-black/40 px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                      </div>
                      <span className="text-xs text-[var(--text-secondary)]">solution.js</span>
                      <div className="w-12" />
                    </div>
                    {/* Code */}
                    <div className="p-6 font-mono text-sm leading-relaxed">
                      <div className="text-[#637777]">// Solve the Two Sum problem</div>
                      <div className="mt-2">
                        <span className="text-[#c792ea]">function</span>{' '}
                        <span className="text-[#82aaff]">twoSum</span>(
                        <span className="text-[#f78c6c]">nums</span>,{' '}
                        <span className="text-[#f78c6c]">target</span>) {'{'}
                      </div>
                      <div className="pl-4">
                        <span className="text-[#c792ea]">const</span>{' '}
                        <span className="text-[#ffcb6b]">map</span> ={' '}
                        <span className="text-[#89ddff]">new</span>{' '}
                        <span className="text-[#ffcb6b]">Map</span>();
                      </div>
                      <div className="pl-4">
                        <span className="text-[#c792ea]">for</span> (
                        <span className="text-[#c792ea]">let</span>{' '}
                        <span className="text-[#ffcb6b]">i</span> ={' '}
                        <span className="text-[#f78c6c]">0</span>;{' '}
                        <span className="text-[#ffcb6b]">i</span> {'< '}
                        <span className="text-[#f78c6c]">nums</span>.length;{' '}
                        <span className="text-[#ffcb6b]">i</span>++) {'{'}
                      </div>
                      <div className="pl-8">
                        <span className="text-[#c792ea]">const</span>{' '}
                        <span className="text-[#ffcb6b]">complement</span> ={' '}
                        <span className="text-[#f78c6c]">target</span> -{' '}
                        <span className="text-[#f78c6c]">nums</span>[<span className="text-[#ffcb6b]">i</span>];
                      </div>
                      <div className="pl-8">
                        <span className="text-[#c792ea]">if</span> (<span className="text-[#ffcb6b]">map</span>.<span className="text-[#82aaff]">has</span>(<span className="text-[#ffcb6b]">complement</span>)) {'{'}
                      </div>
                      <div className="pl-12">
                        <span className="text-[#c792ea]">return</span> [<span className="text-[#ffcb6b]">map</span>.<span className="text-[#82aaff]">get</span>(<span className="text-[#ffcb6b]">complement</span>), <span className="text-[#ffcb6b]">i</span>];
                      </div>
                      <div className="pl-8">{'}'}</div>
                      <div className="pl-8">
                        <span className="text-[#ffcb6b]">map</span>.<span className="text-[#82aaff]">set</span>(<span className="text-[#f78c6c]">nums</span>[<span className="text-[#ffcb6b]">i</span>], <span className="text-[#ffcb6b]">i</span>);
                      </div>
                      <div className="pl-4">{'}'}</div>
                      <div>{'}'}</div>
                      <div className="mt-3 flex items-center gap-2">
                      <div className="inline-block w-2 h-5 bg-[var(--accent)] animate-pulse" />
                      </div>
                    </div>
                    {/* Status bar */}
                    <div className="px-4 py-2 bg-black/30 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Ready</span>
                        <span>JavaScript</span>
                      </div>
                      <span>UTF-8</span>
                    </div>
                  </motion.div>

                  {/* Ambient particles */}
                  <motion.div className="absolute -top-3 -left-3 w-2 h-2 bg-[var(--accent)] rounded-full opacity-30" />
                  <motion.div className="absolute -bottom-4 -right-4 w-3 h-3 bg-[var(--accent-secondary)] rounded-full opacity-20" />
                </div>
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer"
              onClick={scrollToFeatures}
            >
              <span className="text-xs text-[var(--text-secondary)] mb-2">Discover more</span>
              <ChevronDown size={18} className="text-[var(--accent)]" />
            </motion.div>
          </div>
        </header>

        {/* ===== FEATURES SECTION ===== */}
        <section ref={featuresRef} className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--secondary)] to-[var(--primary)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />

          <div className="container-custom relative z-10">
            <div className="text-center mb-16">
              <RevealOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/15 text-xs text-[var(--accent)] font-medium mb-4">
                  <Zap size={12} />
                  Platform Features
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={0.08}>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-tight">
                  Everything You Need to{' '}
                  <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                    Level Up
                  </span>
                </h2>
              </RevealOnScroll>
              <RevealOnScroll delay={0.12}>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                  A complete ecosystem to sharpen your coding skills, prepare for interviews, and compete with the best.
                </p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, index) => (
                <RevealOnScroll key={index} delay={index * 0.07}>
                  <Link to={feature.link} className="block h-full">
                    <motion.div
                      className="topic-card h-full p-6 flex flex-col group"
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(244,91,105,0.2)]"
                        style={{
                          background: `linear-gradient(135deg, ${feature.color}18, transparent)`,
                          border: `1px solid ${feature.color}25`,
                          color: feature.color,
                        }}
                      >
                        <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                          {feature.icon}
                        </span>
                      </div>
                      <h3 className="text-lg font-display font-bold mb-2 group-hover:text-[var(--accent)] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-grow">
                        {feature.description}
                      </p>
                      <motion.div
                        className="flex items-center gap-1.5 mt-4 text-sm font-medium text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        Explore
                        <ArrowRight size={14} />
                      </motion.div>
                    </motion.div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            {/* CTA */}
            <RevealOnScroll delay={0.35} className="mt-16">
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/[0.08] via-transparent to-[var(--accent-secondary)]/[0.06]" />
                <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/15">
                      <Target className="text-[var(--accent)]" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-display">Ready to begin?</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Create your profile and start solving problems today.</p>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button onClick={handleGetStarted} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                      <Sparkles size={16} />
                      Get Started Now
                    </button>
                  </motion.div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ===== CONTACT SECTION ===== */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--primary)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="container-custom relative z-10">
            <div className="text-center mb-14">
              <RevealOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/15 text-xs text-[var(--accent-secondary)] font-medium mb-4">
                  <Mail size={12} />
                  Contact
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={0.08}>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-tight">
                  Get In{' '}
                  <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">Touch</span>
                </h2>
              </RevealOnScroll>
              <RevealOnScroll delay={0.12}>
                <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                  Have questions or feedback? We'd love to hear from you.
                </p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: <Mail size={22} />,
                  title: 'Email Us',
                  details: 'support@codosphere.com',
                  sub: 'For general inquiries and support',
                  color: 'var(--accent)',
                },
                {
                  icon: <Phone size={22} />,
                  title: 'Call Us',
                  details: '+65 84218885',
                  sub: 'Monday to Friday, 9AM-5PM EST',
                  color: 'var(--accent-secondary)',
                },
                {
                  icon: <MapPin size={22} />,
                  title: 'Visit Us',
                  details: 'Hall of Residence 16, NTU, Singapore',
                  sub: 'Our headquarters location',
                  color: 'var(--accent-tertiary)',
                },
              ].map((contact, index) => (
                <RevealOnScroll key={index} delay={index * 0.1}>
                  <motion.div
                    className="topic-card p-6 text-center"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: `${contact.color}15`,
                        border: `1px solid ${contact.color}25`,
                        color: contact.color,
                      }}
                    >
                      {contact.icon}
                    </div>
                    <h3 className="text-lg font-display font-bold mb-2">{contact.title}</h3>
                    <p className="font-medium text-sm mb-1" style={{ color: contact.color }}>
                      {contact.details}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">{contact.sub}</p>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="relative py-10 border-t border-white/[0.04]">
          <div className="absolute inset-0 bg-[var(--secondary)]" />
          <div className="container-custom relative z-10">
            <div className="flex flex-col items-center">
              <motion.div
                className="flex items-center gap-2 mb-4"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <LogoIcon size={24} variant="minimal" />
                <GlowText variant="footer" size="lg">CodoSphere</GlowText>
              </motion.div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                © {new Date().getFullYear()} CodoSphere. All rights reserved.
              </p>
              <div className="flex gap-8">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default HomePage;