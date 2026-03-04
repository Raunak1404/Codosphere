import React, { useState, useEffect } from 'react';
import {
  Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight,
  BookOpen, Code, ListTree, FileText, BarChart2, Network, Layers, GitBranch,
  Clock, Target, Copy,
} from 'lucide-react';

interface AdminStudyTopic {
  id?: string;
  topicId: string;
  title: string;
  icon: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  problems: number;
  introduction: string;
  sections: any[];
  practiceProblems: any[];
  createdAt?: any;
  updatedAt?: any;
}

interface StudyTopicTableProps {
  topics: AdminStudyTopic[];
  loading: boolean;
  searchTerm: string;
  difficultyFilter: string;
  onSearchChange: (value: string) => void;
  onDifficultyFilterChange: (value: string) => void;
  onEdit: (topic: AdminStudyTopic) => void;
  onDelete: (topicId: string) => void;
  onDuplicate: (topic: AdminStudyTopic) => void;
}

const getIconComponent = (iconName: string, size = 18) => {
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

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'text-emerald-400 bg-emerald-400/15';
    case 'Intermediate': return 'text-amber-400 bg-amber-400/15';
    case 'Advanced': return 'text-rose-400 bg-rose-400/15';
    default: return 'text-gray-400 bg-gray-400/15';
  }
};

const StudyTopicTable: React.FC<StudyTopicTableProps> = ({
  topics,
  loading,
  searchTerm,
  difficultyFilter,
  onSearchChange,
  onDifficultyFilterChange,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const topicsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.topicId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !difficultyFilter || topic.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTopics.length / topicsPerPage);
  const indexOfLast = currentPage * topicsPerPage;
  const indexOfFirst = indexOfLast - topicsPerPage;
  const currentTopics = filteredTopics.slice(indexOfFirst, indexOfLast);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, difficultyFilter]);
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [filteredTopics.length, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      {/* Filters */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[var(--text-secondary)]" />
            <select
              value={difficultyFilter}
              onChange={(e) => onDifficultyFilterChange(e.target.value)}
              className="px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Study Topics ({filteredTopics.length})</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Topic</th>
                  <th className="text-left py-3 px-4">Level</th>
                  <th className="text-left py-3 px-4">Sections</th>
                  <th className="text-left py-3 px-4">Problems</th>
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTopics.map((topic) => (
                  <tr key={topic.id} className="border-b border-gray-800 hover:bg-[var(--primary)] hover:bg-opacity-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shrink-0">
                          {getIconComponent(topic.icon, 16)}
                        </div>
                        <div>
                          <div className="font-medium">{topic.title}</div>
                          <div className="text-[10px] text-[var(--text-secondary)] font-mono">/study/{topic.topicId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyStyle(topic.difficulty)}`}>
                        {topic.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Layers size={13} />
                        {topic.sections.length}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Target size={13} />
                        {topic.practiceProblems.length}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {topic.estimatedTime}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">
                      {topic.createdAt && topic.createdAt.toDate
                        ? topic.createdAt.toDate().toLocaleDateString()
                        : 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => window.open(`/study/${topic.topicId}`, '_blank')}
                          className="p-2 hover:bg-[var(--accent)] hover:bg-opacity-20 rounded-lg transition-colors"
                          title="Preview in user view"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onDuplicate(topic)}
                          className="p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-colors text-blue-400"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(topic)}
                          className="p-2 hover:bg-[var(--accent)] hover:bg-opacity-20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(topic.id!)}
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

            {filteredTopics.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[var(--text-secondary)]">No study topics found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3 mt-2">
                <div className="text-xs text-[var(--text-secondary)]">
                  Showing <span className="font-medium text-[var(--text)]">{indexOfFirst + 1}</span> to{' '}
                  <span className="font-medium text-[var(--text)]">{Math.min(indexOfLast, filteredTopics.length)}</span>{' '}
                  of <span className="font-medium text-[var(--text)]">{filteredTopics.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-lg transition-colors ${
                      currentPage === 1 ? 'text-white/20 cursor-not-allowed' : 'text-[var(--text-secondary)] hover:bg-white/[0.06]'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20'
                            : 'text-[var(--text-secondary)] hover:bg-white/[0.06]'
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
                      currentPage === totalPages ? 'text-white/20 cursor-not-allowed' : 'text-[var(--text-secondary)] hover:bg-white/[0.06]'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default StudyTopicTable;
