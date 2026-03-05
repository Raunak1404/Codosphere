/**
 * One-time seed script to migrate all hardcoded study topics
 * into Firestore's `studyTopics` collection.
 *
 * Each document matches the EXACT format used by the admin dashboard's
 * StudyTopicForm / adminCreateStudyTopic cloud function.
 *
 * Run with:
 *   cd functions
 *   npx ts-node --project tsconfig.json src/scripts/seedStudyTopics.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

// ── Initialize Firebase Admin with service account ──────────────────────────
const serviceAccount = require(path.resolve(__dirname, '../../serviceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const STUDY_TOPICS_COLLECTION = 'studyTopics';
const ADMIN_UID = '6PoYJdCdqWQYZ66ue6sn6TZcTj33'; // same admin UID used in bootstrapAdmin

// ── Types (mirrors AdminStudyTopic from services/firebase/studyTopics.ts) ───

interface TopicSection {
  title: string;
  content: string;
  examples?: {
    language: string;
    code: string;
  }[];
}

interface PracticeProblem {
  id: number;
  title: string;
  difficulty: string;
}

interface StudyTopicDoc {
  topicId: string;
  title: string;
  icon: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  problems: number;
  introduction: string;
  sections: TopicSection[];
  practiceProblems: PracticeProblem[];
  createdBy: string;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
}

// ── Study Topics Data ───────────────────────────────────────────────────────

const studyTopics: StudyTopicDoc[] = [
  // ─── 1. Arrays ────────────────────────────────────────────────────────────
  {
    topicId: 'arrays',
    title: 'Arrays',
    icon: 'Code',
    description: 'Learn about arrays, sorting, searching, and manipulation techniques.',
    difficulty: 'Beginner',
    estimatedTime: '3 hours',
    problems: 24,
    introduction: "Arrays are one of the most fundamental data structures in computer science. They store elements of the same type in contiguous memory locations, allowing for constant-time access to any element using its index. This topic covers array manipulation, searching, sorting, and common array-based algorithms.",
    sections: [
      {
        title: "Introduction to Arrays",
        content: "Arrays provide a way to store multiple values of the same type under a single variable name. They are indexed, meaning each element can be accessed directly using its position number. Arrays are fixed in size in many languages, though dynamic arrays (like ArrayList in Java or vector in C++) can grow as needed.\n\nKey characteristics of arrays include:\n\n- Constant-time access (O(1))\n- Elements stored in contiguous memory\n- Fixed size in many languages\n- Efficient iteration\n- Can be single or multi-dimensional",
        examples: [
          {
            language: "JavaScript",
            code: "// Declaring and initializing an array\nconst numbers = [1, 2, 3, 4, 5];\n\n// Accessing elements\nconst firstElement = numbers[0]; // 1\nconst thirdElement = numbers[2]; // 3\n\n// Modifying elements\nnumbers[4] = 10; // [1, 2, 3, 4, 10]\n\n// Array length\nconst length = numbers.length; // 5"
          }
        ]
      },
      {
        title: "Array Operations",
        content: "Common operations on arrays include insertion, deletion, searching, and traversal. The time complexity of these operations varies depending on the specific requirements.\n\n- Accessing: O(1)\n- Insertion at the end (amortized): O(1)\n- Insertion at a specific position: O(n)\n- Deletion at the end: O(1)\n- Deletion at a specific position: O(n)\n- Searching (unsorted array): O(n)\n- Searching (sorted array): O(log n) using binary search",
        examples: [
          {
            language: "JavaScript",
            code: "// Insertion at the end\nnumbers.push(6); // [1, 2, 3, 4, 10, 6]\n\n// Insertion at a specific position\nnumbers.splice(2, 0, 7); // [1, 2, 7, 3, 4, 10, 6]\n\n// Deletion at the end\nnumbers.pop(); // [1, 2, 7, 3, 4, 10]\n\n// Deletion at a specific position\nnumbers.splice(3, 1); // [1, 2, 7, 4, 10]\n\n// Searching\nconst index = numbers.indexOf(7); // 2"
          }
        ]
      },
      {
        title: "Array Traversal",
        content: "Traversing an array means visiting each element exactly once. There are several ways to traverse an array:\n\n1. Using a for loop with an index\n2. Using a for-of loop (in languages that support it)\n3. Using forEach or map methods (in languages with functional programming features)\n4. Using iterators",
        examples: [
          {
            language: "JavaScript",
            code: "// Using a for loop\nfor (let i = 0; i < numbers.length; i++) {\n  console.log(numbers[i]);\n}\n\n// Using for-of loop\nfor (const num of numbers) {\n  console.log(num);\n}\n\n// Using forEach\nnumbers.forEach(num => {\n  console.log(num);\n});\n\n// Using map to transform each element\nconst doubled = numbers.map(num => num * 2);"
          }
        ]
      },
      {
        title: "Common Array Problems",
        content: "Arrays are used in many classic algorithms and interview problems. Some common array-based problems include:\n\n1. Finding the maximum/minimum element\n2. Finding the second largest element\n3. Checking if an array is sorted\n4. Removing duplicates\n5. Finding pairs with a given sum (Two Sum problem)\n6. Rotating an array\n7. Finding the majority element\n8. Kadane's algorithm for maximum subarray sum",
        examples: [
          {
            language: "JavaScript",
            code: "// Finding the maximum element\nfunction findMax(arr) {\n  let max = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] > max) {\n      max = arr[i];\n    }\n  }\n  return max;\n}\n\n// Two Sum problem\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}"
          }
        ]
      }
    ],
    practiceProblems: [
      { id: 1, title: "Two Sum", difficulty: "Easy" },
      { id: 11, title: "Maximum Subarray", difficulty: "Easy" },
      { id: 20, title: "Best Time to Buy and Sell Stock", difficulty: "Easy" },
      { id: 13, title: "3Sum", difficulty: "Medium" },
      { id: 6, title: "Container With Most Water", difficulty: "Medium" },
      { id: 21, title: "Rotate Image", difficulty: "Medium" },
      { id: 24, title: "Find First and Last Position of Element in Sorted Array", difficulty: "Medium" },
      { id: 8, title: "Trapping Rain Water", difficulty: "Hard" }
    ],
    createdBy: ADMIN_UID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // ─── 2. Binary Trees ─────────────────────────────────────────────────────
  {
    topicId: 'binary-trees',
    title: 'Binary Trees',
    icon: 'Layers',
    description: 'Tree traversals, balancing, and common tree operations.',
    difficulty: 'Intermediate',
    estimatedTime: '6 hours',
    problems: 16,
    introduction: "Binary trees are hierarchical data structures where each node has at most two children, referred to as the left child and right child. They are used in various applications, including search algorithms, expression parsing, and hierarchical data representation.",
    sections: [
      {
        title: "Binary Tree Fundamentals",
        content: "A binary tree is composed of nodes, where each node contains a value and references to its left and right children. The topmost node is called the root. Nodes without children are called leaves.\n\nImportant terms in binary trees:\n\n- Root: The topmost node\n- Parent/Child: Relationship between connected nodes\n- Leaf: Node with no children\n- Height: Maximum distance from root to any leaf\n- Depth: Distance from a node to the root\n- Balanced tree: Heights of left and right subtrees differ by at most one",
        examples: [
          {
            language: "JavaScript",
            code: "// Binary Tree Node definition\nclass TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}\n\n// Creating a simple binary tree\nconst root = new TreeNode(1);\nroot.left = new TreeNode(2);\nroot.right = new TreeNode(3);\nroot.left.left = new TreeNode(4);\nroot.left.right = new TreeNode(5);"
          }
        ]
      },
      {
        title: "Tree Traversals",
        content: "Tree traversals are algorithms to visit all nodes in a tree. There are several traversal methods:\n\n1. Depth-First Traversals:\n   - Pre-order: Visit root, then left subtree, then right subtree (Root-Left-Right)\n   - In-order: Visit left subtree, then root, then right subtree (Left-Root-Right)\n   - Post-order: Visit left subtree, then right subtree, then root (Left-Right-Root)\n\n2. Breadth-First Traversal (Level Order):\n   - Visit all nodes at the same level before moving to the next level",
        examples: [
          {
            language: "JavaScript",
            code: "// Pre-order traversal (Root-Left-Right)\nfunction preorderTraversal(root) {\n  if (!root) return [];\n  const result = [];\n  \n  function dfs(node) {\n    if (!node) return;\n    \n    // Root\n    result.push(node.val);\n    \n    // Left\n    dfs(node.left);\n    \n    // Right\n    dfs(node.right);\n  }\n  \n  dfs(root);\n  return result;\n}\n\n// In-order traversal (Left-Root-Right)\nfunction inorderTraversal(root) {\n  if (!root) return [];\n  const result = [];\n  \n  function dfs(node) {\n    if (!node) return;\n    \n    // Left\n    dfs(node.left);\n    \n    // Root\n    result.push(node.val);\n    \n    // Right\n    dfs(node.right);\n  }\n  \n  dfs(root);\n  return result;\n}\n\n// Level order traversal (BFS)\nfunction levelOrderTraversal(root) {\n  if (!root) return [];\n  \n  const result = [];\n  const queue = [root];\n  \n  while (queue.length > 0) {\n    const level = [];\n    const levelSize = queue.length;\n    \n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      level.push(node.val);\n      \n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    \n    result.push(level);\n  }\n  \n  return result;\n}"
          }
        ]
      },
      {
        title: "Binary Search Trees (BST)",
        content: "A Binary Search Tree is a special type of binary tree where:\n\n- The left subtree of a node contains only nodes with keys less than the node's key\n- The right subtree of a node contains only nodes with keys greater than the node's key\n- Both the left and right subtrees must also be binary search trees\n\nBSTs provide efficient operations for search, insertion, and deletion with an average time complexity of O(log n) when the tree is balanced.",
        examples: [
          {
            language: "JavaScript",
            code: "// BST Node definition (same as regular TreeNode)\nclass TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}\n\n// BST Search operation\nfunction search(root, key) {\n  // Base cases: root is null or key is present at root\n  if (root === null || root.val === key)\n    return root;\n    \n  // Key is greater than root's key\n  if (root.val < key)\n    return search(root.right, key);\n    \n  // Key is smaller than root's key\n  return search(root.left, key);\n}\n\n// BST Insert operation\nfunction insert(root, key) {\n  // If the tree is empty, return a new node\n  if (root === null) {\n    return new TreeNode(key);\n  }\n  \n  // Otherwise, recur down the tree\n  if (key < root.val)\n    root.left = insert(root.left, key);\n  else if (key > root.val)\n    root.right = insert(root.right, key);\n    \n  // Return the (unchanged) node pointer\n  return root;\n}"
          }
        ]
      },
      {
        title: "Tree Balancing",
        content: "In a balanced tree, the height of the left and right subtrees of any node differ by at most 1. This balance ensures O(log n) operations.\n\nWhen trees become unbalanced, operations can degrade to O(n) time complexity in the worst case. Several self-balancing tree structures exist:\n\n- AVL Trees: Strictly balanced, with rotations after insertion/deletion\n- Red-Black Trees: Approximately balanced, used in many language libraries\n- B-trees: Used in databases and file systems\n\nBalancing operations typically involve rotations (left rotation, right rotation, or combinations) to redistribute nodes while maintaining the BST property.",
        examples: [
          {
            language: "JavaScript",
            code: "// Function to get height of a node\nfunction height(node) {\n  if (node === null)\n    return 0;\n  return Math.max(height(node.left), height(node.right)) + 1;\n}\n\n// Get balance factor of a node\nfunction getBalance(node) {\n  if (node === null)\n    return 0;\n  return height(node.left) - height(node.right);\n}\n\n// Right rotation\nfunction rightRotate(y) {\n  const x = y.left;\n  const T2 = x.right;\n\n  // Perform rotation\n  x.right = y;\n  y.left = T2;\n\n  return x;\n}\n\n// Left rotation\nfunction leftRotate(x) {\n  const y = x.right;\n  const T2 = y.left;\n\n  // Perform rotation\n  y.left = x;\n  x.right = T2;\n\n  return y;\n}"
          }
        ]
      }
    ],
    practiceProblems: [
      { id: 14, title: "Binary Tree Level Order Traversal", difficulty: "Medium" },
      { id: 101, title: "Maximum Depth of Binary Tree", difficulty: "Easy" },
      { id: 102, title: "Symmetric Tree", difficulty: "Easy" },
      { id: 103, title: "Binary Tree Level Order Traversal", difficulty: "Medium" },
      { id: 104, title: "Validate Binary Search Tree", difficulty: "Medium" },
      { id: 105, title: "Binary Tree Maximum Path Sum", difficulty: "Hard" },
      { id: 17, title: "Serialize and Deserialize Binary Tree", difficulty: "Hard" }
    ],
    createdBy: ADMIN_UID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // ─── 3. Backtracking ─────────────────────────────────────────────────────
  {
    topicId: 'backtracking',
    title: 'Backtracking',
    icon: 'GitBranch',
    description: 'Learn to solve complex problems using backtracking algorithms.',
    difficulty: 'Advanced',
    estimatedTime: '7 hours',
    problems: 14,
    introduction: "Backtracking is an algorithmic technique for solving problems recursively by trying to build a solution incrementally, one piece at a time, and abandoning a path as soon as it determines that the path cannot lead to a valid solution. It's particularly useful for constraint satisfaction problems, combinatorial optimization, and puzzles.",
    sections: [
      {
        title: "Introduction to Backtracking",
        content: "Backtracking is a systematic way to explore all potential solutions to a problem. It follows a depth-first search approach, going as deep as possible along each branch before backtracking.\n\nKey principles of backtracking:\n\n1. **Choose:** Select a candidate for the solution.\n2. **Explore:** Recursively search deeper with this choice.\n3. **Unchoose:** If the choice doesn't lead to a solution, undo it and try other choices.\n\nBacktracking is more efficient than brute force because it eliminates many candidate solutions without fully exploring them, a technique known as pruning.",
        examples: [
          {
            language: "JavaScript",
            code: "// General backtracking template\nfunction backtrack(candidate, choices) {\n  // Base case: solution found\n  if (isValidSolution(candidate)) {\n    return candidate; // or collect the solution\n  }\n  \n  // Try each available choice\n  for (const choice of choices) {\n    if (isValid(candidate, choice)) {\n      // Make a choice\n      addToCandidate(candidate, choice);\n      \n      // Explore further\n      const result = backtrack(candidate, remainingChoices(choices, choice));\n      if (result) return result; // Solution found\n      \n      // Backtrack (undo the choice)\n      removeFromCandidate(candidate, choice);\n    }\n  }\n  \n  // No solution found in this path\n  return null;\n}"
          }
        ]
      },
      {
        title: "Classic Backtracking Problems",
        content: "Backtracking is the algorithm of choice for many classic problems:\n\n1. **N-Queens Problem:** Place N queens on an N×N chessboard so that no two queens threaten each other.\n\n2. **Sudoku Solver:** Fill a 9×9 grid with digits so that each column, row, and 3×3 section contain all digits from 1 to 9.\n\n3. **Permutations and Combinations:** Generate all possible arrangements or selections from a set.\n\n4. **Subset Sum:** Find a subset of elements that sum to a specific target.\n\n5. **Graph Coloring:** Assign colors to vertices so that no adjacent vertices have the same color.\n\nThese problems share the characteristic that making a single choice constrains future choices.",
        examples: [
          {
            language: "JavaScript",
            code: "// N-Queens problem\nfunction solveNQueens(n) {\n  const result = [];\n  const board = Array(n).fill().map(() => Array(n).fill('.'));\n  \n  function backtrack(row) {\n    // Base case: All queens placed\n    if (row === n) {\n      const solution = board.map(row => row.join(''));\n      result.push(solution);\n      return;\n    }\n    \n    // Try placing queen in each column of current row\n    for (let col = 0; col < n; col++) {\n      if (isValid(board, row, col, n)) {\n        // Place queen\n        board[row][col] = 'Q';\n        \n        // Move to next row\n        backtrack(row + 1);\n        \n        // Backtrack\n        board[row][col] = '.';\n      }\n    }\n  }\n  \n  // Check if placing a queen at (row, col) is valid\n  function isValid(board, row, col, n) {\n    // Check column\n    for (let i = 0; i < row; i++) {\n      if (board[i][col] === 'Q') return false;\n    }\n    \n    // Check upper-left diagonal\n    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {\n      if (board[i][j] === 'Q') return false;\n    }\n    \n    // Check upper-right diagonal\n    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {\n      if (board[i][j] === 'Q') return false;\n    }\n    \n    return true;\n  }\n  \n  backtrack(0);\n  return result;\n}"
          }
        ]
      },
      {
        title: "Optimization Techniques",
        content: "Several techniques can improve backtracking efficiency:\n\n1. **Early Pruning:** Determine as early as possible if a partial solution cannot lead to a valid solution.\n\n2. **Ordering Heuristics:** Try the most promising choices first based on some heuristic.\n\n3. **Constraint Propagation:** After making a choice, deduce and apply additional constraints to reduce the search space.\n\n4. **Symmetry Breaking:** Avoid exploring symmetric solutions that are essentially the same.\n\n5. **Bit Manipulation:** Use bits to represent state for faster operations in certain problems.\n\nThese optimizations can dramatically reduce the effective search space.",
        examples: [
          {
            language: "JavaScript",
            code: "// Sudoku solver with constraint propagation\nfunction solveSudoku(board) {\n  // Find empty cell\n  function findEmpty() {\n    for (let i = 0; i < 9; i++) {\n      for (let j = 0; j < 9; j++) {\n        if (board[i][j] === '.') {\n          return [i, j];\n        }\n      }\n    }\n    return null; // No empty cell\n  }\n  \n  // Check if number can be placed in cell\n  function isValid(row, col, num) {\n    // Check row\n    for (let j = 0; j < 9; j++) {\n      if (board[row][j] === num) return false;\n    }\n    \n    // Check column\n    for (let i = 0; i < 9; i++) {\n      if (board[i][col] === num) return false;\n    }\n    \n    // Check 3x3 box\n    const boxRow = Math.floor(row / 3) * 3;\n    const boxCol = Math.floor(col / 3) * 3;\n    \n    for (let i = 0; i < 3; i++) {\n      for (let j = 0; j < 3; j++) {\n        if (board[boxRow + i][boxCol + j] === num) return false;\n      }\n    }\n    \n    return true;\n  }\n  \n  // Backtracking function\n  function solve() {\n    const empty = findEmpty();\n    if (!empty) return true; // No empty cell means solved\n    \n    const [row, col] = empty;\n    \n    // Try digits 1-9\n    for (let num = 1; num <= 9; num++) {\n      const strNum = String(num);\n      \n      // Early pruning: check if valid before placing\n      if (isValid(row, col, strNum)) {\n        // Make a choice\n        board[row][col] = strNum;\n        \n        // Recursively try to solve rest of board\n        if (solve()) {\n          return true;\n        }\n        \n        // Backtrack\n        board[row][col] = '.';\n      }\n    }\n    \n    // No solution found with current configuration\n    return false;\n  }\n  \n  solve();\n  return board;\n}"
          }
        ]
      },
      {
        title: "Backtracking vs. Dynamic Programming",
        content: "While both backtracking and dynamic programming (DP) use recursive problem-solving, they apply to different problem types:\n\n**Backtracking:**\n- Used when we need to find all (or any) solutions to a problem\n- Typically explores the entire solution space (though with pruning)\n- Works well for constraint satisfaction and combinatorial problems\n- Usually has exponential time complexity\n\n**Dynamic Programming:**\n- Used when we need to find an optimal solution and there are overlapping subproblems\n- Stores and reuses solutions to subproblems\n- Works well for optimization problems\n- Usually has polynomial time complexity\n\nSome problems can be solved with either approach, but certain characteristics make one more suitable than the other.",
        examples: [
          {
            language: "JavaScript",
            code: "// Subset Sum problem: Backtracking approach\nfunction subsetSumBacktracking(nums, target) {\n  const result = [];\n  \n  function backtrack(start, sum, current) {\n    // Found a valid subset\n    if (sum === target) {\n      result.push([...current]);\n      return;\n    }\n    \n    // Sum exceeded target or reached end of array\n    if (sum > target || start >= nums.length) return;\n    \n    for (let i = start; i < nums.length; i++) {\n      // Skip duplicates in sorted array\n      if (i > start && nums[i] === nums[i-1]) continue;\n      \n      current.push(nums[i]);\n      backtrack(i + 1, sum + nums[i], current);\n      current.pop();\n    }\n  }\n  \n  nums.sort((a, b) => a - b); // Sort for duplicate handling\n  backtrack(0, 0, []);\n  return result;\n}\n\n// Subset Sum problem: Dynamic Programming approach\nfunction subsetSumDP(nums, target) {\n  const dp = Array(target + 1).fill(false);\n  dp[0] = true; // Empty set sums to 0\n  \n  for (const num of nums) {\n    for (let i = target; i >= num; i--) {\n      dp[i] = dp[i] || dp[i - num];\n    }\n  }\n  \n  return dp[target]; // Whether a subset exists that sums to target\n}"
          }
        ]
      }
    ],
    practiceProblems: [
      { id: 15, title: "Word Search", difficulty: "Medium" },
      { id: 26, title: "Permutations", difficulty: "Medium" },
      { id: 28, title: "Palindrome Partitioning", difficulty: "Medium" },
      { id: 30, title: "N-Queens", difficulty: "Hard" },
      { id: 17, title: "Serialize and Deserialize Binary Tree", difficulty: "Hard" }
    ],
    createdBy: ADMIN_UID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // ─── 4. Dynamic Programming ──────────────────────────────────────────────
  {
    topicId: 'dynamic-programming',
    title: 'Dynamic Programming',
    icon: 'BarChart2',
    description: 'Master DP concepts like memoization, tabulation, and state transitions.',
    difficulty: 'Advanced',
    estimatedTime: '8 hours',
    problems: 20,
    introduction: "Dynamic Programming (DP) is a technique for solving complex problems by breaking them down into simpler subproblems. It's particularly useful when subproblems overlap and have optimal substructure, meaning the optimal solution can be constructed from optimal solutions of its subproblems.",
    sections: [
      {
        title: "Introduction to Dynamic Programming",
        content: "Dynamic Programming solves complex problems by breaking them down into simpler overlapping subproblems and storing the results to avoid redundant calculations. Two key properties are required for a problem to be solved with DP:\n\n1. Overlapping Subproblems: The same subproblems are solved multiple times\n2. Optimal Substructure: The optimal solution to the problem contains optimal solutions to subproblems\n\nDP can significantly improve time complexity from exponential to polynomial for many problems.",
        examples: [
          {
            language: "JavaScript",
            code: "// Example of a problem with overlapping subproblems: Fibonacci\n\n// Recursive approach (inefficient)\nfunction fibRecursive(n) {\n  if (n <= 1) return n;\n  return fibRecursive(n - 1) + fibRecursive(n - 2);\n}\n\n// DP approach with memoization\nfunction fibMemoization(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  \n  memo[n] = fibMemoization(n - 1, memo) + fibMemoization(n - 2, memo);\n  return memo[n];\n}\n\n// DP approach with tabulation\nfunction fibTabulation(n) {\n  if (n <= 1) return n;\n  \n  const dp = new Array(n + 1);\n  dp[0] = 0;\n  dp[1] = 1;\n  \n  for (let i = 2; i <= n; i++) {\n    dp[i] = dp[i - 1] + dp[i - 2];\n  }\n  \n  return dp[n];\n}"
          }
        ]
      },
      {
        title: "DP Approaches: Memoization vs. Tabulation",
        content: "There are two main approaches to implementing dynamic programming:\n\n1. Top-down (Memoization):\n   - Start with the original problem and recursively solve subproblems\n   - Store results in a cache (usually a hash map or array)\n   - Only compute each subproblem once\n   - Natural for problems with recursion\n\n2. Bottom-up (Tabulation):\n   - Start from the smallest subproblems and work up to the original problem\n   - Store results in a table (usually an array)\n   - Typically more efficient with memory and eliminates recursion overhead\n   - Often requires more careful thinking about the order of computation\n\nChoosing between these approaches depends on the specific problem and constraints.",
        examples: [
          {
            language: "JavaScript",
            code: "// Example: Calculating binomial coefficient C(n,k)\n\n// Top-down with memoization\nfunction binomialCoeffMemo(n, k, memo = {}) {\n  // Base cases\n  if (k === 0 || k === n) return 1;\n  if (k > n) return 0;\n  \n  // Check if already computed\n  const key = `${n},${k}`;\n  if (key in memo) return memo[key];\n  \n  // Recursive calculation with memoization\n  memo[key] = binomialCoeffMemo(n - 1, k - 1, memo) + binomialCoeffMemo(n - 1, k, memo);\n  return memo[key];\n}\n\n// Bottom-up with tabulation\nfunction binomialCoeffTab(n, k) {\n  // Create 2D dp table\n  const dp = Array(n + 1).fill().map(() => Array(k + 1).fill(0));\n  \n  // Fill the table in bottom-up manner\n  for (let i = 0; i <= n; i++) {\n    for (let j = 0; j <= Math.min(i, k); j++) {\n      // Base cases\n      if (j === 0 || j === i) {\n        dp[i][j] = 1;\n      } else {\n        // Use the recursive formula\n        dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];\n      }\n    }\n  }\n  \n  return dp[n][k];\n}"
          }
        ]
      },
      {
        title: "Common DP Patterns",
        content: "Several patterns appear frequently in DP problems:\n\n1. Linear Sequence DP:\n   - 1D array, where dp[i] represents solution for subproblem of size i\n   - Examples: Fibonacci, Climbing Stairs\n\n2. Matrix DP:\n   - 2D array, where dp[i][j] typically represents solution for subproblem up to position (i,j)\n   - Examples: Minimum Path Sum, Unique Paths\n\n3. String DP:\n   - Problems involving operations on strings\n   - Examples: Longest Common Subsequence, Edit Distance\n\n4. Decision Making DP:\n   - Problems requiring decisions at each step\n   - Examples: Buy/Sell Stock, House Robber\n\n5. Interval DP:\n   - Problems where the state involves intervals\n   - Examples: Matrix Chain Multiplication, Burst Balloons",
        examples: [
          {
            language: "JavaScript",
            code: "// Linear Sequence DP: Maximum Subarray Sum\nfunction maxSubarraySum(nums) {\n  if (nums.length === 0) return 0;\n  \n  let maxSoFar = nums[0];\n  let maxEndingHere = nums[0];\n  \n  for (let i = 1; i < nums.length; i++) {\n    // Either extend previous subarray or start a new one\n    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);\n    maxSoFar = Math.max(maxSoFar, maxEndingHere);\n  }\n  \n  return maxSoFar;\n}\n\n// Matrix DP: Minimum Path Sum\nfunction minPathSum(grid) {\n  const m = grid.length;\n  const n = grid[0].length;\n  const dp = Array(m).fill().map(() => Array(n).fill(0));\n  \n  // Initialize first cell\n  dp[0][0] = grid[0][0];\n  \n  // Initialize first row\n  for (let j = 1; j < n; j++) {\n    dp[0][j] = dp[0][j-1] + grid[0][j];\n  }\n  \n  // Initialize first column\n  for (let i = 1; i < m; i++) {\n    dp[i][0] = dp[i-1][0] + grid[i][0];\n  }\n  \n  // Fill dp table\n  for (let i = 1; i < m; i++) {\n    for (let j = 1; j < n; j++) {\n      dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1]) + grid[i][j];\n    }\n  }\n  \n  return dp[m-1][n-1];\n}"
          }
        ]
      },
      {
        title: "State Transition and Optimization",
        content: "Designing a DP solution involves:\n\n1. Defining the state: What information do we need to represent a subproblem?\n2. Establishing the recurrence relation: How do we relate a state to its subproblems?\n3. Identifying the base cases: What are the smallest subproblems with known answers?\n4. Determining the state transition: How do we iterate through states?\n5. Optimizing space (optional): Can we reduce the memory usage?\n\nSpace optimization is often possible when the current state only depends on a few previous states.",
        examples: [
          {
            language: "JavaScript",
            code: "// Knapsack Problem with space optimization\nfunction knapsack(weights, values, capacity) {\n  const n = weights.length;\n  \n  // Original 2D approach would use dp[n+1][capacity+1]\n  // Space-optimized approach only uses 1D array\n  const dp = Array(capacity + 1).fill(0);\n  \n  for (let i = 0; i < n; i++) {\n    // We iterate backward to avoid using updated values\n    for (let w = capacity; w >= weights[i]; w--) {\n      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);\n    }\n  }\n  \n  return dp[capacity];\n}\n\n// Longest Increasing Subsequence (LIS)\nfunction lengthOfLIS(nums) {\n  if (nums.length === 0) return 0;\n  \n  const n = nums.length;\n  const dp = Array(n).fill(1); // minimum LIS length is 1\n  \n  for (let i = 1; i < n; i++) {\n    for (let j = 0; j < i; j++) {\n      if (nums[i] > nums[j]) {\n        dp[i] = Math.max(dp[i], dp[j] + 1);\n      }\n    }\n  }\n  \n  return Math.max(...dp);\n}"
          }
        ]
      }
    ],
    practiceProblems: [
      { id: 11, title: "Maximum Subarray", difficulty: "Easy" },
      { id: 12, title: "Climbing Stairs", difficulty: "Easy" },
      { id: 20, title: "Best Time to Buy and Sell Stock", difficulty: "Easy" },
      { id: 23, title: "Jump Game", difficulty: "Medium" },
      { id: 25, title: "Unique Paths", difficulty: "Medium" },
      { id: 27, title: "Minimum Path Sum", difficulty: "Medium" },
      { id: 10, title: "Regular Expression Matching", difficulty: "Hard" }
    ],
    createdBy: ADMIN_UID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // ─── 5. Linked Lists ─────────────────────────────────────────────────────
  {
    topicId: 'linked-lists',
    title: 'Linked Lists',
    icon: 'ListTree',
    description: 'Master singly and doubly linked lists, and common operations.',
    difficulty: 'Intermediate',
    estimatedTime: '4 hours',
    problems: 18,
    introduction: "Linked lists are linear data structures where elements are stored in nodes, and each node points to the next node in the sequence. Unlike arrays, linked lists don't require contiguous memory allocation, making them efficient for insertions and deletions but less efficient for random access.",
    sections: [
      {
        title: "Introduction to Linked Lists",
        content: "A linked list is a collection of nodes where each node contains data and a reference (or link) to the next node in the sequence. The last node typically points to null, indicating the end of the list.\n\nTypes of linked lists:\n\n- Singly Linked List: Each node points to the next node\n- Doubly Linked List: Each node has pointers to both next and previous nodes\n- Circular Linked List: The last node points back to the first node instead of null\n\nKey characteristics:\n- Dynamic size (can grow and shrink at runtime)\n- Efficient insertions and deletions (O(1) when position is known)\n- Inefficient random access (O(n) worst case)\n- No wasted memory allocation",
        examples: [
          {
            language: "JavaScript",
            code: "// Singly Linked List Node\nclass ListNode {\n  constructor(val) {\n    this.val = val;\n    this.next = null;\n  }\n}\n\n// Creating a simple linked list: 1 -> 2 -> 3 -> 4\nconst head = new ListNode(1);\nhead.next = new ListNode(2);\nhead.next.next = new ListNode(3);\nhead.next.next.next = new ListNode(4);\n\n// Traversing a linked list\nfunction printList(head) {\n  let current = head;\n  let result = '';\n  \n  while (current !== null) {\n    result += current.val + ' -> ';\n    current = current.next;\n  }\n  \n  result += 'null';\n  console.log(result);\n}"
          }
        ]
      },
      {
        title: "Linked List Operations",
        content: "Common operations on linked lists include:\n\n1. Insertion:\n   - At the beginning (head): O(1)\n   - At the end (tail): O(1) if tail pointer is maintained, otherwise O(n)\n   - At a specific position: O(n) to find position, then O(1) to insert\n\n2. Deletion:\n   - From the beginning: O(1)\n   - From the end: O(n) for singly linked list, O(1) for doubly linked list with tail pointer\n   - From a specific position: O(n) to find position, then O(1) to delete\n\n3. Search: O(n) in the worst case\n\n4. Access: O(n) in the worst case",
        examples: [
          {
            language: "JavaScript",
            code: "// Insert at the beginning\nfunction insertAtHead(head, val) {\n  const newNode = new ListNode(val);\n  newNode.next = head;\n  return newNode; // New head\n}\n\n// Insert at the end\nfunction insertAtTail(head, val) {\n  const newNode = new ListNode(val);\n  \n  // If the list is empty\n  if (head === null) {\n    return newNode;\n  }\n  \n  // Traverse to find the last node\n  let current = head;\n  while (current.next !== null) {\n    current = current.next;\n  }\n  \n  // Append the new node\n  current.next = newNode;\n  return head;\n}\n\n// Delete a node with a given value\nfunction deleteNode(head, val) {\n  // If head node itself holds the value to be deleted\n  if (head !== null && head.val === val) {\n    return head.next;\n  }\n  \n  let current = head;\n  let prev = null;\n  \n  // Search for the node to be deleted\n  while (current !== null && current.val !== val) {\n    prev = current;\n    current = current.next;\n  }\n  \n  // If value wasn't found\n  if (current === null) return head;\n  \n  // Unlink the node from the list\n  prev.next = current.next;\n  \n  return head;\n}"
          }
        ]
      },
      {
        title: "Doubly Linked Lists",
        content: "In a doubly linked list, each node contains references to both the next and previous nodes. This additional pointer allows for more efficient operations at the expense of extra memory:\n\n- Advantages:\n  - Bidirectional traversal\n  - O(1) deletion from the end if the tail pointer is maintained\n  - O(1) insertion before a known node\n\n- Disadvantages:\n  - Additional memory for the prev pointer\n  - More complex implementation",
        examples: [
          {
            language: "JavaScript",
            code: "// Doubly Linked List Node\nclass DoublyListNode {\n  constructor(val) {\n    this.val = val;\n    this.next = null;\n    this.prev = null;\n  }\n}\n\n// Creating a doubly linked list\nfunction createDoublyLinkedList(values) {\n  if (!values.length) return null;\n  \n  const head = new DoublyListNode(values[0]);\n  let current = head;\n  \n  for (let i = 1; i < values.length; i++) {\n    const newNode = new DoublyListNode(values[i]);\n    current.next = newNode;\n    newNode.prev = current;\n    current = newNode;\n  }\n  \n  return head;\n}\n\n// Inserting a node after a given node\nfunction insertAfter(node, val) {\n  if (node === null) return new DoublyListNode(val);\n  \n  const newNode = new DoublyListNode(val);\n  newNode.next = node.next;\n  newNode.prev = node;\n  \n  if (node.next !== null) {\n    node.next.prev = newNode;\n  }\n  \n  node.next = newNode;\n  return newNode;\n}"
          }
        ]
      },
      {
        title: "Common Linked List Problems",
        content: "Linked lists are frequently used in interview questions due to their versatility. Common problems include:\n\n1. Detecting cycles in a linked list (Floyd's Cycle Detection Algorithm)\n2. Finding the middle element\n3. Reversing a linked list\n4. Merging two sorted lists\n5. Removing duplicates\n6. Finding the intersection of two linked lists\n7. Checking if a linked list is a palindrome",
        examples: [
          {
            language: "JavaScript",
            code: "// Detecting a cycle using Floyd's Cycle Detection Algorithm\nfunction hasCycle(head) {\n  if (!head || !head.next) return false;\n  \n  let slow = head;\n  let fast = head;\n  \n  while (fast !== null && fast.next !== null) {\n    slow = slow.next;         // Move one step\n    fast = fast.next.next;    // Move two steps\n    \n    if (slow === fast) return true;  // Cycle detected\n  }\n  \n  return false; // No cycle\n}\n\n// Reversing a linked list\nfunction reverseList(head) {\n  let prev = null;\n  let current = head;\n  let next = null;\n  \n  while (current !== null) {\n    // Store next node\n    next = current.next;\n    \n    // Reverse the link\n    current.next = prev;\n    \n    // Move pointers one position ahead\n    prev = current;\n    current = next;\n  }\n  \n  return prev; // New head of the reversed list\n}"
          }
        ]
      }
    ],
    practiceProblems: [
      { id: 3, title: "Merge Two Sorted Lists", difficulty: "Easy" },
      { id: 19, title: "Reverse Linked List", difficulty: "Easy" },
      { id: 4, title: "Add Two Numbers", difficulty: "Medium" },
      { id: 7, title: "Merge k Sorted Lists", difficulty: "Hard" },
      { id: 18, title: "LRU Cache", difficulty: "Medium" }
    ],
    createdBy: ADMIN_UID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // ─── 6. Strings ──────────────────────────────────────────────────────────
  {
    topicId: 'strings',
    title: 'Strings',
    icon: 'FileText',
    description: 'String manipulation, pattern matching, and common algorithms.',
    difficulty: 'Beginner',
    estimatedTime: '3 hours',
    problems: 22,
    introduction: "Strings are sequences of characters and one of the most commonly used data types. String manipulation is fundamental to many programming tasks and plays a crucial role in areas like text processing, parsing, and pattern matching.",
    sections: [
      {
        title: "String Basics",
        content: "Strings are sequences of characters represented in memory. In most programming languages, strings can be enclosed in single quotes (''), double quotes (\"\"), or backticks (``). Different languages handle strings differently:\n\n- Some languages treat strings as primitive immutable types (like Java, JavaScript)\n- Others treat them as arrays of characters (like C)\n- Some provide rich string-specific libraries and methods\n\nCommon string operations include:\n- Concatenation (joining strings)\n- Substring extraction\n- Finding the length\n- Comparing strings\n- Searching for substrings",
        examples: [
          {
            language: "JavaScript",
            code: "// String creation\nconst str1 = 'Hello';\nconst str2 = \"World\";\nconst name = \"Alice\";\nconst greeting = `Hello, ${name}!`; // Template string with interpolation\n\n// String concatenation\nconst fullGreeting = str1 + \", \" + str2 + \"!\";\nconsole.log(fullGreeting); // \"Hello, World!\"\n\n// String length\nconst length = str1.length; // 5\n\n// Accessing characters\nconst firstChar = str1[0]; // 'H'\nconst lastChar = str1[str1.length - 1]; // 'o'\n\n// Substrings\nconst sub1 = str1.substring(1, 4); // \"ell\"\nconst sub2 = str1.slice(1, 4); // \"ell\"\n\n// Searching\nconst position = str1.indexOf('l'); // 2 (first occurrence)\nconst lastPosition = str1.lastIndexOf('l'); // 3 (last occurrence)"
          }
        ]
      },
      {
        title: "String Manipulation",
        content: "String manipulation involves changing or extracting information from strings. Common manipulations include:\n\n1. Changing case (uppercase, lowercase)\n2. Trimming whitespace\n3. Splitting into arrays\n4. Replacing substrings\n5. Regular expression operations\n\nMany languages provide built-in methods for these operations, making string manipulation straightforward.",
        examples: [
          {
            language: "JavaScript",
            code: "const text = \"  Hello, World!  \";\n\n// Case conversion\nconst upperCase = text.toUpperCase(); // \"  HELLO, WORLD!  \"\nconst lowerCase = text.toLowerCase(); // \"  hello, world!  \"\n\n// Trimming whitespace\nconst trimmed = text.trim(); // \"Hello, World!\"\n\n// Splitting\nconst words = trimmed.split(', '); // [\"Hello\", \"World!\"]\n\n// Replacing\nconst replaced = text.replace('Hello', 'Hi'); // \"  Hi, World!  \"\n\n// Regular expressions\nconst containsHello = /Hello/.test(text); // true\nconst matches = text.match(/\\w+/g); // [\"Hello\", \"World\"]\n\n// Checking\nconst startsWith = text.trim().startsWith('Hello'); // true\nconst endsWith = text.trim().endsWith('!'); // true\nconst includes = text.includes('World'); // true"
          }
        ]
      },
      {
        title: "Pattern Matching Algorithms",
        content: "Pattern matching involves finding occurrences of a pattern within a string. Several algorithms exist with different time complexities:\n\n1. Naive approach: O(m*n) - check all positions for a match\n2. Knuth-Morris-Pratt (KMP): O(m+n) - builds a prefix table to skip unnecessary comparisons\n3. Boyer-Moore: O(n/m) in best case - shifts the pattern in larger jumps\n4. Rabin-Karp: O(n+m) - uses hashing to find matches\n\nWhere m is the pattern length and n is the text length.",
        examples: [
          {
            language: "JavaScript",
            code: "// Naive pattern matching\nfunction naiveSearch(text, pattern) {\n  const matches = [];\n  const n = text.length;\n  const m = pattern.length;\n  \n  for (let i = 0; i <= n - m; i++) {\n    let j;\n    for (j = 0; j < m; j++) {\n      if (text[i + j] !== pattern[j]) {\n        break;\n      }\n    }\n    if (j === m) { // Found a match\n      matches.push(i);\n    }\n  }\n  \n  return matches;\n}\n\n// KMP Algorithm (Knuth-Morris-Pratt)\nfunction kmpSearch(text, pattern) {\n  if (pattern === '') return [];\n  \n  // Build the LPS (Longest Prefix Suffix) array\n  const lps = buildLPSArray(pattern);\n  const matches = [];\n  \n  let i = 0; // index for text\n  let j = 0; // index for pattern\n  \n  while (i < text.length) {\n    if (pattern[j] === text[i]) {\n      i++;\n      j++;\n    }\n    \n    if (j === pattern.length) {\n      // Found a match\n      matches.push(i - j);\n      j = lps[j - 1]; // Look for the next match\n    } else if (i < text.length && pattern[j] !== text[i]) {\n      if (j !== 0) {\n        j = lps[j - 1];\n      } else {\n        i++;\n      }\n    }\n  }\n  \n  return matches;\n}\n\n// Build LPS array for KMP algorithm\nfunction buildLPSArray(pattern) {\n  const lps = new Array(pattern.length).fill(0);\n  let len = 0;\n  let i = 1;\n  \n  while (i < pattern.length) {\n    if (pattern[i] === pattern[len]) {\n      len++;\n      lps[i] = len;\n      i++;\n    } else {\n      if (len !== 0) {\n        len = lps[len - 1];\n      } else {\n        lps[i] = 0;\n        i++;\n      }\n    }\n  }\n  \n  return lps;\n}"
          }
        ]
      },
      {
        title: "String Algorithms",
        content: "Several important algorithms focus on string processing:\n\n1. String Compression: Convert a string like \"AAABBC\" to \"3A2B1C\"\n2. String Rotation: Check if one string is a rotation of another\n3. Palindrome Checking: Determine if a string reads the same forward and backward\n4. Anagram Detection: Check if two strings contain the same characters in different orders\n5. Longest Common Substring: Find the longest string that is a substring of two strings\n6. Edit Distance (Levenshtein Distance): Minimum operations to transform one string to another",
        examples: [
          {
            language: "JavaScript",
            code: "// Check if a string is a palindrome\nfunction isPalindrome(str) {\n  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  let left = 0;\n  let right = cleanStr.length - 1;\n  \n  while (left < right) {\n    if (cleanStr[left] !== cleanStr[right]) {\n      return false;\n    }\n    left++;\n    right--;\n  }\n  \n  return true;\n}\n\n// Check if two strings are anagrams\nfunction areAnagrams(str1, str2) {\n  // Remove spaces and convert to lowercase\n  const normalize = str => str.toLowerCase().replace(/\\s/g, '');\n  const s1 = normalize(str1);\n  const s2 = normalize(str2);\n  \n  // Quick check on length\n  if (s1.length !== s2.length) return false;\n  \n  // Count each character\n  const charCount = {};\n  \n  for (const char of s1) {\n    charCount[char] = (charCount[char] || 0) + 1;\n  }\n  \n  for (const char of s2) {\n    if (!charCount[char]) return false;\n    charCount[char]--;\n  }\n  \n  return true;\n}\n\n// Check if one string is a rotation of another\nfunction isRotation(s1, s2) {\n  if (s1.length !== s2.length || s1.length === 0) {\n    return false;\n  }\n  \n  // Concatenate s1 with itself\n  const s1s1 = s1 + s1;\n  \n  // Check if s2 is a substring of s1s1\n  return s1s1.includes(s2);\n}"
          }
        ]
      }
    ],
    practiceProblems: [
      { id: 2, title: "Valid Parentheses", difficulty: "Easy" },
      { id: 5, title: "Longest Substring Without Repeating Characters", difficulty: "Medium" },
      { id: 10, title: "Regular Expression Matching", difficulty: "Hard" },
      { id: 22, title: "Group Anagrams", difficulty: "Medium" },
      { id: 28, title: "Palindrome Partitioning", difficulty: "Medium" }
    ],
    createdBy: ADMIN_UID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // ─── 7. Recursion ────────────────────────────────────────────────────────
  {
    topicId: 'recursion',
    title: 'Recursion',
    icon: 'GitBranch',
    description: 'Recursive problem-solving approaches and optimization techniques.',
    difficulty: 'Intermediate',
    estimatedTime: '5 hours',
    problems: 15,
    introduction: "Recursion is a programming technique where a function calls itself to solve a problem. It's particularly useful for problems that can be broken down into simpler versions of the same problem. Understanding recursion is essential for tackling complex algorithms and data structures.",
    sections: [
      {
        title: "Understanding Recursion",
        content: "Recursion is a powerful problem-solving technique based on breaking a problem into smaller instances of the same problem. Every recursive solution has two key components:\n\n1. Base Case(s): The simplest scenario(s) where the answer can be directly provided without further recursion\n2. Recursive Case(s): Where the function calls itself with a simpler version of the problem\n\nWithout proper base cases, recursion would continue indefinitely, causing a stack overflow. Recursion is particularly elegant for problems with a recursive structure, such as tree traversals, permutations, and divide-and-conquer algorithms.",
        examples: [
          {
            language: "JavaScript",
            code: "// Simple example: Computing factorial\nfunction factorial(n) {\n  // Base case\n  if (n <= 1) return 1;\n  \n  // Recursive case\n  return n * factorial(n - 1);\n}\n\n// Example usage\nconsole.log(factorial(5)); // 120 (5 * 4 * 3 * 2 * 1)\n\n// Simple example: Computing Fibonacci numbers\nfunction fibonacci(n) {\n  // Base cases\n  if (n <= 0) return 0;\n  if (n === 1) return 1;\n  \n  // Recursive case\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// Example usage\nconsole.log(fibonacci(6)); // 8 (fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, ...)"
          }
        ]
      },
      {
        title: "Recursion Patterns",
        content: "Several common patterns appear in recursive algorithms:\n\n1. Linear Recursion:\n   - The function makes a single recursive call at each step\n   - Examples: Factorial, Linear Search\n\n2. Binary Recursion:\n   - The function makes two recursive calls at each step\n   - Examples: Fibonacci, Binary Tree traversal\n\n3. Multiple Recursion:\n   - The function makes multiple recursive calls\n   - Examples: Permutations, Combinations\n\n4. Mutual Recursion:\n   - Two or more functions call each other\n   - Examples: Even/Odd checkers, Tree traversals with different node types\n\n5. Tail Recursion:\n   - Recursive call is the last operation in the function\n   - Can be optimized by compilers into iteration",
        examples: [
          {
            language: "JavaScript",
            code: "// Linear Recursion: Sum of array elements\nfunction sum(arr, index = 0) {\n  // Base case\n  if (index >= arr.length) return 0;\n  \n  // Recursive case (linear - one call)\n  return arr[index] + sum(arr, index + 1);\n}\n\n// Binary Recursion: Merge Sort\nfunction mergeSort(arr) {\n  // Base case\n  if (arr.length <= 1) return arr;\n  \n  // Divide array in half\n  const mid = Math.floor(arr.length / 2);\n  const left = arr.slice(0, mid);\n  const right = arr.slice(mid);\n  \n  // Recursive case (binary - two calls)\n  return merge(mergeSort(left), mergeSort(right));\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let leftIndex = 0;\n  let rightIndex = 0;\n  \n  while (leftIndex < left.length && rightIndex < right.length) {\n    if (left[leftIndex] < right[rightIndex]) {\n      result.push(left[leftIndex]);\n      leftIndex++;\n    } else {\n      result.push(right[rightIndex]);\n      rightIndex++;\n    }\n  }\n  \n  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));\n}\n\n// Tail Recursion: Factorial with accumulator\nfunction factorialTail(n, accumulator = 1) {\n  // Base case\n  if (n <= 1) return accumulator;\n  \n  // Tail recursive case\n  return factorialTail(n - 1, n * accumulator);\n}"
          }
        ]
      },
      {
        title: "Recursion vs. Iteration",
        content: "Both recursion and iteration can solve the same problems, but each has advantages:\n\n**Recursion Advantages:**\n- More elegant and concise for certain problems\n- Directly mirrors the problem's recursive structure\n- Simplifies handling recursive data structures like trees\n\n**Recursion Disadvantages:**\n- Function call overhead\n- Risk of stack overflow for deep recursion\n- Often less efficient in time and space\n\n**When to Choose Recursion:**\n- When the problem has a recursive structure\n- When code clarity is more important than performance\n- When dealing with recursive data structures\n- When iterative solution would be complex",
        examples: [
          {
            language: "JavaScript",
            code: "// Factorial: Recursion vs. Iteration\n\n// Recursive approach\nfunction factorialRecursive(n) {\n  if (n <= 1) return 1;\n  return n * factorialRecursive(n - 1);\n}\n\n// Iterative approach\nfunction factorialIterative(n) {\n  let result = 1;\n  for (let i = 2; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}\n\n// Tree traversal: Recursion vs. Iteration\n\n// Recursive in-order traversal\nfunction inOrderRecursive(root, result = []) {\n  if (!root) return result;\n  \n  inOrderRecursive(root.left, result);\n  result.push(root.val);\n  inOrderRecursive(root.right, result);\n  \n  return result;\n}\n\n// Iterative in-order traversal\nfunction inOrderIterative(root) {\n  const result = [];\n  const stack = [];\n  let current = root;\n  \n  while (current || stack.length > 0) {\n    while (current) {\n      stack.push(current);\n      current = current.left;\n    }\n    current = stack.pop();\n    result.push(current.val);\n    current = current.right;\n  }\n  \n  return result;\n}"
          }
        ]
      },
      {
        title: "Recursion Optimization Techniques",
        content: "Recursion can be optimized using several techniques:\n\n1. Memoization:\n   - Store results of expensive function calls and return the cached result when the same inputs occur again\n   - Particularly useful for problems with overlapping subproblems (see Dynamic Programming)\n\n2. Tail Call Optimization (TCO):\n   - Convert recursive functions to tail recursive form, which some languages optimize\n   - Not all languages support TCO (JavaScript in strict mode does in some environments)\n\n3. Recurrence Relations:\n   - Mathematically analyze the recursive algorithm and convert to iteration\n   - Useful for straightforward recursions like factorial or Fibonacci\n\n4. Segmenting/Pruning:\n   - Add conditions to avoid unnecessary recursive calls\n   - Particularly useful for search algorithms",
        examples: [
          {
            language: "JavaScript",
            code: "// Memoization: Fibonacci optimization\nfunction fibonacciMemo(n, memo = {}) {\n  // Check if we've already calculated this value\n  if (n in memo) return memo[n];\n  \n  // Base cases\n  if (n <= 0) return 0;\n  if (n === 1) return 1;\n  \n  // Save result in memo object\n  memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);\n  return memo[n];\n}\n\n// Without memoization - exponential time complexity O(2^n)\nconsole.time('Without memo');\nconsole.log(fibonacci(30));\nconsole.timeEnd('Without memo');\n\n// With memoization - linear time complexity O(n)\nconsole.time('With memo');\nconsole.log(fibonacciMemo(30));\nconsole.timeEnd('With memo');\n\n// Tail recursion: Factorial\nfunction factorial(n, accumulator = 1) {\n  'use strict'; // Enable TCO in supported environments\n  \n  if (n <= 1) return accumulator;\n  \n  // Last operation is the recursive call (tail recursion)\n  return factorial(n - 1, n * accumulator);\n}"
          }
        ]
      }
    ],
    practiceProblems: [
      { id: 3, title: "Merge Two Sorted Lists", difficulty: "Easy" },
      { id: 12, title: "Climbing Stairs", difficulty: "Easy" },
      { id: 19, title: "Reverse Linked List", difficulty: "Easy" },
      { id: 14, title: "Binary Tree Level Order Traversal", difficulty: "Medium" },
      { id: 26, title: "Permutations", difficulty: "Medium" },
      { id: 7, title: "Merge k Sorted Lists", difficulty: "Hard" },
      { id: 10, title: "Regular Expression Matching", difficulty: "Hard" }
    ],
    createdBy: ADMIN_UID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // ─── 8. Permutation Problems ─────────────────────────────────────────────
  {
    topicId: 'permutation-problems',
    title: 'Permutation Problems',
    icon: 'Network',
    description: 'Generate permutations and solve permutation-based problems.',
    difficulty: 'Intermediate',
    estimatedTime: '4 hours',
    problems: 12,
    introduction: "Permutation problems involve generating or analyzing different arrangements of a set of elements. These problems are fundamental in combinatorics and have applications in optimization, cryptography, and algorithm design. Many permutation problems use backtracking or dynamic programming approaches.",
    sections: [
      {
        title: "Understanding Permutations",
        content: "A permutation is an arrangement of distinct objects in a specific order. For n distinct objects, there are n! (n factorial) different permutations.\n\nKey concepts in permutation problems:\n\n1. **Generation:** Creating all possible permutations of a set\n2. **Counting:** Determining the number of permutations with specific properties\n3. **Ranking:** Assigning a unique index to each permutation\n4. **Unranking:** Finding a permutation given its rank\n5. **Next/Previous:** Generating the lexicographically next or previous permutation\n\nPermutations are distinct from combinations, which don't consider the order of elements.",
        examples: [
          {
            language: "JavaScript",
            code: "// Calculate the number of permutations: n!\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\n// Example: Number of permutations of [1, 2, 3, 4, 5]\nconst n = 5;\nconsole.log(`Number of permutations of ${n} elements: ${factorial(n)}`); // 120\n\n// Finding the next lexicographical permutation\nfunction nextPermutation(nums) {\n  // Find the first element that is smaller than the element to its right\n  let i = nums.length - 2;\n  while (i >= 0 && nums[i] >= nums[i + 1]) {\n    i--;\n  }\n  \n  if (i >= 0) {\n    // Find the smallest element to the right that is larger than nums[i]\n    let j = nums.length - 1;\n    while (nums[j] <= nums[i]) {\n      j--;\n    }\n    \n    // Swap nums[i] and nums[j]\n    [nums[i], nums[j]] = [nums[j], nums[i]];\n  }\n  \n  // Reverse the subarray starting from i+1\n  let left = i + 1;\n  let right = nums.length - 1;\n  while (left < right) {\n    [nums[left], nums[right]] = [nums[right], nums[left]];\n    left++;\n    right--;\n  }\n  \n  return nums;\n}"
          }
        ]
      },
      {
        title: "Generating All Permutations",
        content: "Generating all permutations is a common task in many algorithms. Two main approaches are:\n\n1. **Backtracking:** The most flexible approach, using recursion to build permutations element by element.\n\n2. **Heap's Algorithm:** An efficient algorithm that generates all permutations by swapping elements.\n\nThese algorithms can be modified to handle special cases like:\n- Sets with duplicate elements\n- Generating only permutations that satisfy specific constraints\n- Partial permutations (k elements from n elements)",
        examples: [
          {
            language: "JavaScript",
            code: "// Generate all permutations using backtracking\nfunction permute(nums) {\n  const result = [];\n  \n  function backtrack(current, remaining) {\n    // Base case: no more elements to add\n    if (remaining.length === 0) {\n      result.push([...current]);\n      return;\n    }\n    \n    // Try each remaining element\n    for (let i = 0; i < remaining.length; i++) {\n      // Add current element to the permutation\n      current.push(remaining[i]);\n      \n      // Create new remaining array without the used element\n      const newRemaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)];\n      \n      // Recursively generate permutations with the updated arrays\n      backtrack(current, newRemaining);\n      \n      // Backtrack by removing the last added element\n      current.pop();\n    }\n  }\n  \n  backtrack([], nums);\n  return result;\n}\n\n// Heap's Algorithm for generating permutations\nfunction heapPermute(arr) {\n  const result = [];\n  const n = arr.length;\n  \n  function generate(k, A) {\n    if (k === 1) {\n      result.push([...A]);\n      return;\n    }\n    \n    // Generate permutations with kth unaltered\n    generate(k - 1, A);\n    \n    // Generate permutations for kth swapped with each k-1 initial\n    for (let i = 0; i < k - 1; i++) {\n      // Swap elements\n      if (k % 2 === 0) {\n        [A[i], A[k - 1]] = [A[k - 1], A[i]];\n      } else {\n        [A[0], A[k - 1]] = [A[k - 1], A[0]];\n      }\n      \n      generate(k - 1, A);\n    }\n  }\n  \n  generate(n, arr);\n  return result;\n}"
          }
        ]
      },
      {
        title: "Permutations with Duplicates",
        content: "When dealing with sets that contain duplicate elements, we need to modify our permutation algorithms to avoid generating the same permutation multiple times. Common approaches include:\n\n1. **Sorting and Skipping:** Sort the input array and skip elements that are the same as their predecessors.\n\n2. **Frequency Counting:** Use a map to track the frequency of each element and decrement counts as elements are used.\n\n3. **Set-based Deduplication:** Generate all permutations and filter using a set, though this is less efficient.\n\nThe first two approaches are more efficient as they avoid generating duplicate permutations in the first place.",
        examples: [
          {
            language: "JavaScript",
            code: "// Generate permutations with duplicates\nfunction permuteUnique(nums) {\n  const result = [];\n  nums.sort((a, b) => a - b); // Sort the array\n  \n  function backtrack(current, used) {\n    // Base case: permutation complete\n    if (current.length === nums.length) {\n      result.push([...current]);\n      return;\n    }\n    \n    for (let i = 0; i < nums.length; i++) {\n      // Skip used elements\n      if (used[i]) continue;\n      \n      // Skip duplicates\n      if (i > 0 && nums[i] === nums[i-1] && !used[i-1]) continue;\n      \n      // Choose element\n      used[i] = true;\n      current.push(nums[i]);\n      \n      // Explore\n      backtrack(current, used);\n      \n      // Unchoose\n      used[i] = false;\n      current.pop();\n    }\n  }\n  \n  backtrack([], Array(nums.length).fill(false));\n  return result;\n}\n\n// Using frequency counting\nfunction permuteUniqueFreq(nums) {\n  const result = [];\n  \n  // Count frequencies\n  const counter = new Map();\n  for (const num of nums) {\n    counter.set(num, (counter.get(num) || 0) + 1);\n  }\n  \n  function backtrack(current) {\n    if (current.length === nums.length) {\n      result.push([...current]);\n      return;\n    }\n    \n    for (const [num, freq] of counter.entries()) {\n      if (freq === 0) continue;\n      \n      // Use the number\n      counter.set(num, freq - 1);\n      current.push(num);\n      \n      backtrack(current);\n      \n      // Backtrack\n      counter.set(num, freq);\n      current.pop();\n    }\n  }\n  \n  backtrack([]);\n  return result;\n}"
          }
        ]
      },
      {
        title: "Applications of Permutations",
        content: "Permutation algorithms are used in various problem domains:\n\n1. **Combinatorial Optimization:** Problems like the Traveling Salesman Problem and Job Scheduling.\n\n2. **Puzzle Solving:** 15-puzzle, Rubik's cube, and other permutation-based puzzles.\n\n3. **Cryptography:** Permutation ciphers and cryptographic algorithms.\n\n4. **Computer Science:** Token sorting, sequence alignment, and pattern matching.\n\n5. **Statistics:** Permutation tests and randomization methods.\n\nMany of these applications require either generating all permutations or finding a specific permutation that optimizes some objective function.",
        examples: [
          {
            language: "JavaScript",
            code: "// Traveling Salesman Problem (naive approach using permutations)\nfunction tsp(distances) {\n  const n = distances.length;\n  const cities = Array.from({ length: n - 1 }, (_, i) => i + 1); // Cities 1 to n-1\n  \n  // Generate all permutations of cities (excluding the starting city 0)\n  const allRoutes = permute(cities);\n  \n  let minDistance = Infinity;\n  let bestRoute = null;\n  \n  // Evaluate each route\n  for (const route of allRoutes) {\n    const fullRoute = [0, ...route, 0]; // Start and end at city 0\n    let distance = 0;\n    \n    // Calculate the total distance of this route\n    for (let i = 0; i < fullRoute.length - 1; i++) {\n      distance += distances[fullRoute[i]][fullRoute[i + 1]];\n    }\n    \n    if (distance < minDistance) {\n      minDistance = distance;\n      bestRoute = fullRoute;\n    }\n  }\n  \n  return { route: bestRoute, distance: minDistance };\n}\n\n// Example distance matrix for 4 cities\nconst distances = [\n  [0, 10, 15, 20],\n  [10, 0, 35, 25],\n  [15, 35, 0, 30],\n  [20, 25, 30, 0]\n];\n\nconst solution = tsp(distances);\nconsole.log(`Best route: ${solution.route.join(' -> ')}`);\nconsole.log(`Total distance: ${solution.distance}`);"
          }
        ]
      }
    ],
    practiceProblems: [
      { id: 26, title: "Permutations", difficulty: "Medium" },
      { id: 22, title: "Group Anagrams", difficulty: "Medium" },
      { id: 21, title: "Rotate Image", difficulty: "Medium" },
      { id: 15, title: "Word Search", difficulty: "Medium" },
      { id: 23, title: "Jump Game", difficulty: "Medium" },
      { id: 30, title: "N-Queens", difficulty: "Hard" }
    ],
    createdBy: ADMIN_UID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// ── Seed function ───────────────────────────────────────────────────────────

async function seedStudyTopics() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Codosphere — Study Topics Migration Script    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  const batch = db.batch();

  // Check for existing topics first
  const existingSnapshot = await db.collection(STUDY_TOPICS_COLLECTION).get();
  const existingSlugs = new Set(
    existingSnapshot.docs.map((doc) => doc.data().topicId as string)
  );

  let skipped = 0;
  let queued = 0;

  for (const topic of studyTopics) {
    if (existingSlugs.has(topic.topicId)) {
      console.log(`  ⏭  Skipping "${topic.title}" (topicId="${topic.topicId}") — already exists`);
      skipped++;
      continue;
    }

    const docRef = db.collection(STUDY_TOPICS_COLLECTION).doc(); // auto-generated ID
    batch.set(docRef, topic);
    console.log(`  ✅ Queued "${topic.title}" (topicId="${topic.topicId}", docId=${docRef.id})`);
    queued++;
  }

  if (queued === 0) {
    console.log('\n  ℹ  All topics already exist in Firestore. Nothing to do.');
  } else {
    console.log(`\n  📝 Committing batch write (${queued} topics)…`);
    await batch.commit();
    console.log('  🎉 Batch committed successfully!');
  }

  console.log(`\n  Summary: ${queued} added, ${skipped} skipped (already existed)`);
  console.log('  Done.\n');
  process.exit(0);
}

seedStudyTopics().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
