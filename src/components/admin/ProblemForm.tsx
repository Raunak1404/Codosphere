import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Save, FileText, Code, ChevronDown, ChevronRight } from 'lucide-react';

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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[var(--secondary)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editing ? 'Edit Problem' : 'Create New Problem'}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                    placeholder="Problem title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty *</label>
                  <select
                    required
                    value={formData.difficulty || 'Easy'}
                    onChange={(e) => onFormDataChange({ ...formData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                    className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  required
                  rows={6}
                  value={formData.description || ''}
                  onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Problem description"
                />
              </div>

              {/* Content File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Content File (Optional)</label>
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
                    className="flex items-center px-4 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 hover:border-[var(--accent)] cursor-pointer transition-colors"
                  >
                    <Upload size={16} className="mr-2" />
                    Choose File
                  </label>
                  {contentFile && (
                    <span className="text-sm text-[var(--text-secondary)]">{contentFile.name}</span>
                  )}
                  {formData.contentFileUrl && !contentFile && (
                    <a
                      href={formData.contentFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm flex items-center"
                    >
                      <FileText size={16} className="mr-1" />
                      Current File
                    </a>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Upload additional content as .txt, .md, .pdf, or .html (max 10MB)
                </p>
              </div>

              {/* Examples */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Examples *</label>
                  <button type="button" onClick={addExample} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm">
                    + Add Example
                  </button>
                </div>
                {formData.examples?.map((example, index) => (
                  <div key={index} className="bg-[var(--primary)] p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Example {index + 1}</span>
                      {formData.examples!.length > 1 && (
                        <button type="button" onClick={() => removeExample(index)} className="text-red-400 hover:text-red-300">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">Input</label>
                        <textarea
                          required
                          rows={2}
                          value={example.input}
                          onChange={(e) => {
                            const newExamples = [...(formData.examples || [])];
                            newExamples[index] = { ...example, input: e.target.value };
                            onFormDataChange({ ...formData, examples: newExamples });
                          }}
                          className="w-full px-2 py-1 bg-[var(--secondary)] rounded border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">Output</label>
                        <textarea
                          required
                          rows={2}
                          value={example.output}
                          onChange={(e) => {
                            const newExamples = [...(formData.examples || [])];
                            newExamples[index] = { ...example, output: e.target.value };
                            onFormDataChange({ ...formData, examples: newExamples });
                          }}
                          className="w-full px-2 py-1 bg-[var(--secondary)] rounded border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">Explanation (Optional)</label>
                      <textarea
                        rows={2}
                        value={example.explanation || ''}
                        onChange={(e) => {
                          const newExamples = [...(formData.examples || [])];
                          newExamples[index] = { ...example, explanation: e.target.value };
                          onFormDataChange({ ...formData, examples: newExamples });
                        }}
                        className="w-full px-2 py-1 bg-[var(--secondary)] rounded border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Constraints</label>
                  <button type="button" onClick={addConstraint} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm">
                    + Add Constraint
                  </button>
                </div>
                {formData.constraints?.map((constraint, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={constraint}
                      onChange={(e) => {
                        const newConstraints = [...(formData.constraints || [])];
                        newConstraints[index] = e.target.value;
                        onFormDataChange({ ...formData, constraints: newConstraints });
                      }}
                      className="flex-1 px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                      placeholder="Constraint"
                    />
                    {formData.constraints!.length > 1 && (
                      <button type="button" onClick={() => removeConstraint(index)} className="p-2 text-red-400 hover:text-red-300">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Tags *</label>
                  <button type="button" onClick={addTag} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm">
                    + Add Tag
                  </button>
                </div>
                {formData.tags?.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      required
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...(formData.tags || [])];
                        newTags[index] = e.target.value;
                        onFormDataChange({ ...formData, tags: newTags });
                      }}
                      className="flex-1 px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                      placeholder="Tag (e.g., Array, Hash Table)"
                    />
                    {formData.tags!.length > 1 && (
                      <button type="button" onClick={() => removeTag(index)} className="p-2 text-red-400 hover:text-red-300">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Test Cases */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Test Cases (Optional)</label>
                  <button type="button" onClick={addTestCase} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm">
                    + Add Test Case
                  </button>
                </div>
                {formData.testCases?.map((testCase, index) => (
                  <div key={index} className="bg-[var(--primary)] p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Test Case {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={testCase.isHidden}
                            onChange={(e) => {
                              const newTestCases = [...(formData.testCases || [])];
                              newTestCases[index] = { ...testCase, isHidden: e.target.checked };
                              onFormDataChange({ ...formData, testCases: newTestCases });
                            }}
                            className="mr-1"
                          />
                          Hidden
                        </label>
                        {formData.testCases!.length > 1 && (
                          <button type="button" onClick={() => removeTestCase(index)} className="text-red-400 hover:text-red-300">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">Input</label>
                        <textarea
                          rows={2}
                          value={testCase.input}
                          onChange={(e) => {
                            const newTestCases = [...(formData.testCases || [])];
                            newTestCases[index] = { ...testCase, input: e.target.value };
                            onFormDataChange({ ...formData, testCases: newTestCases });
                          }}
                          className="w-full px-2 py-1 bg-[var(--secondary)] rounded border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">Expected Output</label>
                        <textarea
                          rows={2}
                          value={testCase.expectedOutput}
                          onChange={(e) => {
                            const newTestCases = [...(formData.testCases || [])];
                            newTestCases[index] = { ...testCase, expectedOutput: e.target.value };
                            onFormDataChange({ ...formData, testCases: newTestCases });
                          }}
                          className="w-full px-2 py-1 bg-[var(--secondary)] rounded border border-gray-700 focus:outline-none focus:border-[var(--accent)] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Function Signature (collapsible) ── */}
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => { if (!showFunctionMeta) initFunctionMeta(); else setShowFunctionMeta(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-white/[0.03] transition-colors"
                >
                  {showFunctionMeta ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Code size={16} className="text-[var(--accent)]" />
                  Function Signature
                  <span className="text-xs text-[var(--text-secondary)] ml-auto">Enables auto-generated wrappers &amp; starter code</span>
                </button>

                {showFunctionMeta && formData.functionMeta && (
                  <div className="p-4 border-t border-gray-700 space-y-4">
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

              {/* ── Custom Starter Code (collapsible) ── */}
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowStarterCode(!showStarterCode)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-white/[0.03] transition-colors"
                >
                  {showStarterCode ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <FileText size={16} className="text-[var(--accent-secondary)]" />
                  Custom Starter Code
                  <span className="text-xs text-[var(--text-secondary)] ml-auto">Override auto-generated templates</span>
                </button>

                {showStarterCode && (
                  <div className="p-4 border-t border-gray-700 space-y-3">
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
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProblemForm;
