import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, AlertTriangle, Layers, Target } from 'lucide-react';
import AdminNavbar from '../components/admin/AdminNavbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import StudyTopicTable from '../components/admin/StudyTopicTable';
import StudyTopicForm, { StudyTopicFormData } from '../components/admin/StudyTopicForm';
import { useAuth } from '../context/AuthContext';
import {
  AdminStudyTopic,
  createStudyTopic,
  updateStudyTopic,
  deleteStudyTopic,
  getAllStudyTopics,
} from '../services/firebase';

const INITIAL_FORM: StudyTopicFormData = {
  topicId: '',
  title: '',
  icon: 'Code',
  description: '',
  difficulty: 'Beginner',
  estimatedTime: '',
  problems: 0,
  introduction: '',
  sections: [],
  practiceProblems: [],
};

const AdminStudyTopics = () => {
  const { currentUser, isAdmin } = useAuth();
  const [topics, setTopics] = useState<AdminStudyTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<AdminStudyTopic | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<StudyTopicFormData>(INITIAL_FORM);

  // Admin check
  useEffect(() => {
    if (currentUser && !isAdmin) {
      window.location.href = '/';
    }
  }, [currentUser, isAdmin]);

  // Load topics on mount
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    setError('');
    try {
      const { topics: fetched, error: fetchError } = await getAllStudyTopics();
      if (fetchError) {
        console.error('Error loading study topics:', fetchError);
        setError(fetchError);
      } else {
        setTopics(fetched);
      }
    } catch (err: any) {
      console.error('Error loading study topics:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTopic) {
        const { success, error } = await updateStudyTopic(editingTopic.id!, formData);
        if (success) {
          await loadTopics();
          setEditingTopic(null);
          resetForm();
          setShowCreateModal(false);
        } else {
          alert('Error updating topic: ' + error);
        }
      } else {
        const { success, error } = await createStudyTopic(formData);
        if (success) {
          await loadTopics();
          setShowCreateModal(false);
          resetForm();
        } else {
          alert('Error creating topic: ' + error);
        }
      }
    } catch (err) {
      console.error('Error saving topic:', err);
      alert('An error occurred while saving the topic');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this study topic? This action cannot be undone.')) return;
    try {
      const { success, error } = await deleteStudyTopic(topicId);
      if (success) {
        await loadTopics();
      } else {
        alert('Error deleting topic: ' + error);
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert('An error occurred while deleting the topic');
    }
  };

  const handleEdit = (topic: AdminStudyTopic) => {
    setEditingTopic(topic);
    setFormData({
      topicId: topic.topicId,
      title: topic.title,
      icon: topic.icon,
      description: topic.description,
      difficulty: topic.difficulty,
      estimatedTime: topic.estimatedTime,
      problems: topic.problems,
      introduction: topic.introduction,
      sections: topic.sections || [],
      practiceProblems: topic.practiceProblems || [],
    });
    setShowCreateModal(true);
  };

  const handleDuplicate = (topic: AdminStudyTopic) => {
    setEditingTopic(null);
    setFormData({
      topicId: topic.topicId + '-copy',
      title: topic.title + ' (Copy)',
      icon: topic.icon,
      description: topic.description,
      difficulty: topic.difficulty,
      estimatedTime: topic.estimatedTime,
      problems: topic.problems,
      introduction: topic.introduction,
      sections: topic.sections || [],
      practiceProblems: topic.practiceProblems || [],
    });
    setShowCreateModal(true);
  };

  if (!currentUser || !isAdmin) return null;

  const difficultyCount = (d: string) => topics.filter(t => t.difficulty === d).length;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <AdminNavbar />
        <main className="flex-grow py-12">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <BookOpen className="text-[var(--accent)] mr-3" size={28} />
                  <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Study Topics</h1>
                    <p className="text-[var(--text-secondary)]">Manage study material, sections, and code examples</p>
                  </div>
                </div>
                <button
                  onClick={() => { resetForm(); setEditingTopic(null); setShowCreateModal(true); }}
                  className="btn-primary flex items-center"
                  disabled={!!error}
                >
                  <Plus size={18} className="mr-2" />
                  Create Topic
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="card-interactive mb-8 border-red-500 bg-red-900 bg-opacity-20">
                  <div className="flex items-start">
                    <AlertTriangle className="text-red-400 mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="text-red-400 font-semibold mb-2">Error</h3>
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card-interactive text-center">
                  <BookOpen className="text-[var(--accent)] mx-auto mb-2" size={24} />
                  <h3 className="text-2xl font-bold font-display">{topics.length}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Total Topics</p>
                </div>
                <div className="card-interactive text-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold font-display">{difficultyCount('Beginner')}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Beginner</p>
                </div>
                <div className="card-interactive text-center">
                  <div className="w-6 h-6 rounded-full bg-amber-400 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold font-display">{difficultyCount('Intermediate')}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Intermediate</p>
                </div>
                <div className="card-interactive text-center">
                  <div className="w-6 h-6 rounded-full bg-rose-400 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold font-display">{difficultyCount('Advanced')}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Advanced</p>
                </div>
              </div>

              {/* Table */}
              {!error && (
                <StudyTopicTable
                  topics={topics}
                  loading={loading}
                  searchTerm={searchTerm}
                  difficultyFilter={difficultyFilter}
                  onSearchChange={setSearchTerm}
                  onDifficultyFilterChange={setDifficultyFilter}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              )}
            </motion.div>
          </div>
        </main>
        <Footer />

        {/* Create/Edit Modal */}
        <StudyTopicForm
          visible={showCreateModal && !error}
          editing={!!editingTopic}
          formData={formData}
          saving={saving}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onClose={() => { setShowCreateModal(false); setEditingTopic(null); resetForm(); }}
        />
      </div>
    </PageTransition>
  );
};

export default AdminStudyTopics;
