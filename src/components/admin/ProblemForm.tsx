import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Save, FileText } from 'lucide-react';

interface AdminProblem {
  id?: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  tags: string[];
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
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
