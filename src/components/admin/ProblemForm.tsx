import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Save, FileText, Code, ChevronDown, ChevronRight,
  Eye, PenLine, Sparkles, List, HelpCircle, FlaskConical,
  Info,
} from 'lucide-react';

const PARAM_TYPES = ['int', 'float', 'string', 'boolean', 'int[]', 'float[]', 'string[]', 'int[][]'] as const;
const RETURN_TYPES = ['int', 'float', 'string', 'boolean', 'int[]', 'float[]', 'string[]', 'int[][]', 'void'] as const;
const LANGUAGES = ['javascript', 'python', 'java', 'c', 'cpp'] as const;

interface AdminProblem {
  id?: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  tags: string[];
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
  functionMeta?: {
    name: string;
    params: { name: string; type: string }[];
    returnType: string;
    className?: string;
  };
  starterCode?: { [language: string]: string };
  contentFileUrl?: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

interface ProblemFormProps {
  visible: boolean;
  editing: boolean;
  formData: Partial<AdminProblem>;
  contentFile: File | null;
  saving: boolean;
  onFormDataChange: (data: Partial<AdminProblem>) => void;
  onContentFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/* ── Tiny section header that mirrors display tab labels ── */
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  tab?: string;
  accent?: string;
}> = ({ icon, title, tab, accent = 'var(--accent)' }) => (
  <div className="flex items-center gap-2 mb-3">
    <div
      className="flex items-center justify-center w-7 h-7 rounded-lg"
      style={{ backgroundColor: `color-mix(in srgb, ${accent} 15%, transparent)` }}
    >
      <span style={{ color: accent }}>{icon}</span>
    </div>
    <h3 className="text-sm font-bold tracking-tight text-white">{title}</h3>
    {tab && (
      <span className="ml-auto text-[10px] font-medium text-[var(--text-secondary)] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
        → Displays in "{tab}" tab
      </span>
    )}
  </div>
);

/* ── Live preview of the Description tab (mirrors ProblemTabs rendering) ── */
const DescriptionPreview: React.FC<{ text: string }> = ({ text }) => (
  <div className="prose prose-invert prose-sm max-w-none">
    <div className="text-[var(--text)] leading-relaxed whitespace-pre-line text-[0.9rem] problem-description">
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i} className="mb-3.5 leading-7">{paragraph}</p>
      ))}
    </div>
  </div>
);

/* ── Live preview of one example (mirrors ProblemTabs rendering) ── */
const ExamplePreview: React.FC<{ example: { input: string; output: string; explanation?: string }; idx: number }> = ({ example, idx }) => (
  <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
    <div className="flex items-center gap-2 mb-3">
      <Sparkles size={12} className="text-[var(--accent)]" />
      <span className="text-xs font-bold text-white uppercase tracking-wider">Example {idx + 1}</span>
    </div>
    <div className="mb-3">
      <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">Input</span>
      <div className="bg-black/40 p-3 rounded-lg mt-1.5 font-mono text-xs text-emerald-300 border border-emerald-500/10">
        {example.input || '—'}
      </div>
    </div>
    <div className="mb-3">
      <span className="text-[10px] text-[var(--accent-secondary)] font-bold uppercase tracking-wider">Output</span>
      <div className="bg-black/40 p-3 rounded-lg mt-1.5 font-mono text-xs text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/10">
        {example.output || '—'}
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
  </div>
);

/* ── Live preview of constraints (mirrors ProblemTabs rendering) ── */
const ConstraintsPreview: React.FC<{ constraints: string[] }> = ({ constraints }) => {
  const filled = constraints.filter(c => c.trim());
  if (filled.length === 0) return <p className="text-xs text-[var(--text-secondary)] italic">No constraints added yet.</p>;
  return (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
      <ul className="space-y-2.5">
        {filled.map((constraint, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-[var(--text)] text-sm leading-relaxed">
            <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
            <span className="text-xs">{constraint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProblemForm: React.FC<ProblemFormProps> = ({
  visible,
  editing,
  formData,
  contentFile,
  saving,
  onFormDataChange,
  onContentFileChange,
  onSubmit,
  onClose,
}) => {
  // Dynamic field helpers
  const addExample = () =>
    onFormDataChange({ ...formData, examples: [...(formData.examples || []), { input: '', output: '', explanation: '' }] });
  const removeExample = (i: number) =>
    onFormDataChange({ ...formData, examples: (formData.examples || []).filter((_, idx) => idx !== i) });

  const addConstraint = () =>
    onFormDataChange({ ...formData, constraints: [...(formData.constraints || []), ''] });
  const removeConstraint = (i: number) =>
    onFormDataChange({ ...formData, constraints: (formData.constraints || []).filter((_, idx) => idx !== i) });

  const addTag = () =>
    onFormDataChange({ ...formData, tags: [...(formData.tags || []), ''] });
  const removeTag = (i: number) =>
    onFormDataChange({ ...formData, tags: (formData.tags || []).filter((_, idx) => idx !== i) });

  const addTestCase = () =>
    onFormDataChange({ ...formData, testCases: [...(formData.testCases || []), { input: '', expectedOutput: '', isHidden: false }] });
  const removeTestCase = (i: number) =>
    onFormDataChange({ ...formData, testCases: (formData.testCases || []).filter((_, idx) => idx !== i) });

  // --- Function Signature helpers ---
  const [showFunctionMeta, setShowFunctionMeta] = useState(!!formData.functionMeta);
  const [showStarterCode, setShowStarterCode] = useState(!!formData.starterCode);

  // --- Preview mode ---
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<'question' | 'examples' | 'constraints'>('question');

  const initFunctionMeta = () => {
    if (!formData.functionMeta) {
      onFormDataChange({
        ...formData,
        functionMeta: { name: '', params: [{ name: '', type: 'int' }], returnType: 'int' },
      });
    }
    setShowFunctionMeta(true);
  };

  const updateFunctionMeta = (patch: Partial<NonNullable<AdminProblem['functionMeta']>>) => {
    onFormDataChange({
      ...formData,
      functionMeta: { ...formData.functionMeta!, ...patch },
    });
  };

  const addParam = () => {
    const params = [...(formData.functionMeta?.params || []), { name: '', type: 'int' }];
    updateFunctionMeta({ params });
  };
  const removeParam = (i: number) => {
    const params = (formData.functionMeta?.params || []).filter((_, idx) => idx !== i);
    updateFunctionMeta({ params });
  };

  const updateStarterCode = (lang: string, code: string) => {
    onFormDataChange({
      ...formData,
      starterCode: { ...(formData.starterCode || {}), [lang]: code },
    });
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[var(--secondary)] rounded-xl w-full max-h-[95vh] flex flex-col overflow-hidden"
            style={{ maxWidth: showPreview ? '90rem' : '56rem' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* ── Header ── */}
            <div className="p-5 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--accent)]/10">
                    <PenLine size={18} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      {editing ? 'Edit Problem' : 'Create New Problem'}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Fields are grouped by their display tab on the code editor page
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                      showPreview
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30'
                        : 'bg-white/[0.03] text-[var(--text-secondary)] border-white/[0.06] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Eye size={14} />
                    {showPreview ? 'Hide Preview' : 'Live Preview'}
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Body: Form + optional Preview side-by-side ── */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* ── LEFT: Form ── */}
              <form
                onSubmit={onSubmit}
                className={`flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar ${showPreview ? 'border-r border-white/[0.06]' : ''}`}
                style={{ minWidth: 0 }}
              >
                {/* ═══════════════════════════════════════════
                    SECTION 1: Basic Info (Title bar on editor)
                    ═══════════════════════════════════════════ */}
                <div className="space-y-4 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <SectionHeader
                    icon={<Info size={14} />}
                    title="Basic Info"
                    tab="Title bar"
                    accent="var(--accent)"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ''}
                        onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                        placeholder="e.g. Two Sum"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Difficulty *</label>
                      <select
                        required
                        value={formData.difficulty || 'Easy'}
                        onChange={(e) => onFormDataChange({ ...formData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                        className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-[var(--text-secondary)]">Tags *</label>
                      <button type="button" onClick={addTag} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs">
                        + Add Tag
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map((tag, index) => (
                        <div key={index} className="flex items-center gap-1 bg-[var(--primary)] rounded-lg border border-gray-700">
                          <input
                            type="text"
                            required
                            value={tag}
                            onChange={(e) => {
                              const newTags = [...(formData.tags || [])];
                              newTags[index] = e.target.value;
                              onFormDataChange({ ...formData, tags: newTags });
                            }}
                            className="px-2.5 py-1.5 bg-transparent focus:outline-none text-xs w-28"
                            placeholder="e.g. Array"
                          />
                          {formData.tags!.length > 1 && (
                            <button type="button" onClick={() => removeTag(index)} className="pr-2 text-red-400/60 hover:text-red-300">
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════
                    SECTION 2: Description → "Description" tab
                    ═══════════════════════════════════════════ */}
                <div className="space-y-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <SectionHeader
                    icon={<FileText size={14} />}
                    title="Description"
                    tab="Description"
                    accent="var(--accent)"
                  />
                  <div className="bg-[var(--primary)]/50 p-2.5 rounded-lg border border-white/[0.04] mb-1">
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed flex items-start gap-1.5">
                      <Info size={11} className="flex-shrink-0 mt-0.5 text-[var(--accent)]" />
                      <span>
                        <strong className="text-white/70">Formatting tip:</strong> Separate paragraphs with a blank line (double Enter).
                        Each blank-line-separated block becomes its own paragraph on the display page. Single line breaks are preserved within a paragraph.
                      </span>
                    </p>
                  </div>
                  <textarea
                    required
                    rows={8}
                    value={formData.description || ''}
                    onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm leading-relaxed"
                    placeholder={"Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order."}
                  />
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                    <span className="font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">{(formData.description || '').split('\n\n').filter(Boolean).length}</span>
                    <span>paragraph(s) will render on the display</span>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════
                    SECTION 3: Examples → "Examples" tab
                    ═══════════════════════════════════════════ */}
                <div className="space-y-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="flex justify-between items-start">
                    <SectionHeader
                      icon={<Sparkles size={14} />}
                      title="Examples"
                      tab="Examples"
                      accent="var(--accent-secondary)"
                    />
                    <button type="button" onClick={addExample} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs font-medium mt-1">
                      + Add Example
                    </button>
                  </div>
                  <div className="bg-[var(--primary)]/50 p-2.5 rounded-lg border border-white/[0.04] mb-1">
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed flex items-start gap-1.5">
                      <Info size={11} className="flex-shrink-0 mt-0.5 text-[var(--accent-secondary)]" />
                      <span>
                        <strong className="text-white/70">Display format:</strong> Each example renders as a styled card with Input (green mono), Output (purple mono), and optional Explanation blocks — exactly matching the format shown in the "Examples" tab.
                        Use the format <code className="text-[var(--accent)] bg-white/[0.04] px-1 rounded">nums = [2,7,11,15], target = 9</code> for inputs.
                      </span>
                    </p>
                  </div>
                  {formData.examples?.map((example, index) => (
                    <div key={index} className="bg-[var(--primary)] p-4 rounded-xl border border-white/[0.06]">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles size={12} className="text-[var(--accent)]" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Example {index + 1}</span>
                        </div>
                        {formData.examples!.length > 1 && (
                          <button type="button" onClick={() => removeExample(index)} className="p-1 text-red-400/60 hover:text-red-300 rounded">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider mb-1">Input</label>
                          <textarea
                            required
                            rows={2}
                            value={example.input}
                            onChange={(e) => {
                              const newExamples = [...(formData.examples || [])];
                              newExamples[index] = { ...example, input: e.target.value };
                              onFormDataChange({ ...formData, examples: newExamples });
                            }}
                            className="w-full px-3 py-2 bg-black/30 rounded-lg border border-emerald-500/10 focus:outline-none focus:border-emerald-500/30 text-xs font-mono text-emerald-300"
                            placeholder='nums = [2,7,11,15], target = 9'
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[var(--accent-secondary)] font-bold uppercase tracking-wider mb-1">Output</label>
                          <textarea
                            required
                            rows={2}
                            value={example.output}
                            onChange={(e) => {
                              const newExamples = [...(formData.examples || [])];
                              newExamples[index] = { ...example, output: e.target.value };
                              onFormDataChange({ ...formData, examples: newExamples });
                            }}
                            className="w-full px-3 py-2 bg-black/30 rounded-lg border border-[var(--accent-secondary)]/10 focus:outline-none focus:border-[var(--accent-secondary)]/30 text-xs font-mono text-[var(--accent-secondary)]"
                            placeholder='[0,1]'
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-[var(--accent-tertiary)] font-bold uppercase tracking-wider mb-1">Explanation <span className="normal-case font-normal text-[var(--text-secondary)]">(Optional)</span></label>
                        <textarea
                          rows={2}
                          value={example.explanation || ''}
                          onChange={(e) => {
                            const newExamples = [...(formData.examples || [])];
                            newExamples[index] = { ...example, explanation: e.target.value };
                            onFormDataChange({ ...formData, examples: newExamples });
                          }}
                          className="w-full px-3 py-2 bg-black/20 rounded-lg border border-[var(--accent-tertiary)]/10 focus:outline-none focus:border-[var(--accent-tertiary)]/30 text-xs text-[var(--text-secondary)]"
                          placeholder='Because nums[0] + nums[1] == 9, we return [0, 1].'
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ═══════════════════════════════════════════
                    SECTION 4: Constraints → "Constraints" tab
                    ═══════════════════════════════════════════ */}
                <div className="space-y-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="flex justify-between items-start">
                    <SectionHeader
                      icon={<HelpCircle size={14} />}
                      title="Constraints"
                      tab="Constraints"
                      accent="var(--accent-tertiary)"
                    />
                    <button type="button" onClick={addConstraint} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs font-medium mt-1">
                      + Add Constraint
                    </button>
                  </div>
                  <div className="bg-[var(--primary)]/50 p-2.5 rounded-lg border border-white/[0.04] mb-1">
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed flex items-start gap-1.5">
                      <Info size={11} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-tertiary)' }} />
                      <span>
                        <strong className="text-white/70">Display format:</strong> Each constraint appears as a bullet point (•) in the "Constraints" tab.
                        Use notation like <code className="text-[var(--accent)] bg-white/[0.04] px-1 rounded">2 &lt;= nums.length &lt;= 10^4</code>.
                      </span>
                    </p>
                  </div>
                  {formData.constraints?.map((constraint, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                      <input
                        type="text"
                        value={constraint}
                        onChange={(e) => {
                          const newConstraints = [...(formData.constraints || [])];
                          newConstraints[index] = e.target.value;
                          onFormDataChange({ ...formData, constraints: newConstraints });
                        }}
                        className="flex-1 px-3 py-1.5 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-xs"
                        placeholder={`e.g. 2 <= nums.length <= 10^4`}
                      />
                      {formData.constraints!.length > 1 && (
                        <button type="button" onClick={() => removeConstraint(index)} className="p-1 text-red-400/60 hover:text-red-300">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* ═══════════════════════════════════════════
                    SECTION 5: Test Cases (for judge evaluation)
                    ═══════════════════════════════════════════ */}
                <div className="space-y-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="flex justify-between items-start">
                    <SectionHeader
                      icon={<FlaskConical size={14} />}
                      title="Test Cases"
                      tab="Submission results"
                      accent="#f59e0b"
                    />
                    <button type="button" onClick={addTestCase} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs font-medium mt-1">
                      + Add Test Case
                    </button>
                  </div>
                  <div className="bg-[var(--primary)]/50 p-2.5 rounded-lg border border-white/[0.04] mb-1">
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed flex items-start gap-1.5">
                      <Info size={11} className="flex-shrink-0 mt-0.5 text-amber-400" />
                      <span>
                        <strong className="text-white/70">How it works:</strong> Test cases are used to evaluate the user's code when they submit.
                        "Hidden" test cases won't show the input/expected output to the user.
                        Raw input values should be comma-separated, with newlines separating different parameters (e.g. <code className="text-[var(--accent)] bg-white/[0.04] px-1 rounded">2,7,11,15\n9</code>).
                      </span>
                    </p>
                  </div>
                  {formData.testCases?.map((testCase, index) => (
                    <div key={index} className="bg-[var(--primary)] p-4 rounded-xl border border-white/[0.06]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <FlaskConical size={12} className="text-amber-400" />
                          Test Case {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center text-[10px] text-[var(--text-secondary)] cursor-pointer select-none gap-1.5 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/[0.06]">
                            <input
                              type="checkbox"
                              checked={testCase.isHidden}
                              onChange={(e) => {
                                const newTestCases = [...(formData.testCases || [])];
                                newTestCases[index] = { ...testCase, isHidden: e.target.checked };
                                onFormDataChange({ ...formData, testCases: newTestCases });
                              }}
                              className="accent-[var(--accent)]"
                            />
                            Hidden
                          </label>
                          {formData.testCases!.length > 1 && (
                            <button type="button" onClick={() => removeTestCase(index)} className="p-1 text-red-400/60 hover:text-red-300">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-[var(--text-secondary)] mb-1 font-medium">Input (raw)</label>
                          <textarea
                            rows={2}
                            value={testCase.input}
                            onChange={(e) => {
                              const newTestCases = [...(formData.testCases || [])];
                              newTestCases[index] = { ...testCase, input: e.target.value };
                              onFormDataChange({ ...formData, testCases: newTestCases });
                            }}
                            className="w-full px-3 py-2 bg-black/30 rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-xs font-mono"
                            placeholder="2,7,11,15&#10;9"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[var(--text-secondary)] mb-1 font-medium">Expected Output</label>
                          <textarea
                            rows={2}
                            value={testCase.expectedOutput}
                            onChange={(e) => {
                              const newTestCases = [...(formData.testCases || [])];
                              newTestCases[index] = { ...testCase, expectedOutput: e.target.value };
                              onFormDataChange({ ...formData, testCases: newTestCases });
                            }}
                            className="w-full px-3 py-2 bg-black/30 rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-xs font-mono"
                            placeholder="0,1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ═══════════════════════════════════════════
                    SECTION 6: Content File Upload
                    ═══════════════════════════════════════════ */}
                <div className="space-y-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <SectionHeader
                    icon={<Upload size={14} />}
                    title="Content File"
                    accent="#6b7280"
                  />
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept=".txt,.md,.pdf,.html"
                      onChange={(e) => onContentFileChange(e.target.files?.[0] || null)}
                      className="hidden"
                      id="content-file"
                    />
                    <label
                      htmlFor="content-file"
                      className="flex items-center px-4 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 hover:border-[var(--accent)] cursor-pointer transition-colors text-xs"
                    >
                      <Upload size={14} className="mr-2" />
                      Choose File
                    </label>
                    {contentFile && (
                      <span className="text-xs text-[var(--text-secondary)]">{contentFile.name}</span>
                    )}
                    {formData.contentFileUrl && !contentFile && (
                      <a
                        href={formData.contentFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs flex items-center"
                      >
                        <FileText size={14} className="mr-1" />
                        Current File
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    Upload additional content as .txt, .md, .pdf, or .html (max 10MB). Optional.
                  </p>
                </div>

                {/* ═══════════════════════════════════════════
                    SECTION 7: Function Signature (collapsible)
                    ═══════════════════════════════════════════ */}
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { if (!showFunctionMeta) initFunctionMeta(); else setShowFunctionMeta(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-white/[0.03] transition-colors"
                  >
                    {showFunctionMeta ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Code size={16} className="text-[var(--accent)]" />
                    Function Signature
                    <span className="text-[10px] text-[var(--text-secondary)] ml-auto">Enables auto-generated wrappers &amp; starter code</span>
                  </button>

                  {showFunctionMeta && formData.functionMeta && (
                    <div className="p-4 border-t border-white/[0.06] space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">Function Name *</label>
                          <input
                            type="text"
                            value={formData.functionMeta.name}
                            onChange={(e) => updateFunctionMeta({ name: e.target.value })}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm font-mono"
                            placeholder="e.g. twoSum"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">Return Type *</label>
                          <select
                            value={formData.functionMeta.returnType}
                            onChange={(e) => updateFunctionMeta({ returnType: e.target.value })}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                          >
                            {RETURN_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">Class Name</label>
                          <input
                            type="text"
                            value={formData.functionMeta.className || ''}
                            onChange={(e) => updateFunctionMeta({ className: e.target.value || undefined })}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm font-mono"
                            placeholder="Solution (default)"
                          />
                        </div>
                      </div>

                      {/* Parameters */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs text-[var(--text-secondary)]">Parameters</label>
                          <button type="button" onClick={addParam} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs">
                            + Add Parameter
                          </button>
                        </div>
                        {formData.functionMeta.params.map((param, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={param.name}
                              onChange={(e) => {
                                const params = [...formData.functionMeta!.params];
                                params[idx] = { ...param, name: e.target.value };
                                updateFunctionMeta({ params });
                              }}
                              className="flex-1 px-3 py-1.5 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm font-mono"
                              placeholder="param name"
                            />
                            <select
                              value={param.type}
                              onChange={(e) => {
                                const params = [...formData.functionMeta!.params];
                                params[idx] = { ...param, type: e.target.value };
                                updateFunctionMeta({ params });
                              }}
                              className="px-3 py-1.5 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                            >
                              {PARAM_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            {formData.functionMeta!.params.length > 1 && (
                              <button type="button" onClick={() => removeParam(idx)} className="p-1.5 text-red-400 hover:text-red-300">
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] bg-[var(--primary)] p-3 rounded-lg border border-gray-700">
                        The platform will auto-generate I/O wrappers and starter code for JavaScript, Python, Java, C, and C++ from this signature. You can override any language below.
                      </p>

                      {/* Clear function meta */}
                      <button
                        type="button"
                        onClick={() => {
                          onFormDataChange({ ...formData, functionMeta: undefined });
                          setShowFunctionMeta(false);
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove function signature
                      </button>
                    </div>
                  )}
                </div>

                {/* ═══════════════════════════════════════════
                    SECTION 8: Custom Starter Code (collapsible)
                    ═══════════════════════════════════════════ */}
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowStarterCode(!showStarterCode)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-white/[0.03] transition-colors"
                  >
                    {showStarterCode ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <FileText size={16} className="text-[var(--accent-secondary)]" />
                    Custom Starter Code
                    <span className="text-[10px] text-[var(--text-secondary)] ml-auto">Override auto-generated templates</span>
                  </button>

                  {showStarterCode && (
                    <div className="p-4 border-t border-white/[0.06] space-y-3">
                      <p className="text-xs text-[var(--text-secondary)]">
                        Leave blank to auto-generate from function signature. Only fill in languages you want to customize.
                      </p>
                      {LANGUAGES.map((lang) => (
                        <div key={lang}>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1 capitalize">{lang === 'cpp' ? 'C++' : lang}</label>
                          <textarea
                            rows={4}
                            value={formData.starterCode?.[lang] || ''}
                            onChange={(e) => updateStarterCode(lang, e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-xs font-mono"
                            placeholder={`Starter code for ${lang === 'cpp' ? 'C++' : lang} (optional)`}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          onFormDataChange({ ...formData, starterCode: undefined });
                          setShowStarterCode(false);
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear all starter code
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                  <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex items-center" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        {editing ? 'Update' : 'Create'} Problem
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* ── RIGHT: Live Preview Panel ── */}
              {showPreview && (
                <motion.div
                  className="w-[420px] flex-shrink-0 flex flex-col min-h-0 bg-[var(--primary)]/80"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Preview header: mimics the editor title bar */}
                  <div className="px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <Eye size={14} className="text-[var(--accent)]" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Live Preview</span>
                      <span className="text-[10px] text-[var(--text-secondary)] ml-auto">Exactly as displayed to users</span>
                    </div>
                    {/* Mock title bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {formData.title || 'Untitled Problem'}
                      </span>
                      {formData.difficulty && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getDifficultyColor(formData.difficulty)}`}>
                          {formData.difficulty}
                        </span>
                      )}
                    </div>
                    {/* Tags preview */}
                    {formData.tags && formData.tags.some(t => t.trim()) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.tags.filter(t => t.trim()).map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[var(--text-secondary)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Preview tabs (mirror ProblemTabs exactly) */}
                  <div className="px-4 pt-3 pb-0 flex-shrink-0">
                    <div className="flex gap-1 border-b border-white/[0.06]">
                      {([
                        { id: 'question' as const, label: 'Description', icon: <FileText size={13} /> },
                        { id: 'examples' as const, label: 'Examples', icon: <List size={13} /> },
                        { id: 'constraints' as const, label: 'Constraints', icon: <HelpCircle size={13} /> },
                      ]).map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPreviewTab(tab.id)}
                          className={`relative flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium rounded-t-lg transition-all duration-200 ${
                            previewTab === tab.id
                              ? 'text-white bg-white/[0.04]'
                              : 'text-[var(--text-secondary)] hover:text-white/80 hover:bg-white/[0.02]'
                          }`}
                        >
                          <span className={previewTab === tab.id ? 'text-[var(--accent)]' : ''}>{tab.icon}</span>
                          <span>{tab.label}</span>
                          {previewTab === tab.id && (
                            <motion.div
                              className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]"
                              layoutId="preview-tab-indicator"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview content */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {previewTab === 'question' && (
                      formData.description?.trim() ? (
                        <DescriptionPreview text={formData.description} />
                      ) : (
                        <p className="text-sm text-[var(--text-secondary)] italic">Start typing in the Description field to see the preview…</p>
                      )
                    )}

                    {previewTab === 'examples' && (
                      formData.examples && formData.examples.some(e => e.input || e.output) ? (
                        <div className="space-y-3">
                          {formData.examples.map((example, idx) => (
                            <ExamplePreview key={idx} example={example} idx={idx} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-[var(--text-secondary)]">
                          <List size={28} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No examples added yet.</p>
                        </div>
                      )
                    )}

                    {previewTab === 'constraints' && (
                      <ConstraintsPreview constraints={formData.constraints || []} />
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProblemForm;
