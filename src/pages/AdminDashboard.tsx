import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, BarChart3, AlertTriangle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import ProblemTable from '../components/admin/ProblemTable';
import ProblemForm from '../components/admin/ProblemForm';
import { useAuth } from '../context/AuthContext';
import {
  AdminProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  getAllProblems,
  isAdmin,
} from '../services/firebase';

const INITIAL_FORM: Partial<AdminProblem> = {
  title: '',
  difficulty: 'Easy',
  description: '',
  examples: [{ input: '', output: '', explanation: '' }],
  constraints: [''],
  tags: [''],
  testCases: [{ input: '', expectedOutput: '', isHidden: false }],
};

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
  const [formData, setFormData] = useState<Partial<AdminProblem>>(INITIAL_FORM);
  const [contentFile, setContentFile] = useState<File | null>(null);

  // Admin check
  useEffect(() => {
    if (currentUser && !isAdmin(currentUser)) {
      window.location.href = '/';
    }
  }, [currentUser]);

  // Load problems on mount
  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const { problems: fetched, error: fetchError } = await getAllProblems();
      if (fetchError) {
        console.error('Error loading problems:', fetchError);
        setError(fetchError);
      } else {
        setProblems(fetched);
      }
    } catch (err: any) {
      console.error('Error loading problems:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setContentFile(null);
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProblem) {
        const { success, error } = await updateProblem(editingProblem.id!, formData, contentFile || undefined);
        if (success) {
          await loadProblems();
          setEditingProblem(null);
          resetForm();
          setShowCreateModal(false);
        } else {
          alert('Error updating problem: ' + error);
        }
      } else {
        const { success, error } = await createProblem(
          formData as Omit<AdminProblem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
          contentFile || undefined,
        );
        if (success) {
          await loadProblems();
          setShowCreateModal(false);
          resetForm();
        } else {
          alert('Error creating problem: ' + error);
        }
      }
    } catch (err) {
      console.error('Error saving problem:', err);
      alert('An error occurred while saving the problem');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem? This action cannot be undone.')) return;
    try {
      const { success, error } = await deleteProblem(problemId);
      if (success) {
        await loadProblems();
      } else {
        alert('Error deleting problem: ' + error);
      }
    } catch (err) {
      console.error('Error deleting problem:', err);
      alert('An error occurred while deleting the problem');
    }
  };

  const handleEdit = (problem: AdminProblem) => {
    setEditingProblem(problem);
    setFormData(problem);
    setShowCreateModal(true);
  };

  if (!currentUser || !isAdmin(currentUser)) return null;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <Settings className="text-[var(--accent)] mr-3" size={28} />
                  <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Admin Dashboard</h1>
                    <p className="text-[var(--text-secondary)]">Manage coding problems and content</p>
                  </div>
                </div>
                <button
                  onClick={() => { resetForm(); setEditingProblem(null); setShowCreateModal(true); }}
                  className="btn-primary flex items-center"
                  disabled={!!error}
                >
                  <Plus size={18} className="mr-2" />
                  Create Problem
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="card-interactive mb-8 border-red-500 bg-red-900 bg-opacity-20">
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
                <div className="card-interactive text-center">
                  <BarChart3 className="text-[var(--accent)] mx-auto mb-2" size={24} />
                  <h3 className="text-2xl font-bold font-display">{problems.length}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Total Problems</p>
                </div>
                <div className="card-interactive text-center">
                  <div className="w-6 h-6 rounded-full bg-green-400 mx-auto mb-2"></div>
                  <h3 className="text-2xl font-bold font-display">{problems.filter(p => p.difficulty === 'Easy').length}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Easy Problems</p>
                </div>
                <div className="card-interactive text-center">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 mx-auto mb-2"></div>
                  <h3 className="text-2xl font-bold font-display">{problems.filter(p => p.difficulty === 'Medium').length}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Medium Problems</p>
                </div>
                <div className="card-interactive text-center">
                  <div className="w-6 h-6 rounded-full bg-red-400 mx-auto mb-2"></div>
                  <h3 className="text-2xl font-bold font-display">{problems.filter(p => p.difficulty === 'Hard').length}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Hard Problems</p>
                </div>
              </div>

              {/* Problems Table */}
              {!error && (
                <ProblemTable
                  problems={problems}
                  loading={loading}
                  searchTerm={searchTerm}
                  difficultyFilter={difficultyFilter}
                  onSearchChange={setSearchTerm}
                  onDifficultyFilterChange={setDifficultyFilter}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </motion.div>
          </div>
        </main>
        <Footer />

        {/* Create/Edit Modal */}
        <ProblemForm
          visible={showCreateModal && !error}
          editing={!!editingProblem}
          formData={formData}
          contentFile={contentFile}
          saving={saving}
          onFormDataChange={setFormData}
          onContentFileChange={setContentFile}
          onSubmit={handleSubmit}
          onClose={() => { setShowCreateModal(false); setEditingProblem(null); resetForm(); }}
        />
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
