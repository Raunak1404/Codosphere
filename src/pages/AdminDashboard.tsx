import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Save, 
  X, 
  FileText, 
  Eye,
  Search,
  Filter,
  Settings,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { 
  AdminProblem, 
  createProblem, 
  updateProblem, 
  deleteProblem, 
  getAllProblems,
  isAdmin 
} from '../firebase/admin';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<AdminProblem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState<Partial<AdminProblem>>({
    title: '',
    difficulty: 'Easy',
    description: '',
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: [''],
    tags: [''],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }]
  });
  const [contentFile, setContentFile] = useState<File | null>(null);

  // Check admin access
  useEffect(() => {
    if (currentUser && !isAdmin(currentUser)) {
      window.location.href = '/';
    }
  }, [currentUser]);

  // Load problems
  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const { problems: fetchedProblems, error: fetchError } = await getAllProblems();
      if (fetchError) {
        console.error('Error loading problems:', fetchError);
        setError(fetchError);
      } else {
        setProblems(fetchedProblems);
      }
    } catch (error: any) {
      console.error('Error loading problems:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter problems
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = !difficultyFilter || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingProblem) {
        // Update existing problem
        const { success, error } = await updateProblem(
          editingProblem.id!,
          formData,
          contentFile || undefined
        );
        
        if (success) {
          await loadProblems();
          setEditingProblem(null);
          resetForm();
        } else {
          alert('Error updating problem: ' + error);
        }
      } else {
        // Create new problem
        const { success, error } = await createProblem(
          formData as Omit<AdminProblem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
          contentFile || undefined
        );
        
        if (success) {
          await loadProblems();
          setShowCreateModal(false);
          resetForm();
        } else {
          alert('Error creating problem: ' + error);
        }
      }
    } catch (error) {
      console.error('Error saving problem:', error);
      alert('An error occurred while saving the problem');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      return;
    }

    try {
      const { success, error } = await deleteProblem(problemId);
      if (success) {
        await loadProblems();
      } else {
        alert('Error deleting problem: ' + error);
      }
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert('An error occurred while deleting the problem');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      difficulty: 'Easy',
      description: '',
      examples: [{ input: '', output: '', explanation: '' }],
      constraints: [''],
      tags: [''],
      testCases: [{ input: '', expectedOutput: '', isHidden: false }]
    });
    setContentFile(null);
  };

  // Handle edit
  const handleEdit = (problem: AdminProblem) => {
    setEditingProblem(problem);
    setFormData(problem);
    setShowCreateModal(true);
  };

  // Add/remove dynamic fields
  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...(prev.examples || []), { input: '', output: '', explanation: '' }]
    }));
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: (prev.examples || []).filter((_, i) => i !== index)
    }));
  };

  const addConstraint = () => {
    setFormData(prev => ({
      ...prev,
      constraints: [...(prev.constraints || []), '']
    }));
  };

  const removeConstraint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      constraints: (prev.constraints || []).filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), '']
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== index)
    }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...(prev.testCases || []), { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const removeTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: (prev.testCases || []).filter((_, i) => i !== index)
    }));
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400';
      case 'Medium': return 'text-yellow-400 bg-yellow-400';
      case 'Hard': return 'text-red-400 bg-red-400';
      default: return 'text-gray-400 bg-gray-400';
    }
  };

  if (!currentUser || !isAdmin(currentUser)) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow py-12">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <Settings className="text-[var(--accent)] mr-3" size={28} />
                  <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-[var(--text-secondary)]">Manage coding problems and content</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    resetForm();
                    setEditingProblem(null);
                    setShowCreateModal(true);
                  }}
                  className="btn-primary flex items-center"
                  disabled={!!error}
                >
                  <Plus size={18} className="mr-2" />
                  Create Problem
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="card mb-8 border-red-500 bg-red-900 bg-opacity-20">
                  <div className="flex items-start">
                    <AlertTriangle className="text-red-400 mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="text-red-400 font-semibold mb-2">Configuration Required</h3>
                      <p className="text-sm text-red-300 mb-4">{error}</p>
                      {error.includes('security rules') && (
                        <div className="bg-red-800 bg-opacity-50 p-4 rounded-lg">
                          <p className="text-sm text-red-200 mb-2"><strong>To fix this:</strong></p>
                          <ol className="text-sm text-red-200 space-y-1 list-decimal list-inside">
                            <li>Go to your Firebase Console</li>
                            <li>Navigate to Firestore Database → Rules</li>
                            <li>Add this rule for the problems collection:</li>
                          </ol>
                          <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /problems/{document} {
      allow read, write: if request.auth != null 
        && request.auth.uid in ["6PoYJdCdqWQYZ66ue6sn6TZcTj33"];
    }
  }
}`}
                          </pre>
                          <p className="text-xs text-red-200 mt-2">
                            Replace the UID with your actual admin user ID if different.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card text-center">
                  <BarChart3 className="text-[var(--accent)] mx-auto mb-2" size={24} />
                  <h3 className="text-2xl font-bold">{problems.length}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Total Problems</p>
                </div>
                <div className="card text-center">
                  <div className="w-6 h-6 rounded-full bg-green-400 mx-auto mb-2"></div>
                  <h3 className="text-2xl font-bold">{problems.filter(p => p.difficulty === 'Easy').length}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Easy Problems</p>
                </div>
                <div className="card text-center">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 mx-auto mb-2"></div>
                  <h3 className="text-2xl font-bold">{problems.filter(p => p.difficulty === 'Medium').length}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Medium Problems</p>
                </div>
                <div className="card text-center">
                  <div className="w-6 h-6 rounded-full bg-red-400 mx-auto mb-2"></div>
                  <h3 className="text-2xl font-bold">{problems.filter(p => p.difficulty === 'Hard').length}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Hard Problems</p>
                </div>
              </div>

              {/* Only show filters and table if no error */}
              {!error && (
                <>
                  {/* Filters */}
                  <div className="card mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                          type="text"
                          placeholder="Search problems..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Filter size={18} className="text-[var(--text-secondary)]" />
                        <select
                          value={difficultyFilter}
                          onChange={(e) => setDifficultyFilter(e.target.value)}
                          className="px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                        >
                          <option value="">All Difficulties</option>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Problems Table */}
                  <div className="card">
                    <h2 className="text-xl font-bold mb-6">Problems ({filteredProblems.length})</h2>
                    
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-700">
                              <th className="text-left py-3 px-4">Title</th>
                              <th className="text-left py-3 px-4">Difficulty</th>
                              <th className="text-left py-3 px-4">Tags</th>
                              <th className="text-left py-3 px-4">Content File</th>
                              <th className="text-left py-3 px-4">Created</th>
                              <th className="text-right py-3 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProblems.map((problem) => (
                              <tr key={problem.id} className="border-b border-gray-800 hover:bg-[var(--primary)] hover:bg-opacity-50">
                                <td className="py-3 px-4">
                                  <div className="font-medium">{problem.title}</div>
                                  <div className="text-sm text-[var(--text-secondary)] truncate max-w-xs">
                                    {problem.description.substring(0, 100)}...
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-opacity-20 ${getDifficultyColor(problem.difficulty)}`}>
                                    {problem.difficulty}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap gap-1">
                                    {problem.tags.slice(0, 3).map((tag, idx) => (
                                      <span key={idx} className="bg-[var(--primary)] text-xs px-2 py-1 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                    {problem.tags.length > 3 && (
                                      <span className="text-xs text-[var(--text-secondary)]">
                                        +{problem.tags.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {problem.contentFileUrl ? (
                                    <a 
                                      href={problem.contentFileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center"
                                    >
                                      <FileText size={16} className="mr-1" />
                                      View
                                    </a>
                                  ) : (
                                    <span className="text-[var(--text-secondary)] text-sm">No file</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">
                                  {problem.createdAt && problem.createdAt.toDate ? 
                                    problem.createdAt.toDate().toLocaleDateString() : 
                                    'Unknown'
                                  }
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => window.open(`/code/${problem.id}`, '_blank')}
                                      className="p-2 hover:bg-[var(--accent)] hover:bg-opacity-20 rounded-lg transition-colors"
                                      title="Preview"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleEdit(problem)}
                                      className="p-2 hover:bg-[var(--accent)] hover:bg-opacity-20 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(problem.id!)}
                                      className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors text-red-400"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {filteredProblems.length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-[var(--text-secondary)]">No problems found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </main>

        <Footer />

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showCreateModal && !error && (
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
                      {editingProblem ? 'Edit Problem' : 'Create New Problem'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingProblem(null);
                        resetForm();
                      }}
                      className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                        placeholder="Problem title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Difficulty *</label>
                      <select
                        required
                        value={formData.difficulty || 'Easy'}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                        onChange={(e) => setContentFile(e.target.files?.[0] || null)}
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
                        <span className="text-sm text-[var(--text-secondary)]">
                          {contentFile.name}
                        </span>
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
                      <button
                        type="button"
                        onClick={addExample}
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm"
                      >
                        + Add Example
                      </button>
                    </div>
                    {formData.examples?.map((example, index) => (
                      <div key={index} className="bg-[var(--primary)] p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Example {index + 1}</span>
                          {formData.examples!.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExample(index)}
                              className="text-red-400 hover:text-red-300"
                            >
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
                                setFormData(prev => ({ ...prev, examples: newExamples }));
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
                                setFormData(prev => ({ ...prev, examples: newExamples }));
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
                              setFormData(prev => ({ ...prev, examples: newExamples }));
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
                      <button
                        type="button"
                        onClick={addConstraint}
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm"
                      >
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
                            setFormData(prev => ({ ...prev, constraints: newConstraints }));
                          }}
                          className="flex-1 px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                          placeholder="Constraint"
                        />
                        {formData.constraints!.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeConstraint(index)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
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
                      <button
                        type="button"
                        onClick={addTag}
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm"
                      >
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
                            setFormData(prev => ({ ...prev, tags: newTags }));
                          }}
                          className="flex-1 px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
                          placeholder="Tag (e.g., Array, Hash Table)"
                        />
                        {formData.tags!.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
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
                      <button
                        type="button"
                        onClick={addTestCase}
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm"
                      >
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
                                  setFormData(prev => ({ ...prev, testCases: newTestCases }));
                                }}
                                className="mr-1"
                              />
                              Hidden
                            </label>
                            {formData.testCases!.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTestCase(index)}
                                className="text-red-400 hover:text-red-300"
                              >
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
                                setFormData(prev => ({ ...prev, testCases: newTestCases }));
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
                                setFormData(prev => ({ ...prev, testCases: newTestCases }));
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
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingProblem(null);
                        resetForm();
                      }}
                      className="btn-secondary"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex items-center"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          {editingProblem ? 'Update' : 'Create'} Problem
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;