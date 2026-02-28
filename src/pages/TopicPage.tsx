import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, BookOpen, Code, ExternalLink, ChevronRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import { getTopicById, StudyTopic, TopicSection } from '../data/studyTopics';
import { getProblemById } from '../data/codingProblems';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';

const TopicPage = () => {
  const { topic } = useParams<{ topic: string }>();
  const [studyTopic, setStudyTopic] = useState<StudyTopic | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  useEffect(() => {
    if (topic) {
      const topicData = getTopicById(topic);
      if (topicData) {
        setStudyTopic(topicData);
        // Reset active section when topic changes
        setActiveSection(0);
        setCompletedSections([]);
      }
    }
  }, [topic]);

  useEffect(() => {
    // Initialize Prism for syntax highlighting when content changes
    if (studyTopic) {
      Prism.highlightAll();
    }
  }, [studyTopic, activeSection]);

  // Mark current section as completed
  const markSectionCompleted = (index: number) => {
    if (!completedSections.includes(index)) {
      setCompletedSections([...completedSections, index]);
    }
  };

  // Navigate to next section
  const goToNextSection = () => {
    if (studyTopic && activeSection < studyTopic.sections.length - 1) {
      markSectionCompleted(activeSection);
      setActiveSection(activeSection + 1);
      // Scroll to top when changing sections
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous section
  const goToPreviousSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      // Scroll to top when changing sections
      window.scrollTo(0, 0);
    }
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!studyTopic) return 0;
    return Math.round((completedSections.length / studyTopic.sections.length) * 100);
  };

  if (!studyTopic) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl">Topic not found</p>
              <Link to="/study" className="mt-4 text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center justify-center">
                <ArrowLeft size={16} className="mr-2" />
                Back to Study Materials
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow py-12">
          <div className="container-custom">
            <div className="flex items-center mb-8">
              <Link 
                to="/study"
                className="mr-4 p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-3">
                  {studyTopic.title}
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    studyTopic.difficulty === 'Beginner' 
                      ? 'bg-green-500 bg-opacity-20 text-green-400' 
                      : studyTopic.difficulty === 'Intermediate'
                      ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                      : 'bg-red-500 bg-opacity-20 text-red-400'
                  }`}>
                    {studyTopic.difficulty}
                  </span>
                </h1>
                <p className="text-[var(--text-secondary)] mt-1">{studyTopic.description}</p>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left sidebar with progress tracking - Now uses flex column for a cleaner look */}
              <div className="lg:col-span-3">
                <div className="sticky top-24">
                  <div className="card-interactive mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <BookOpen size={18} className="text-[var(--accent)] mr-2" />
                      Learning Journey
                    </h3>
                    
                    {/* Progress indicator */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-[var(--text-secondary)]">Progress</span>
                        <span className="text-sm font-medium">{getCompletionPercentage()}%</span>
                      </div>
                      <div className="h-2 bg-[var(--primary)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]"
                          style={{ width: `${getCompletionPercentage()}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Learning journey timeline - Simplified and cleaner */}
                    <div className="mt-6 relative">
                      <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-secondary)] opacity-30"></div>
                      
                      {studyTopic.sections.map((section, index) => (
                        <div key={index} className="mb-4 relative">
                          <button
                            onClick={() => setActiveSection(index)}
                            className={`flex items-start relative pl-8 transition-colors w-full text-left ${
                              index === activeSection 
                                ? 'text-white' 
                                : completedSections.includes(index)
                                ? 'text-[var(--accent)]'
                                : 'text-[var(--text-secondary)] hover:text-white'
                            }`}
                          >
                            <div className={`absolute left-0 w-5 h-5 rounded-full flex items-center justify-center z-10 ${
                              index === activeSection 
                                ? 'bg-[var(--accent)] ring-4 ring-[var(--accent)] ring-opacity-30' 
                                : completedSections.includes(index)
                                ? 'bg-[var(--accent)] bg-opacity-80' 
                                : 'bg-[var(--primary)] border border-[var(--text-secondary)]'
                            }`}>
                              {completedSections.includes(index) && (
                                <CheckCircle size={12} className="text-white" />
                              )}
                              {!completedSections.includes(index) && index === activeSection && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className={`text-sm font-medium ${
                              index === activeSection ? 'font-semibold' : ''
                            }`}>
                              {section.title}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study details card */}
                  <div className="card-interactive">
                    <h3 className="text-lg font-semibold mb-4">Study Information</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-secondary)]">Estimated Time</span>
                        <span className="text-sm font-medium">{studyTopic.estimatedTime}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-secondary)]">Related Problems</span>
                        <span className="text-sm font-medium">{studyTopic.problems}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-secondary)]">Category</span>
                        <span className="text-sm font-medium">{studyTopic.difficulty}</span>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white border-opacity-10">
                        <Link
                          to="/code"
                          className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm flex items-center"
                        >
                          <Code size={14} className="mr-1" />
                          Practice related problems
                          <ChevronRight size={14} className="ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content area - Cleaned up with less animations and more focused styling */}
              <div className="lg:col-span-9">
                <div className="card-interactive">
                  {/* Content header */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold font-display mb-4 text-white">{studyTopic.sections[activeSection].title}</h2>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <span className="text-sm bg-black bg-opacity-30 px-3 py-1 rounded-full text-[var(--text-secondary)]">
                          Section {activeSection + 1} of {studyTopic.sections.length}
                        </span>
                        {completedSections.includes(activeSection) && (
                          <span className="text-sm bg-green-500 bg-opacity-20 px-3 py-1 rounded-full text-green-400 flex items-center">
                            <CheckCircle size={12} className="mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main content with cleaner typography */}
                  <div className="prose prose-invert max-w-none">
                    <div className="text-[var(--text)] whitespace-pre-line text-base leading-relaxed bg-black bg-opacity-30 p-6 rounded-lg border border-white/10">
                      {studyTopic.sections[activeSection].content}
                    </div>

                    {/* Code examples with modern styling */}
                    {studyTopic.sections[activeSection].examples && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 text-white">Examples</h3>
                        <div className="space-y-6">
                          {studyTopic.sections[activeSection].examples?.map((example, exIndex) => (
                            <div 
                              key={exIndex} 
                              className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10"
                            >
                              <div className="px-4 py-3 bg-black bg-opacity-40 border-b border-white/10 flex items-center justify-between">
                                <span className="font-medium text-sm text-white">{example.language}</span>
                                <div className="flex space-x-2">
                                  <button 
                                    className="text-[var(--text-secondary)] hover:text-white text-xs px-2 py-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                                    onClick={() => navigator.clipboard.writeText(example.code)}
                                  >
                                    Copy
                                  </button>
                                  <a 
                                    href="#" 
                                    className="text-[var(--text-secondary)] hover:text-white text-xs px-2 py-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors flex items-center"
                                  >
                                    Try it <ExternalLink size={12} className="ml-1" />
                                  </a>
                                </div>
                              </div>
                              <pre className="p-4 overflow-x-auto text-sm">
                                <code className={`language-${example.language.toLowerCase()}`}>
                                  {example.code}
                                </code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation controls */}
                    <div className="mt-10 flex justify-between">
                      <button
                        onClick={goToPreviousSection}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                          activeSection === 0 
                            ? 'text-[var(--text-secondary)] cursor-not-allowed' 
                            : 'text-white hover:bg-white hover:bg-opacity-10'
                        }`}
                        disabled={activeSection === 0}
                      >
                        <ArrowLeft size={16} className="mr-2" />
                        Previous
                      </button>

                      {activeSection < studyTopic.sections.length - 1 ? (
                        <button
                          onClick={goToNextSection}
                          className="btn-primary flex items-center"
                        >
                          {completedSections.includes(activeSection) ? 'Continue' : 'Mark as Completed'}
                          <ChevronRight size={16} className="ml-1" />
                        </button>
                      ) : (
                        <button
                          onClick={() => markSectionCompleted(activeSection)}
                          className="btn-success flex items-center"
                        >
                          Complete Topic
                          <CheckCircle size={16} className="ml-2" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Practice Problems Section - Redesigned for better visual hierarchy */}
                <div className="card-interactive mt-8">
                  <h3 className="text-xl font-bold font-display mb-6 flex items-center">
                    <Code size={18} className="text-[var(--accent)] mr-2" />
                    Practice Problems
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studyTopic.practiceProblems.map((problem, index) => {
                      const problemData = getProblemById(problem.id);
                      return (
                        <Link 
                          key={index}
                          to={`/code/${problem.id}`}
                          className="group block"
                        >
                          <div className="bg-black bg-opacity-40 backdrop-blur-sm p-4 rounded-lg border border-white/5 transition-all hover:border-[var(--accent)] hover:shadow-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-base mb-1 group-hover:text-[var(--accent)] transition-colors">
                                  {problem.title}
                                </h4>
                                <div className="flex gap-2 items-center">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    problem.difficulty === 'Easy' 
                                      ? 'bg-green-500 bg-opacity-20 text-green-400' 
                                      : problem.difficulty === 'Medium'
                                      ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                                      : 'bg-red-500 bg-opacity-20 text-red-400'
                                  }`}>
                                    {problem.difficulty}
                                  </span>
                                  {problemData && (
                                    <span className="text-xs text-[var(--text-secondary)]">
                                      {problemData.tags.slice(0, 2).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight 
                                size={18} 
                                className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors"
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 text-center">
                    <Link 
                      to="/code" 
                      className="text-[var(--accent)] hover:text-[var(--accent-hover)] inline-flex items-center text-sm"
                    >
                      Browse all coding problems
                      <ChevronRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
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