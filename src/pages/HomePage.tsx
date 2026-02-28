import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Star, Users, Award, Swords, BookOpen, ChevronDown } from 'lucide-react';
import LogoIcon from '../components/common/LogoIcon';
import GlowText from '../components/common/GlowText';
import RevealOnScroll from '../components/common/RevealOnScroll';
import PageTransition from '../components/common/PageTransition';

const HomePage = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <header className="bg-[var(--primary)] relative min-h-screen flex items-center">
          {/* Refined background with mesh-like gradient */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--accent)] filter blur-[160px] opacity-[0.06]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--accent-secondary)] filter blur-[140px] opacity-[0.05]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[var(--accent-tertiary)] filter blur-[120px] opacity-[0.03]" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-[#080510] to-[var(--primary)] opacity-50"></div>
          <div className="container-custom z-10 py-24">
            <nav className="flex justify-between items-center mb-16">
              <motion.div 
                className="flex items-center gap-3 click-animate hover:scale-105 transition-transform"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Keep enhanced logo with hero variant */}
                <LogoIcon size={40} variant="hero" />
                <div className="flex flex-col">
                  <GlowText variant="hero" size="lg">
                    CodoSphere
                  </GlowText>
                  <motion.span 
                    className="text-sm font-medium text-[var(--accent-secondary)]"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    Compete. Conquer. Repeat.
                  </motion.span>
                </div>
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Link to="/profile" className="btn-primary">
                  Get Started
                </Link>
              </motion.div>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
                  Elevate Your <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">Coding Skills</span>
                </h1>
                <p className="text-xl text-[var(--text-secondary)] mb-8">
                  Practice daily, compete in challenges, and track your progress to become a better programmer.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/profile" className="btn-hero text-center block">
                      Get Started
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button 
                      onClick={scrollToFeatures} 
                      className="btn-hero-secondary flex items-center justify-center gap-2 w-full"
                    >
                      Learn More 
                      <ChevronDown size={16} />
                    </button>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="hidden lg:block"
              >
                <div className="relative">
                  {/* Floating code demo with gentle hanging animation */}
                  <motion.div
                    className="card rounded-xl overflow-hidden shadow-2xl"
                    // Gentle floating animation - like hanging and swaying
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 1, 0, -1, 0],
                    }}
                    transition={{
                      y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      rotate: {
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                    whileHover={{ 
                      y: -12,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="bg-[#0d1117] p-3 flex items-center border-b border-white/5">
                      <div className="flex gap-1.5">
                        <motion.div 
                          className="w-3 h-3 bg-red-500 rounded-full"
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div 
                          className="w-3 h-3 bg-yellow-500 rounded-full"
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.div 
                          className="w-3 h-3 bg-green-500 rounded-full"
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        />
                      </div>
                    </div>
                    <div className="p-6 font-mono text-sm">
                      <div className="text-[#637777]">// Solve the Two Sum problem</div>
                      <div className="mt-2">
                        <span className="text-[#c792ea]">function</span>{" "}
                        <span className="text-[#82aaff]">twoSum</span>(
                        <span className="text-[#f78c6c]">nums</span>,{" "}
                        <span className="text-[#f78c6c]">target</span>) {"{"}
                      </div>
                      <div className="pl-4">
                        <span className="text-[#c792ea]">const</span>{" "}
                        <span className="text-[#ffcb6b]">map</span> ={" "}
                        <span className="text-[#89ddff]">new</span>{" "}
                        <span className="text-[#ffcb6b]">Map</span>();
                      </div>
                      <div className="pl-4">
                        <span className="text-[#c792ea]">for</span>{" "}
                        <span className="text-[#c792ea]">let</span>{" "}
                        <span className="text-[#ffcb6b]">i</span> ={" "}
                        <span className="text-[#f78c6c]">0</span>;{" "}
                        <span className="text-[#ffcb6b]">i</span>{" < "}
                        <span className="text-[#f78c6c]">nums</span>.length;{" "}
                        <span className="text-[#ffcb6b]">i</span>++{" "}
                        {"{"}
                      </div>
                      <div className="pl-8">
                        <span className="text-[#c792ea]">const</span>{" "}
                        <span className="text-[#ffcb6b]">complement</span> ={" "}
                        <span className="text-[#f78c6c]">target</span> -{" "}
                        <span className="text-[#f78c6c]">nums</span>[
                        <span className="text-[#ffcb6b]">i</span>];
                      </div>
                      <div className="pl-8 text-[#fff] relative">
                        <motion.span 
                          className="relative after:content-[''] after:absolute after:right-0 after:w-2 after:h-5 after:bg-[var(--accent)]"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Subtle ambient particles around the code */}
                  <motion.div
                    className="absolute -top-2 -left-2 w-2 h-2 bg-[var(--accent)] rounded-full opacity-50"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 0
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-3 -right-3 w-3 h-3 bg-[var(--accent-secondary)] rounded-full opacity-40"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 0.4, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: 1.5
                    }}
                  />
                  <motion.div
                    className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-60"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: 2
                    }}
                  />
                </div>
              </motion.div>
            </div>
            
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
              onClick={scrollToFeatures}
            >
              <span className="text-sm text-[var(--text-secondary)] mb-2">
                Scroll to learn more
              </span>
              <ChevronDown className="text-[var(--accent)]" />
            </motion.div>
          </div>
        </header>

        {/* Features Section */}
        <section ref={featuresRef} className="py-24 bg-[var(--secondary)]">
          <div className="container-custom">
            <div className="text-center mb-16">
              <RevealOnScroll>
                <h2 className="text-4xl font-display font-bold mb-4 tracking-tight">
                  Features That <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">Set Us Apart</span>
                </h2>
              </RevealOnScroll>
              <RevealOnScroll delay={0.15}>
                <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                  Our platform offers everything you need to improve your coding skills and prepare for technical interviews.
                </p>
              </RevealOnScroll>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Code size={40} className="text-[var(--accent)]" />,
                  title: "Daily Coding Challenges",
                  description: "Practice with new problems every day, sorted by difficulty level to match your skill."
                },
                {
                  icon: <Star size={40} className="text-[var(--accent)]" />,
                  title: "Question of the Day",
                  description: "Tackle a specially curated daily problem to expand your problem-solving toolkit."
                },
                {
                  icon: <Swords size={40} className="text-[var(--accent)]" />,
                  title: "1v1 Ranked Matches",
                  description: "Compete against other coders in real-time to solve problems under pressure."
                },
                {
                  icon: <BookOpen size={40} className="text-[var(--accent)]" />,
                  title: "Comprehensive Study Materials",
                  description: "Learn key algorithms and data structures with our detailed guides and examples."
                },
                {
                  icon: <Award size={40} className="text-[var(--accent)]" />,
                  title: "Achievements & Badges",
                  description: "Earn recognition for your progress and showcase your accomplishments."
                },
                {
                  icon: <Users size={40} className="text-[var(--accent)]" />,
                  title: "Global Leaderboard",
                  description: "See how you rank against other programmers locally and globally."
                }
              ].map((feature, index) => (
                <RevealOnScroll
                  key={index}
                  delay={index * 0.08}
                  direction={index < 3 ? 'up' : 'up'}
                >
                  <div className="card-interactive h-full">
                    <div className="mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                    <p className="text-[var(--text-secondary)]">{feature.description}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
            
            <RevealOnScroll delay={0.4} className="mt-16 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/profile" className="btn-hero inline-block">
                  Get Started Now
                </Link>
              </motion.div>
            </RevealOnScroll>
          </div>
        </section>
        
        {/* Contact Section */}
        <section className="py-24 bg-[var(--primary)]">
          <div className="container-custom">
            <div className="text-center mb-16">
              <RevealOnScroll>
                <h2 className="text-4xl font-display font-bold mb-4 tracking-tight">
                  Get In <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">Touch</span>
                </h2>
              </RevealOnScroll>
              <RevealOnScroll delay={0.15}>
                <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                  Have questions or feedback? We'd love to hear from you. Reach out to our team using any of the methods below.
                </p>
              </RevealOnScroll>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Email Us",
                  details: "support@codosphere.com",
                  description: "For general inquiries and support"
                },
                {
                  title: "Call Us",
                  details: "+65 84218885",
                  description: "Monday to Friday, 9AM-5PM EST"
                },
                {
                  title: "Visit Us",
                  details: "Hall of Residence 16, Nanyang Technological University, Singapore",
                  description: "Our headquarters location"
                }
              ].map((contact, index) => (
                <RevealOnScroll key={index} delay={index * 0.12}>
                  <div className="card-interactive text-center">
                    <h3 className="text-xl font-display font-semibold mb-2">{contact.title}</h3>
                    <p className="text-[var(--accent)] font-medium mb-2">{contact.details}</p>
                    <p className="text-[var(--text-secondary)] text-sm">{contact.description}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-[var(--secondary)] py-8 text-center">
          <div className="container-custom">
            <motion.div 
              className="flex items-center justify-center gap-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <LogoIcon size={24} variant="minimal" />
              <GlowText variant="footer" size="lg">
                CodoSphere
              </GlowText>
            </motion.div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              © {new Date().getFullYear()} CodoSphere. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default HomePage;