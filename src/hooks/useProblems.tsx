import { useState, useEffect, useCallback } from 'react';
import { getPublicProblems, AdminProblem } from '../services/firebase';

/**
 * Format a Firestore AdminProblem into the shape the rest of the app expects.
 * Assigns a stable numeric ID derived from the Firestore doc ID so existing
 * components (navigation, URL params, solved-tracking) continue to work.
 */
const formatProblem = (problem: AdminProblem, index: number) => ({
  id: problem.numericId || (1000 + index),
  title: problem.title,
  difficulty: problem.difficulty,
  description: problem.description,
  examples: problem.examples || [],
  constraints: problem.constraints || [],
  tags: problem.tags || [],
  testCases: problem.testCases || [],
  functionMeta: problem.functionMeta || undefined,
  starterCode: problem.starterCode || undefined,
  solved: false,
  firebaseId: problem.id,
});

// Hook to manage problems from Firestore
export const useProblems = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    setLoading(true);
    setError(null);

    try {
      const firebaseProblems = await getPublicProblems();

      if (firebaseProblems && firebaseProblems.length > 0) {
        const formatted = firebaseProblems.map(formatProblem);
        setProblems(formatted);
        console.log(`Loaded ${formatted.length} problems from Firebase`);
      } else {
        console.warn('No problems found in Firestore');
        setProblems([]);
      }
    } catch (err: any) {
      console.error('Error loading problems:', err);
      setError(err.message);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  // Get problem by ID (supports both numeric and Firebase IDs)
  // Memoized to prevent re-renders from resetting the code editor
  const getProblemById = useCallback((id: string | number): any => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    // First try to find by numeric ID
    let problem = problems.find(p => p.id === numericId);

    // If not found and it's a string, try to find by Firebase ID
    if (!problem && typeof id === 'string') {
      problem = problems.find(p => p.firebaseId === id);
    }

    return problem || null;
  }, [problems]);

  return {
    problems,
    loading,
    error,
    getProblemById,
    refetch: loadProblems,
  };
};

// Export individual functions for backward compatibility
export const getDynamicProblemById = (id: string | number): Promise<any> => {
  return new Promise(async (resolve) => {
    try {
      const problems = await getPublicProblems();
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

      let problem = problems.find((p: AdminProblem, index: number) =>
        (p.numericId || (1000 + index)) === numericId
      );

      if (!problem && typeof id === 'string') {
        problem = problems.find((p: AdminProblem) => p.id === id);
      }

      if (problem) {
        resolve(formatProblem(problem, 0));
      } else {
        resolve(null);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      resolve(null);
    }
  });
};