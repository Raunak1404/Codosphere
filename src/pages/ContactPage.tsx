import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Send, ChevronDown, Sparkles, Headphones, Globe, Zap, CheckCircle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import '../styles/study.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    { icon: <Mail size={20} />, label: 'Email Us', primary: 'support@codepractice.com', secondary: 'General inquiries', gradient: 'from-[var(--accent)] to-rose-500', glow: 'shadow-[var(--accent)]/20' },
    { icon: <Headphones size={20} />, label: 'Tech Support', primary: 'help@codepractice.com', secondary: 'Technical issues', gradient: 'from-[var(--accent-secondary)] to-blue-500', glow: 'shadow-[var(--accent-secondary)]/20' },
    { icon: <Phone size={20} />, label: 'Call Us', primary: '+1 (555) 123-4567', secondary: 'Mon-Fri, 9AM-5PM EST', gradient: 'from-emerald-400 to-green-500', glow: 'shadow-emerald-400/20' },
    { icon: <MapPin size={20} />, label: 'Visit Us', primary: '123 Coding Lane', secondary: 'Tech City, TC 10101', gradient: 'from-purple-400 to-violet-500', glow: 'shadow-purple-400/20' }
  ];

  const faqs = [
    { question: "How do I change my account details?", answer: "Navigate to your Profile page and click the edit button next to your display name. You can update your name, coder name, and avatar style from there." },
    { question: "Can I use multiple programming languages?", answer: "Yes! Our platform supports Java, Python, C, C++, and JavaScript. Select your preferred language from the dropdown in the code editor before submitting." },
    { question: "How are ranked matches scored?", answer: "Ranked matches are scored based on solution correctness, efficiency, and completion time. If both solutions pass all test cases, the faster coder wins. Points depend on problem difficulty and your current rank." },
    { question: "Is there a mobile app available?", answer: "We're currently developing mobile apps for iOS and Android. In the meantime, our website is fully responsive and optimized for mobile browsers." },
    { question: "How do I climb the leaderboard faster?", answer: "Solve more problems, maintain daily streaks, and win ranked matches consistently. Higher difficulty problems and ranked victories give you more points." }
  ];

  const socials = [
    { name: 'Twitter', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
    { name: 'GitHub', path: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' },
    { name: 'Discord', path: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z' },
    { name: 'YouTube', path: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z' }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow relative">
          {/* Background ambient */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[var(--accent)] filter blur-[200px] opacity-[0.04]" />
            <div className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent-secondary)] filter blur-[180px] opacity-[0.03]" />
            <div className="absolute top-[60%] left-[60%] w-[300px] h-[300px] rounded-full bg-purple-500 filter blur-[160px] opacity-[0.02]" />
            <div className="study-hex-grid opacity-[0.008]" />
          </div>

          <div className="container-custom relative z-10 py-10">
            {/* ═══ HEADER ═══ */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-purple-500/10 border border-[var(--accent)]/20">
                  <MessageSquare className="text-[var(--accent)]" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-display tracking-tight">
                    <span className="bg-gradient-to-r from-[var(--accent)] via-purple-400 to-[var(--accent-secondary)] bg-clip-text text-transparent">Contact Us</span>
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">We'd love to hear from you</p>
                </div>
              </div>
            </motion.div>

            {/* ═══ CONTACT METHODS GRID ═══ */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
              {contactMethods.map((method, index) => (
                <motion.div key={index} className={`topic-card p-5 group shadow-lg ${method.glow}`} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-3 shadow-lg ${method.glow} text-white group-hover:scale-110 transition-transform`}>
                    {method.icon}
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">{method.label}</h3>
                  <p className="text-sm font-semibold mb-0.5">{method.primary}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{method.secondary}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* ═══ CONTACT FORM ═══ */}
              <div className="lg:col-span-7">
                <motion.div className="topic-card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                  {/* Header */}
                  <div className="px-6 pt-6 pb-4 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-secondary)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
                        <Send className="text-[var(--accent)]" size={16} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold font-display">Send a Message</h2>
                        <p className="text-[11px] text-[var(--text-secondary)]">We'll get back to you within 24 hours</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Success banner */}
                    <AnimatePresence>
                      {submitted && (
                        <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.3 }} className="mb-5">
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
                            <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-emerald-400">Message sent!</p>
                              <p className="text-xs text-emerald-400/70">We'll respond to you shortly.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Your Name</label>
                          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your name"
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm focus:outline-none focus:border-[var(--accent)]/40 focus:shadow-[0_0_0_3px_rgba(244,91,105,0.06)] transition-all placeholder:text-[var(--text-secondary)]/40" />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Your Email</label>
                          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm focus:outline-none focus:border-[var(--accent)]/40 focus:shadow-[0_0_0_3px_rgba(244,91,105,0.06)] transition-all placeholder:text-[var(--text-secondary)]/40" />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Subject</label>
                        <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm focus:outline-none focus:border-[var(--accent)]/40 focus:shadow-[0_0_0_3px_rgba(244,91,105,0.06)] transition-all appearance-none cursor-pointer">
                          <option value="" className="bg-[var(--primary)]">Select a topic</option>
                          <option value="general" className="bg-[var(--primary)]">General Inquiry</option>
                          <option value="support" className="bg-[var(--primary)]">Technical Support</option>
                          <option value="feedback" className="bg-[var(--primary)]">Feedback</option>
                          <option value="bug" className="bg-[var(--primary)]">Report a Bug</option>
                          <option value="feature" className="bg-[var(--primary)]">Feature Request</option>
                          <option value="other" className="bg-[var(--primary)]">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Message</label>
                        <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Tell us what's on your mind..."
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm focus:outline-none focus:border-[var(--accent)]/40 focus:shadow-[0_0_0_3px_rgba(244,91,105,0.06)] transition-all resize-none placeholder:text-[var(--text-secondary)]/40"></textarea>
                      </div>
                      
                      <motion.button type="submit" className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Send size={16} />
                        Send Message
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              </div>

              {/* ═══ RIGHT COLUMN — FAQ + Social ═══ */}
              <div className="lg:col-span-5 space-y-6">
                {/* FAQ */}
                <motion.div className="topic-card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                  <div className="px-6 pt-5 pb-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                        <Zap size={14} className="text-amber-400" />
                      </div>
                      <h2 className="text-base font-bold font-display">Quick Answers</h2>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-1">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-white/[0.03] last:border-0">
                        <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex items-center justify-between w-full text-left py-3.5 px-2 group">
                          <span className={`text-sm font-medium pr-4 transition-colors ${openFaq === index ? 'text-[var(--accent)]' : 'text-[var(--text)] group-hover:text-[var(--accent)]'}`}>
                            {faq.question}
                          </span>
                          <ChevronDown size={16} className={`shrink-0 text-[var(--text-secondary)] transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {openFaq === index && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed px-2 pb-3.5">{faq.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Social / Community */}
                <motion.div className="topic-card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                  <div className="px-6 pt-5 pb-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 flex items-center justify-center">
                        <Globe size={14} className="text-[var(--accent-secondary)]" />
                      </div>
                      <h2 className="text-base font-bold font-display">Join the Community</h2>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">Connect with fellow coders, get tips, and stay updated with the latest challenges and events.</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {socials.map((social, i) => (
                        <a key={i} href="#" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[var(--accent)]/30 hover:bg-white/[0.05] transition-all group">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors shrink-0">
                            <path d={social.path}></path>
                          </svg>
                          <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-white transition-colors">{social.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Response time badge */}
                <motion.div className="topic-card p-5 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-green-500/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="text-emerald-400" size={20} />
                  </div>
                  <h3 className="text-sm font-bold font-display mb-1">Fast Response Time</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Average response within <span className="text-emerald-400 font-semibold">24 hours</span></p>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default ContactPage;