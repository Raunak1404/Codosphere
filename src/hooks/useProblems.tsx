import { useState, useEffect, useCallback } from 'react';
import { getPublicProblems, AdminProblem } from '../services/firebase';
import { codingProblems, getProblemById as getStaticProblemById } from '../data/codingProblems';

// Hook to manage problems from both static and dynamic sources
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
      // Try to load problems from Firebase
      const dynamicProblems = await getPublicProblems();
      
      let allProblems = [...codingProblems]; // Start with static problems
      
      if (dynamicProblems && dynamicProblems.length > 0) {
        // Convert dynamic problems to match the expected format
        const formattedDynamicProblems = dynamicProblems.map((problem: AdminProblem, index: number) => ({
          id: problem.numericId || (10000 + index), // Use numericId or generate one starting from 10000 to avoid conflicts
          title: problem.title,
          difficulty: problem.difficulty,
          description: problem.description,
          examples: problem.examples || [],
          constraints: problem.constraints || [],
          tags: problem.tags || [],
          testCases: problem.testCases || [],
          functionMeta: problem.functionMeta || undefined,
          starterCode: problem.starterCode || undefined,
          solved: false, // This will be determined by user data
          firebaseId: problem.id // Keep reference to Firebase document ID
        }));
        
        // Merge Firebase problems with static problems, making sure IDs don't conflict
        // First check for potential ID conflicts
        const staticIds = new Set(codingProblems.map(p => p.id));
        const formattedWithUniqueIds = formattedDynamicProblems.map(problem => {
          if (staticIds.has(problem.id)) {
            // If ID conflict, assign a new ID
            return { 
              ...problem, 
              id: Math.max(...Array.from(staticIds)) + 1000 + Math.floor(Math.random() * 1000) 
            };
          }
          return problem;
        });
        
        // Merge static and dynamic problems
        allProblems = [...codingProblems, ...formattedWithUniqueIds];
        
        console.log("Loaded combined problem set:", allProblems.length, 
          "(" + codingProblems.length + " static, " + formattedDynamicProblems.length + " from Firebase)");
      } else {
        console.log("No Firebase problems found, using only static problems");
      }
      
      setProblems(allProblems);
    } catch (err: any) {
      console.error('Error loading problems:', err);
      setError(err.message);
      // Fallback to static problems on error
      console.log("Error loading Firebase problems, using only static problems");
      setProblems(codingProblems);
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
    
    // If still not found, try the static problems directly as fallback
    if (!problem) {
      problem = getStaticProblemById(numericId);
    }
    
    return problem || null;
  }, [problems]);

  return {
    problems,
    loading,
    error,
    getProblemById,
    refetch: loadProblems
  };
};

// Export individual functions for backward compatibility
export const getDynamicProblemById = (id: string | number): Promise<any> => {
  return new Promise(async (resolve) => {
    try {
      // First try to get from Firebase
      const problems = await getPublicProblems();
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      let problem = problems.find((p: AdminProblem, index: number) => 
        (p.numericId || (10000 + index)) === numericId
      );
      
      if (!problem && typeof id === 'string') {
        problem = problems.find((p: AdminProblem) => p.id === id);
      }
      
      if (problem) {
        const formattedProblem = {
          id: problem.numericId || numericId,
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
          firebaseId: problem.id
        };
        resolve(formattedProblem);
      } else {
        // Fallback to static problems
        const staticProblem = getStaticProblemById(numericId);
        resolve(staticProblem || null);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      // Fallback to static problems
      const staticProblem = getStaticProblemById(typeof id === 'string' ? parseInt(id, 10) : id);
      resolve(staticProblem || null);
    }
  });
};