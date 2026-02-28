import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import LogoIcon from './LogoIcon';
import GlowText from './GlowText';

const Footer = () => {
  return (
    <footer className="relative bg-[var(--secondary)] bg-opacity-80 backdrop-blur-md mt-auto py-12">
      {/* Gradient separator line at top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="flex items-center gap-3 mb-4 click-animate hover:scale-105 transition-transform">
              <LogoIcon size={32} variant="minimal" />
              <GlowText variant="footer" size="lg">
                CodoSphere
              </GlowText>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] text-center md:text-left max-w-md">
              Elevate your coding skills with practice, challenges, and competitions in our immersive learning environment.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-8">
            <motion.div 
              className="flex flex-col" 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4 text-base">Practice</h3>
              <Link to="/code" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-2">
                Coding Problems
              </Link>
              <Link to="/question-of-the-day" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-2">
                Daily Question
              </Link>
              <Link to="/ranked-match" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Ranked Matches
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4 text-base">Learn</h3>
              <Link to="/study" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-2">
                Study Materials
              </Link>
              <Link to="/leaderboard" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-2">
                Leaderboard
              </Link>
              <Link to="/stats" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Your Stats
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex flex-col col-span-2 md:col-span-1"
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4 text-base">Connect</h3>
              <Link to="/contact" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-2">
                Contact Us
              </Link>
              <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-2">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Privacy Policy
              </a>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex space-x-6"
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <a href="#" className="text-[var(--text-secondary)] hover:text-white transition-all duration-300 transform hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <Github size={22} />
            </a>
            <a href="#" className="text-[var(--text-secondary)] hover:text-[#1DA1F2] transition-all duration-300 transform hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(29,161,242,0.5)]">
              <Twitter size={22} />
            </a>
            <a href="#" className="text-[var(--text-secondary)] hover:text-[#0077B5] transition-all duration-300 transform hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(0,119,181,0.5)]">
              <Linkedin size={22} />
            </a>
            <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all duration-300 transform hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(244,91,105,0.5)]">
              <Mail size={22} />
            </a>
          </motion.div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} CodoSphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;