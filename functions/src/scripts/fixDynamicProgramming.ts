/**
 * Fix script: Delete the bad "Dynamic Gaming" document and replace it
 * with the correct "Dynamic Programming" study topic.
 *
 * Run with:
 *   cd functions
 *   npx ts-node --project tsconfig.json src/scripts/fixDynamicProgramming.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccount = require(path.resolve(__dirname, '../../serviceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const COLLECTION = 'studyTopics';
const ADMIN_UID = '6PoYJdCdqWQYZ66ue6sn6TZcTj33';

async function fix() {
  console.log('=== Fix Dynamic Programming ===\n');

  // 1. Find and delete any docs with topicId "dynamic-programming"
  const snap = await db.collection(COLLECTION).where('topicId', '==', 'dynamic-programming').get();
  for (const doc of snap.docs) {
    console.log(`Deleting bad doc "${doc.data().title}" (id=${doc.id})`);
    await doc.ref.delete();
  }

  // 2. Write the correct Dynamic Programming topic
  const docRef = db.collection(COLLECTION).doc();
  await docRef.set({
    topicId: 'dynamic-programming',
    title: 'Dynamic Programming',
    icon: 'BarChart2',
    description: 'Master DP concepts like memoization, tabulation, and state transitions.',
    difficulty: 'Advanced',
    estimatedTime: '8 hours',
    problems: 20,
    introduction: `Dynamic Programming (DP) is a technique for solving complex problems by breaking them down into simpler subproblems. It's particularly useful when subproblems overlap and have optimal substructure, meaning the optimal solution can be constructed from optimal solutions of its subproblems.`,
    sections: [
      {
        title: 'Introduction to Dynamic Programming',
        content: `Dynamic Programming solves complex problems by breaking them down into simpler overlapping subproblems and storing the results to avoid redundant calculations. Two key properties are required for a problem to be solved with DP:\n\n1. Overlapping Subproblems: The same subproblems are solved multiple times\n2. Optimal Substructure: The optimal solution to the problem contains optimal solutions to subproblems\n\nDP can significantly improve time complexity from exponential to polynomial for many problems.`,
        examples: [
          {
            language: 'JavaScript',
            code: `// Example of a problem with overlapping subproblems: Fibonacci

// Recursive approach (inefficient)
function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// DP approach with memoization
function fibMemoization(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fibMemoization(n - 1, memo) + fibMemoization(n - 2, memo);
  return memo[n];
}

// DP approach with tabulation
function fibTabulation(n) {
  if (n <= 1) return n;
  
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}`,
          },
        ],
      },
      {
        title: 'DP Approaches: Memoization vs. Tabulation',
        content: `There are two main approaches to implementing dynamic programming:\n\n1. Top-down (Memoization):\n   - Start with the original problem and recursively solve subproblems\n   - Store results in a cache (usually a hash map or array)\n   - Only compute each subproblem once\n   - Natural for problems with recursion\n\n2. Bottom-up (Tabulation):\n   - Start from the smallest subproblems and work up to the original problem\n   - Store results in a table (usually an array)\n   - Typically more efficient with memory and eliminates recursion overhead\n   - Often requires more careful thinking about the order of computation\n\nChoosing between these approaches depends on the specific problem and constraints.`,
        examples: [
          {
            language: 'JavaScript',
            code: `// Example: Calculating binomial coefficient C(n,k)

// Top-down with memoization
function binomialCoeffMemo(n, k, memo = {}) {
  // Base cases
  if (k === 0 || k === n) return 1;
  if (k > n) return 0;
  
  // Check if already computed
  const key = n + "," + k;
  if (key in memo) return memo[key];
  
  // Recursive calculation with memoization
  memo[key] = binomialCoeffMemo(n - 1, k - 1, memo) + binomialCoeffMemo(n - 1, k, memo);
  return memo[key];
}

// Bottom-up with tabulation
function binomialCoeffTab(n, k) {
  // Create 2D dp table
  const dp = Array(n + 1).fill().map(() => Array(k + 1).fill(0));
  
  // Fill the table in bottom-up manner
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= Math.min(i, k); j++) {
      // Base cases
      if (j === 0 || j === i) {
        dp[i][j] = 1;
      } else {
        // Use the recursive formula
        dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
      }
    }
  }
  
  return dp[n][k];
}`,
          },
        ],
      },
      {
        title: 'Common DP Patterns',
        content: `Several patterns appear frequently in DP problems:\n\n1. Linear Sequence DP:\n   - 1D array, where dp[i] represents solution for subproblem of size i\n   - Examples: Fibonacci, Climbing Stairs\n\n2. Matrix DP:\n   - 2D array, where dp[i][j] typically represents solution for subproblem up to position (i,j)\n   - Examples: Minimum Path Sum, Unique Paths\n\n3. String DP:\n   - Problems involving operations on strings\n   - Examples: Longest Common Subsequence, Edit Distance\n\n4. Decision Making DP:\n   - Problems requiring decisions at each step\n   - Examples: Buy/Sell Stock, House Robber\n\n5. Interval DP:\n   - Problems where the state involves intervals\n   - Examples: Matrix Chain Multiplication, Burst Balloons`,
        examples: [
          {
            language: 'JavaScript',
            code: `// Linear Sequence DP: Maximum Subarray Sum
function maxSubarraySum(nums) {
  if (nums.length === 0) return 0;
  
  let maxSoFar = nums[0];
  let maxEndingHere = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // Either extend previous subarray or start a new one
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  
  return maxSoFar;
}

// Matrix DP: Minimum Path Sum
function minPathSum(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const dp = Array(m).fill().map(() => Array(n).fill(0));
  
  // Initialize first cell
  dp[0][0] = grid[0][0];
  
  // Initialize first row
  for (let j = 1; j < n; j++) {
    dp[0][j] = dp[0][j-1] + grid[0][j];
  }
  
  // Initialize first column
  for (let i = 1; i < m; i++) {
    dp[i][0] = dp[i-1][0] + grid[i][0];
  }
  
  // Fill dp table
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1]) + grid[i][j];
    }
  }
  
  return dp[m-1][n-1];
}`,
          },
        ],
      },
      {
        title: 'State Transition and Optimization',
        content: `Designing a DP solution involves:\n\n1. Defining the state: What information do we need to represent a subproblem?\n2. Establishing the recurrence relation: How do we relate a state to its subproblems?\n3. Identifying the base cases: What are the smallest subproblems with known answers?\n4. Determining the state transition: How do we iterate through states?\n5. Optimizing space (optional): Can we reduce the memory usage?\n\nSpace optimization is often possible when the current state only depends on a few previous states.`,
        examples: [
          {
            language: 'JavaScript',
            code: `// Knapsack Problem with space optimization
function knapsack(weights, values, capacity) {
  const n = weights.length;
  
  // Original 2D approach would use dp[n+1][capacity+1]
  // Space-optimized approach only uses 1D array
  const dp = Array(capacity + 1).fill(0);
  
  for (let i = 0; i < n; i++) {
    // We iterate backward to avoid using updated values
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  
  return dp[capacity];
}

// Longest Increasing Subsequence (LIS)
function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  
  const n = nums.length;
  const dp = Array(n).fill(1); // minimum LIS length is 1
  
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  
  return Math.max(...dp);
}`,
          },
        ],
      },
    ],
    practiceProblems: [
      { id: 11, title: 'Maximum Subarray', difficulty: 'Easy' },
      { id: 12, title: 'Climbing Stairs', difficulty: 'Easy' },
      { id: 20, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
      { id: 23, title: 'Jump Game', difficulty: 'Medium' },
      { id: 25, title: 'Unique Paths', difficulty: 'Medium' },
      { id: 27, title: 'Minimum Path Sum', difficulty: 'Medium' },
      { id: 10, title: 'Regular Expression Matching', difficulty: 'Hard' },
    ],
    createdBy: ADMIN_UID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Created correct "Dynamic Programming" topic (docId=${docRef.id})`);
  console.log('\nDone!');
  process.exit(0);
}

fix().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
