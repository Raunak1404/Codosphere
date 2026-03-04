import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, FileText, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface ProblemTableProps {
  problems: AdminProblem[];
  loading: boolean;
  searchTerm: string;
  difficultyFilter: string;
  onSearchChange: (value: string) => void;
  onDifficultyFilterChange: (value: string) => void;
  onEdit: (problem: AdminProblem) => void;
  onDelete: (problemId: string) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'text-green-400 bg-green-400';
    case 'Medium': return 'text-yellow-400 bg-yellow-400';
    case 'Hard': return 'text-red-400 bg-red-400';
    default: return 'text-gray-400 bg-gray-400';
  }
};

const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  loading,
  searchTerm,
  difficultyFilter,
  onSearchChange,
  onDifficultyFilterChange,
  onEdit,
  onDelete,
}) => {
  const problemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = !difficultyFilter || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, difficultyFilter]);

  // Clamp page if it exceeds total after data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredProblems.length, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
              placeholder="Search problems..."
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
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
                {currentProblems.map((problem) => (
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
                      {problem.createdAt && problem.createdAt.toDate
                        ? problem.createdAt.toDate().toLocaleDateString()
                        : 'Unknown'}
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
                          onClick={() => onEdit(problem)}
                          className="p-2 hover:bg-[var(--accent)] hover:bg-opacity-20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(problem.id!)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3 mt-2">
                <div className="text-xs text-[var(--text-secondary)]">
                  Showing <span className="font-medium text-[var(--text)]">{indexOfFirstProblem + 1}</span> to{' '}
                  <span className="font-medium text-[var(--text)]">
                    {Math.min(indexOfLastProblem, filteredProblems.length)}
                  </span>{' '}
                  of <span className="font-medium text-[var(--text)]">{filteredProblems.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'text-white/20 cursor-not-allowed'
                        : 'text-[var(--text-secondary)] hover:bg-white/[0.06]'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
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
                      currentPage === totalPages
                        ? 'text-white/20 cursor-not-allowed'
                        : 'text-[var(--text-secondary)] hover:bg-white/[0.06]'
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

export default ProblemTable;
