import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowRight, Code as CodeIcon, CheckCircle, Layers } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import { useProblems } from '../hooks/useProblems';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/firebase';
import '../styles/study.css';

const CodePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [solvedProblems, setSolvedProblems] = useState<number[]>([]);
  const problemsPerPage = 10;
  
  // Use the custom hook to get problems from Firebase or static data
  const { problems: allProblems, loading, error, refetch } = useProblems();

  // Fetch user's solved problems
  useEffect(() => {
    const fetchSolvedProblems = async () => {
      if (currentUser) {
        const { data } = await getUserProfile(currentUser.uid);
        if (data) {
          setSolvedProblems(data.solvedProblems || []);
        }
      }
    };

    fetchSolvedProblems();
  }, [currentUser]);

  // Filter problems based on search term and difficulty
  const filteredProblems = allProblems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = difficultyFilter.length === 0 || difficultyFilter.includes(problem.difficulty);
    return matchesSearch && matchesDifficulty;
  });

  // Calculate pagination
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  // Reset to page 1 if filters change or if current page is invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredProblems, currentPage, totalPages]);

  const toggleDifficulty = (difficulty: string) => {
    if (difficultyFilter.includes(difficulty)) {
      setDifficultyFilter(difficultyFilter.filter(d => d !== difficulty));
    } else {
      setDifficultyFilter([...difficultyFilter, difficulty]);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleProblemClick = (id: number) => {
    navigate(`/code/${id}`);
  };

  // Get difficulty styles
  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'Medium': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
      case 'Hard': return 'bg-rose-400/10 text-rose-400 border-rose-400/20';
      default: return '';
    }
  };

  const getDifficultyDot = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-400';
      case 'Medium': return 'bg-amber-400';
      case 'Hard': return 'bg-rose-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow relative">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[15%] right-[20%] w-[450px] h-[450px] rounded-full bg-[var(--accent)] filter blur-[180px] opacity-[0.03]" />
            <div className="absolute bottom-[25%] left-[15%] w-[350px] h-[350px] rounded-full bg-[var(--accent-secondary)] filter blur-[150px] opacity-[0.02]" />
            <div className="study-hex-grid opacity-[0.008]" />
          </div>

          <div className="container-custom relative z-10 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20">
                  <CodeIcon className="text-[var(--accent-secondary)]" size={22} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-display tracking-tight">
                    Coding <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">Challenges</span>
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">Practice, solve, and level up your skills</p>
                </div>
              </div>
            </motion.div>
            
            {/* Search & Filters */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 mb-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                <input
                  type="text"
                  placeholder="Search problems by name or tag..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2.5 pl-10 pr-4 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-[var(--accent)]/40 text-sm transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[var(--text-secondary)]" />
                {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => toggleDifficulty(difficulty)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      difficultyFilter.includes(difficulty)
                        ? getDifficultyBg(difficulty)
                        : 'text-[var(--text-secondary)] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Stats Bar */}
            <motion.div 
              className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 mb-5 flex flex-wrap justify-between items-center gap-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 text-xs">
                <Layers size={14} className="text-[var(--accent)]" />
                <span className="text-[var(--text-secondary)]">
                  Total: <span className="text-[var(--text)] font-semibold">{filteredProblems.length}</span>
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                {[
                  { label: 'Easy', color: 'bg-emerald-400', count: filteredProblems.filter(p => p.difficulty === 'Easy').length },
                  { label: 'Medium', color: 'bg-amber-400', count: filteredProblems.filter(p => p.difficulty === 'Medium').length },
                  { label: 'Hard', color: 'bg-rose-400', count: filteredProblems.filter(p => p.difficulty === 'Hard').length }
                ].map(d => (
                  <div key={d.label} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${d.color}`} />
                    <span>{d.label}: {d.count}</span>
                  </div>
                ))}
              </div>
              
              {totalPages > 0 && (
                <div className="text-xs text-[var(--text-secondary)]">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </motion.div>
            
            {/* Problems List */}
            <motion.div 
              className="topic-card overflow-hidden mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative w-10 h-10 mb-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white/[0.06]" />
                    <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin" />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Loading problems...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 px-6">
                  <p className="text-sm text-rose-400 mb-3">Error loading problems: {error}</p>
                  <button 
                    onClick={() => refetch()}
                    className="btn-primary text-sm py-2 px-5"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Title</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Difficulty</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProblems.length > 0 ? (
                        currentProblems.map((problem, index) => (
                          <motion.tr 
                            key={problem.id} 
                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                            onClick={() => handleProblemClick(problem.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.02 }}
                          >
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {solvedProblems.includes(problem.id) ? (
                                <CheckCircle size={15} className="text-emerald-400" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-white/[0.12]" />
                              )}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-1.5">
                                {problem.title}
                                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]" />
                              </div>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDifficultyBg(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-wrap gap-1">
                                {problem.tags.map((tag, tagIndex) => (
                                  <span 
                                    key={tagIndex} 
                                    className="bg-white/[0.03] border border-white/[0.04] text-[10px] px-2 py-0.5 rounded-md text-[var(--text-secondary)]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-5 py-12 text-center text-sm text-[var(--text-secondary)]">
                            No problems found matching your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {filteredProblems.length > 0 && (
                <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-3">
                  <div className="text-xs text-[var(--text-secondary)]">
                    Showing <span className="font-medium text-[var(--text)]">{indexOfFirstProblem + 1}</span> to{' '}
                    <span className="font-medium text-[var(--text)]">
                      {Math.min(indexOfLastProblem, filteredProblems.length)}
                    </span>{' '}
                    of <span className="font-medium text-[var(--text)]">{filteredProblems.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-1.5 rounded-lg transition-colors ${
                        currentPage === 1
                          ? 'text-white/20 cursor-not-allowed'
                          : 'text-[var(--text-secondary)] hover:bg-white/[0.04]'
                      }`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20'
                              : 'text-[var(--text-secondary)] hover:bg-white/[0.04]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-1.5 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? 'text-white/20 cursor-not-allowed'
                          : 'text-[var(--text-secondary)] hover:bg-white/[0.04]'
                      }`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default CodePage;