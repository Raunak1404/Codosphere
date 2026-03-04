import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Code, ChevronDown, ChevronRight,
  Eye, PenLine, Plus, Trash2, GripVertical,
  BookOpen, Clock, Target, Layers, ListTree,
  FileText, BarChart2, Network, GitBranch, Sparkles,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface TopicSection {
  title: string;
  content: string;
  examples?: {
    language: string;
    code: string;
  }[];
}

interface PracticeProblem {
  id: number;
  title: string;
  difficulty: string;
}

export interface StudyTopicFormData {
  topicId: string;
  title: string;
  icon: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  problems: number;
  introduction: string;
  sections: TopicSection[];
  practiceProblems: PracticeProblem[];
}

interface StudyTopicFormProps {
  visible: boolean;
  editing: boolean;
  formData: StudyTopicFormData;
  saving: boolean;
  onFormDataChange: (data: StudyTopicFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const ICON_OPTIONS = ['Code', 'ListTree', 'FileText', 'BarChart2', 'Network', 'Layers', 'GitBranch', 'BookOpen'];
const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C', 'C++'] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

const getIconComponent = (iconName: string, size = 20) => {
  const iconMap: Record<string, React.ReactNode> = {
    Code: <Code size={size} />,
    ListTree: <ListTree size={size} />,
    FileText: <FileText size={size} />,
    BarChart2: <BarChart2 size={size} />,
    Network: <Network size={size} />,
    Layers: <Layers size={size} />,
    GitBranch: <GitBranch size={size} />,
    BookOpen: <BookOpen size={size} />,
  };
  return iconMap[iconName] || <BookOpen size={size} />;
};

const difficultyConfig: Record<string, { color: string; bg: string; border: string }> = {
  Beginner: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
  Intermediate: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/20' },
  Advanced: { color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/20' },
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--accent)]/15">
      <span className="text-[var(--accent)]">{icon}</span>
    </div>
    <h3 className="text-sm font-bold tracking-tight text-white">{title}</h3>
  </div>
);

// ── User Preview Card (how it looks on user-facing Study page) ───────────────

const TopicPreviewCard: React.FC<{ data: StudyTopicFormData }> = ({ data }) => {
  const dc = difficultyConfig[data.difficulty] || difficultyConfig.Beginner;
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-[var(--accent)]/30 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shrink-0">
          {getIconComponent(data.icon, 24)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold truncate">{data.title || 'Untitled Topic'}</h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dc.bg} ${dc.color} border ${dc.border}`}>
              {data.difficulty}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
            {data.description || 'No description yet...'}
          </p>
          <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1"><Clock size={10} /> {data.estimatedTime || '—'}</span>
            <span className="flex items-center gap-1"><Target size={10} /> {data.practiceProblems.length} problems</span>
            <span className="flex items-center gap-1"><Layers size={10} /> {data.sections.length} sections</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Section Preview (how it looks on user-facing Topic page) ─────────────────

const SectionPreview: React.FC<{ section: TopicSection; index: number }> = ({ section, index }) => (
  <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">
        {index + 1}
      </div>
      <span className="text-sm font-bold text-white">{section.title || 'Untitled Section'}</span>
    </div>
    <p className="text-xs text-[var(--text-secondary)] whitespace-pre-line line-clamp-4">
      {section.content || 'No content yet...'}
    </p>
    {section.examples && section.examples.length > 0 && (
      <div className="mt-3 space-y-2">
        {section.examples.map((ex, i) => (
          <div key={i} className="bg-black/30 rounded-lg p-3 border border-white/[0.04]">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{ex.language}</span>
            <pre className="mt-1 text-[11px] font-mono text-emerald-300/80 overflow-x-auto whitespace-pre">
              {ex.code || '// No code yet'}
            </pre>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── Main Form Component ──────────────────────────────────────────────────────

const StudyTopicForm: React.FC<StudyTopicFormProps> = ({
  visible,
  editing,
  formData,
  saving,
  onFormDataChange,
  onSubmit,
  onClose,
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const update = (patch: Partial<StudyTopicFormData>) => {
    onFormDataChange({ ...formData, ...patch });
  };

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // ── Section helpers ────────────────────────────────────────────────────

  const addSection = () => {
    update({ sections: [...formData.sections, { title: '', content: '', examples: [] }] });
    setExpandedSections(prev => new Set(prev).add(formData.sections.length));
  };

  const removeSection = (idx: number) => {
    update({ sections: formData.sections.filter((_, i) => i !== idx) });
  };

  const updateSection = (idx: number, patch: Partial<TopicSection>) => {
    const sections = [...formData.sections];
    sections[idx] = { ...sections[idx], ...patch };
    update({ sections });
  };

  // ── Code example helpers ───────────────────────────────────────────────

  const addExample = (sectionIdx: number) => {
    const sections = [...formData.sections];
    const examples = [...(sections[sectionIdx].examples || []), { language: 'JavaScript', code: '' }];
    sections[sectionIdx] = { ...sections[sectionIdx], examples };
    update({ sections });
  };

  const removeExample = (sectionIdx: number, exIdx: number) => {
    const sections = [...formData.sections];
    const examples = (sections[sectionIdx].examples || []).filter((_, i) => i !== exIdx);
    sections[sectionIdx] = { ...sections[sectionIdx], examples };
    update({ sections });
  };

  const updateExample = (sectionIdx: number, exIdx: number, patch: Partial<{ language: string; code: string }>) => {
    const sections = [...formData.sections];
    const examples = [...(sections[sectionIdx].examples || [])];
    examples[exIdx] = { ...examples[exIdx], ...patch };
    sections[sectionIdx] = { ...sections[sectionIdx], examples };
    update({ sections });
  };

  // ── Practice problem helpers ───────────────────────────────────────────

  const addPracticeProblem = () => {
    update({
      practiceProblems: [...formData.practiceProblems, { id: 0, title: '', difficulty: 'Easy' }],
      problems: formData.practiceProblems.length + 1,
    });
  };

  const removePracticeProblem = (idx: number) => {
    const updated = formData.practiceProblems.filter((_, i) => i !== idx);
    update({ practiceProblems: updated, problems: updated.length });
  };

  const updatePracticeProblem = (idx: number, patch: Partial<PracticeProblem>) => {
    const problems = [...formData.practiceProblems];
    problems[idx] = { ...problems[idx], ...patch };
    update({ practiceProblems: problems, problems: problems.length });
  };

  // ── Auto-generate slug from title ──────────────────────────────────────

  const handleTitleChange = (title: string) => {
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    update({ title, topicId: editing ? formData.topicId : autoSlug });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="w-full max-w-4xl bg-[var(--secondary)] border border-white/[0.08] rounded-2xl shadow-2xl mx-4 my-auto"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[var(--secondary)] border-b border-white/[0.06] px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display tracking-tight">
                    {editing ? 'Edit Study Topic' : 'Create Study Topic'}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {editing ? 'Update topic content and sections' : 'Add a new study topic with sections and examples'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Edit / Preview toggle */}
                <div className="flex rounded-lg border border-white/[0.08] overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      mode === 'edit' ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-white/[0.04]'
                    }`}
                  >
                    <PenLine size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      mode === 'preview' ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-white/[0.04]'
                    }`}
                  >
                    <Eye size={12} /> Preview
                  </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={onSubmit}>
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                {mode === 'preview' ? (
                  /* ═══════════════ PREVIEW MODE ═══════════════ */
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                        Topic Card Preview (Study Page)
                      </h3>
                      <TopicPreviewCard data={formData} />
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                        Introduction
                      </h3>
                      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">
                          {formData.introduction || 'No introduction yet...'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                        Sections ({formData.sections.length})
                      </h3>
                      <div className="space-y-3">
                        {formData.sections.length === 0 ? (
                          <p className="text-sm text-[var(--text-secondary)] text-center py-8">No sections added yet</p>
                        ) : (
                          formData.sections.map((section, i) => (
                            <SectionPreview key={i} section={section} index={i} />
                          ))
                        )}
                      </div>
                    </div>

                    {formData.practiceProblems.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                          Practice Problems ({formData.practiceProblems.length})
                        </h3>
                        <div className="space-y-2">
                          {formData.practiceProblems.map((p, i) => {
                            const pColor = p.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/15' :
                              p.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/15' : 'text-rose-400 bg-rose-500/15';
                            return (
                              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                                    {i + 1}
                                  </div>
                                  <span className="text-sm font-medium">{p.title || 'Untitled'}</span>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pColor}`}>
                                  {p.difficulty}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ═══════════════ EDIT MODE ═══════════════ */
                  <div className="space-y-6">
                    {/* ── Basic Info ────────────────────────────────── */}
                    <div>
                      <SectionHeader icon={<BookOpen size={14} />} title="Basic Information" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                            Title <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                            placeholder="e.g. Arrays"
                            required
                          />
                        </div>

                        {/* Slug */}
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                            URL Slug
                          </label>
                          <input
                            type="text"
                            value={formData.topicId}
                            onChange={(e) => update({ topicId: e.target.value })}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm font-mono"
                            placeholder="arrays"
                          />
                          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">/study/{formData.topicId || '...'}</span>
                        </div>

                        {/* Icon */}
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Icon</label>
                          <div className="flex flex-wrap gap-2">
                            {ICON_OPTIONS.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => update({ icon })}
                                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                                  formData.icon === icon
                                    ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                                    : 'border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.04]'
                                }`}
                                title={icon}
                              >
                                {getIconComponent(icon, 16)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Difficulty */}
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Difficulty</label>
                          <select
                            value={formData.difficulty}
                            onChange={(e) => update({ difficulty: e.target.value as any })}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        {/* Estimated Time */}
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Estimated Time</label>
                          <input
                            type="text"
                            value={formData.estimatedTime}
                            onChange={(e) => update({ estimatedTime: e.target.value })}
                            className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                            placeholder="e.g. 3 hours"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                          Short Description <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => update({ description: e.target.value })}
                          className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                          placeholder="Brief one-line description shown on the study page card"
                          required
                        />
                      </div>

                      {/* Introduction */}
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Introduction</label>
                        <textarea
                          value={formData.introduction}
                          onChange={(e) => update({ introduction: e.target.value })}
                          className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm min-h-[100px] resize-y"
                          placeholder="A longer introduction paragraph shown at the top of the topic page..."
                        />
                      </div>
                    </div>

                    {/* ── Sections ──────────────────────────────────── */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <SectionHeader icon={<Layers size={14} />} title={`Sections (${formData.sections.length})`} />
                        <button
                          type="button"
                          onClick={addSection}
                          className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                        >
                          <Plus size={14} /> Add Section
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formData.sections.map((section, sIdx) => (
                          <div
                            key={sIdx}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden"
                          >
                            {/* Section header row */}
                            <div
                              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                              onClick={() => toggleSection(sIdx)}
                            >
                              <GripVertical size={14} className="text-[var(--text-secondary)] shrink-0" />
                              <div className="w-6 h-6 rounded-md bg-[var(--accent)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">
                                {sIdx + 1}
                              </div>
                              <span className="text-sm font-medium flex-1 truncate">
                                {section.title || `Section ${sIdx + 1}`}
                              </span>
                              <span className="text-[10px] text-[var(--text-secondary)]">
                                {(section.examples || []).length} example{(section.examples || []).length !== 1 ? 's' : ''}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeSection(sIdx); }}
                                className="p-1 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                                title="Remove section"
                              >
                                <Trash2 size={13} />
                              </button>
                              {expandedSections.has(sIdx) ? <ChevronDown size={14} className="text-[var(--text-secondary)]" /> : <ChevronRight size={14} className="text-[var(--text-secondary)]" />}
                            </div>

                            {/* Expanded content */}
                            <AnimatePresence>
                              {expandedSections.has(sIdx) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04]">
                                    {/* Section title */}
                                    <div className="pt-3">
                                      <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                                        Section Title
                                      </label>
                                      <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => updateSection(sIdx, { title: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                                        placeholder="e.g. Introduction to Arrays"
                                      />
                                    </div>

                                    {/* Section content */}
                                    <div>
                                      <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                                        Content
                                      </label>
                                      <textarea
                                        value={section.content}
                                        onChange={(e) => updateSection(sIdx, { content: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm min-h-[120px] resize-y font-mono"
                                        placeholder="Write the educational content for this section..."
                                      />
                                    </div>

                                    {/* Code examples */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                                          Code Examples ({(section.examples || []).length})
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => addExample(sIdx)}
                                          className="flex items-center gap-1 text-[10px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                                        >
                                          <Plus size={12} /> Add Example
                                        </button>
                                      </div>

                                      {(section.examples || []).map((ex, exIdx) => (
                                        <div key={exIdx} className="mb-2 rounded-lg border border-white/[0.04] bg-black/20 p-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            <select
                                              value={ex.language}
                                              onChange={(e) => updateExample(sIdx, exIdx, { language: e.target.value })}
                                              className="px-2 py-1 bg-[var(--primary)] rounded border border-gray-700 text-xs focus:outline-none focus:border-[var(--accent)]"
                                            >
                                              {LANGUAGES.map((lang) => (
                                                <option key={lang} value={lang}>{lang}</option>
                                              ))}
                                            </select>
                                            <button
                                              type="button"
                                              onClick={() => removeExample(sIdx, exIdx)}
                                              className="ml-auto p-1 text-red-400/70 hover:text-red-400 rounded transition-colors"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                          <textarea
                                            value={ex.code}
                                            onChange={(e) => updateExample(sIdx, exIdx, { code: e.target.value })}
                                            className="w-full px-3 py-2 bg-black/30 rounded-lg border border-white/[0.04] focus:outline-none focus:border-[var(--accent)] text-xs font-mono text-emerald-300 min-h-[100px] resize-y"
                                            placeholder="// Write your code example here..."
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}

                        {formData.sections.length === 0 && (
                          <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                            No sections yet. Click "Add Section" to start building the topic content.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Practice Problems ─────────────────────────── */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <SectionHeader icon={<Target size={14} />} title={`Practice Problems (${formData.practiceProblems.length})`} />
                        <button
                          type="button"
                          onClick={addPracticeProblem}
                          className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                        >
                          <Plus size={14} /> Add Problem
                        </button>
                      </div>

                      <div className="space-y-2">
                        {formData.practiceProblems.map((problem, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                            <div className="w-6 h-6 rounded-md bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] shrink-0">
                              {pIdx + 1}
                            </div>
                            <input
                              type="number"
                              value={problem.id || ''}
                              onChange={(e) => updatePracticeProblem(pIdx, { id: parseInt(e.target.value) || 0 })}
                              className="w-20 px-2 py-1.5 bg-[var(--primary)] rounded border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-xs"
                              placeholder="ID"
                            />
                            <input
                              type="text"
                              value={problem.title}
                              onChange={(e) => updatePracticeProblem(pIdx, { title: e.target.value })}
                              className="flex-1 px-2 py-1.5 bg-[var(--primary)] rounded border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-xs"
                              placeholder="Problem Title"
                            />
                            <select
                              value={problem.difficulty}
                              onChange={(e) => updatePracticeProblem(pIdx, { difficulty: e.target.value })}
                              className="px-2 py-1.5 bg-[var(--primary)] rounded border border-gray-700 text-xs focus:outline-none focus:border-[var(--accent)]"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removePracticeProblem(pIdx)}
                              className="p-1 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}

                        {formData.practiceProblems.length === 0 && (
                          <div className="text-center py-6 text-sm text-[var(--text-secondary)]">
                            No practice problems linked. Add references to coding problems.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[var(--secondary)] border-t border-white/[0.06] px-6 py-4 rounded-b-2xl flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.title || !formData.description}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {editing ? 'Update Topic' : 'Create Topic'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StudyTopicForm;
