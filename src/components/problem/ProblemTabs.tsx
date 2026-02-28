import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, List, HelpCircle, Sparkles } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const defaultTabs: Tab[] = [
  { id: 'question', label: 'Description', icon: <FileText size={13} /> },
  { id: 'examples', label: 'Examples', icon: <List size={13} /> },
  { id: 'constraints', label: 'Constraints', icon: <HelpCircle size={13} /> },
];

interface ProblemTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  problem: {
    title: string;
    description: string;
    examples?: { input: string; output: string; explanation?: string }[];
    constraints?: string[];
  };
  tabs?: Tab[];
}

const ProblemTabs: React.FC<ProblemTabsProps> = ({
  activeTab,
  onTabChange,
  problem,
  tabs = defaultTabs,
}) => {
  return (
    <>
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-white/[0.06] mb-0 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-white bg-white/[0.04]'
                : 'text-[var(--text-secondary)] hover:text-white/80 hover:bg-white/[0.02]'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-[var(--accent)]' : ''}>{tab.icon}</span>
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]"
                layoutId="problem-tab-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {activeTab === 'question' && (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-[var(--text)] leading-relaxed whitespace-pre-line text-[0.9rem] problem-description">
                  {problem.description.split('\n\n').map((paragraph: string, i: number) => (
                    <motion.p
                      key={i}
                      className="mb-3.5 leading-7"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div>
                {problem.examples && problem.examples.length > 0 ? (
                  <div className="space-y-3">
                    {problem.examples.map((example, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.1] transition-colors duration-200"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles size={12} className="text-[var(--accent)]" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Example {idx + 1}</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">Input</span>
                          <div className="bg-black/40 p-3 rounded-lg mt-1.5 font-mono text-xs text-emerald-300 border border-emerald-500/10">
                            {example.input}
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="text-[10px] text-[var(--accent-secondary)] font-bold uppercase tracking-wider">Output</span>
                          <div className="bg-black/40 p-3 rounded-lg mt-1.5 font-mono text-xs text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/10">
                            {example.output}
                          </div>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="text-[10px] text-[var(--accent-tertiary)] font-bold uppercase tracking-wider">Explanation</span>
                            <div className="text-[var(--text-secondary)] mt-1.5 text-xs leading-relaxed bg-black/20 p-3 rounded-lg border border-[var(--accent-tertiary)]/10">
                              {example.explanation}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[var(--text-secondary)]">
                    <List size={28} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No examples available.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'constraints' && (
              <div>
                {problem.constraints && problem.constraints.length > 0 ? (
                  <motion.div
                    className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ul className="space-y-2.5">
                      {problem.constraints.map((constraint: string, idx: number) => (
                        <motion.li
                          key={idx}
                          className="flex items-start gap-2.5 text-[var(--text)] text-sm leading-relaxed"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                        >
                          <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                          <span className="text-xs">{constraint}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-[var(--text-secondary)]">
                    <HelpCircle size={28} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No constraints specified.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default ProblemTabs;
