// This file contains all coding challenges with complete descriptions, examples, constraints, and starter code

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface CodeProblem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Example[];
  testCases?: TestCase[]; // Added test cases property
  constraints: string[];
  tags: string[];
  solved?: boolean;
}

export interface StarterCode {
  [key: string]: { [key: string]: string };
}

// Collection of all coding problems
export const codingProblems: CodeProblem[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]"
      }
    ],
    // Add test cases for Two Sum
    testCases: [
      {
        input: "2,7,11,15\n9",
        expectedOutput: "0,1",
        isHidden: false
      },
      {
        input: "3,2,4\n6",
        expectedOutput: "1,2",
        isHidden: false
      },
      {
        input: "1,5,9,2\n11",
        expectedOutput: "2,3",
        isHidden: true
      },
      {
        input: "5,8,3,0,7\n10",
        expectedOutput: "2,4",
        isHidden: true
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    tags: ["Array", "Hash Table"]
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      {
        input: "s = \"()\"",
        output: "true"
      },
      {
        input: "s = \"()[]{}\"",
        output: "true"
      },
      {
        input: "s = \"(]\"",
        output: "false"
      },
      {
        input: "s = \"([)]\"",
        output: "false"
      },
      {
        input: "s = \"{[]}\"",
        output: "true"
      }
    ],
    // Add test cases for Valid Parentheses
    testCases: [
      {
        input: "()",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "()[]{}",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "({[]})",
        expectedOutput: "true",
        isHidden: true
      },
      {
        input: "({)}",
        expectedOutput: "false",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    tags: ["Stack", "String"]
  },
  {
    id: 3,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    description: "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]"
      },
      {
        input: "list1 = [], list2 = []",
        output: "[]"
      },
      {
        input: "list1 = [], list2 = [0]",
        output: "[0]"
      }
    ],
    // Add test cases for Merge Two Sorted Lists
    testCases: [
      {
        input: "1,2,4\n1,3,4",
        expectedOutput: "1,1,2,3,4,4",
        isHidden: false
      },
      {
        input: "\n",
        expectedOutput: "",
        isHidden: false
      },
      {
        input: "1,3,5,7\n2,4,6",
        expectedOutput: "1,2,3,4,5,6,7",
        isHidden: true
      },
      {
        input: "\n0",
        expectedOutput: "0",
        isHidden: true
      }
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order."
    ],
    tags: ["Linked List", "Recursion"]
  },
  {
    id: 4,
    title: "Add Two Numbers",
    difficulty: "Medium",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.",
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807."
      },
      {
        input: "l1 = [0], l2 = [0]",
        output: "[0]"
      },
      {
        input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]",
        output: "[8,9,9,9,0,0,0,1]"
      }
    ],
    // Add test cases for Add Two Numbers
    testCases: [
      {
        input: "2,4,3\n5,6,4",
        expectedOutput: "7,0,8",
        isHidden: false
      },
      {
        input: "0\n0",
        expectedOutput: "0",
        isHidden: false
      },
      {
        input: "9,9,9\n1",
        expectedOutput: "0,0,0,1",
        isHidden: true
      },
      {
        input: "1,8\n0",
        expectedOutput: "1,8",
        isHidden: true
      }
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros."
    ],
    tags: ["Linked List", "Math"]
  },
  {
    id: 5,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: "s = \"abcabcbb\"",
        output: "3",
        explanation: "The answer is \"abc\", with the length of 3."
      },
      {
        input: "s = \"bbbbb\"",
        output: "1",
        explanation: "The answer is \"b\", with the length of 1."
      },
      {
        input: "s = \"pwwkew\"",
        output: "3",
        explanation: "The answer is \"wke\", with the length of 3. Notice that the answer must be a substring, \"pwke\" is a subsequence and not a substring."
      }
    ],
    // Add test cases for Longest Substring Without Repeating Characters
    testCases: [
      {
        input: "abcabcbb",
        expectedOutput: "3",
        isHidden: false
      },
      {
        input: "bbbbb",
        expectedOutput: "1",
        isHidden: false
      },
      {
        input: "aab",
        expectedOutput: "2",
        isHidden: true
      },
      {
        input: "dvdf",
        expectedOutput: "3",
        isHidden: true
      }
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    tags: ["String", "Sliding Window", "Hash Table"]
  },
  {
    id: 6,
    title: "Container With Most Water",
    difficulty: "Medium",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "The maximum area is obtained by choosing the second and last line, with a height of min(8, 7) = 7 and a width of 8 - 1 = 7, resulting in an area of 7 * 7 = 49."
      },
      {
        input: "height = [1,1]",
        output: "1"
      }
    ],
    testCases: [
      {
        input: "1,8,6,2,5,4,8,3,7",
        expectedOutput: "49",
        isHidden: false
      },
      {
        input: "1,1",
        expectedOutput: "1",
        isHidden: false
      },
      {
        input: "4,3,2,1,4",
        expectedOutput: "16",
        isHidden: true
      },
      {
        input: "1,2,1",
        expectedOutput: "2",
        isHidden: true
      }
    ],
    constraints: [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4"
    ],
    tags: ["Array", "Two Pointers", "Greedy"]
  },
  {
    id: 7,
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
    examples: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
        explanation: "The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6"
      },
      {
        input: "lists = []",
        output: "[]"
      },
      {
        input: "lists = [[]]",
        output: "[]"
      }
    ],
    testCases: [
      {
        input: "1,4,5\n1,3,4\n2,6",
        expectedOutput: "1,1,2,3,4,4,5,6",
        isHidden: false
      },
      {
        input: "",
        expectedOutput: "",
        isHidden: false
      },
      {
        input: "1\n2\n3",
        expectedOutput: "1,2,3",
        isHidden: true
      },
      {
        input: "2,5\n1,3,7\n4,6",
        expectedOutput: "1,2,3,4,5,6,7",
        isHidden: true
      }
    ],
    constraints: [
      "k == lists.length",
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "-10^4 <= lists[i][j] <= 10^4",
      "lists[i] is sorted in ascending order.",
      "The sum of lists[i].length won't exceed 10^4."
    ],
    tags: ["Linked List", "Divide and Conquer", "Heap", "Merge Sort"]
  },
  {
    id: 8,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped."
      },
      {
        input: "height = [4,2,0,3,2,5]",
        output: "9"
      }
    ],
    testCases: [
      {
        input: "0,1,0,2,1,0,1,3,2,1,2,1",
        expectedOutput: "6",
        isHidden: false
      },
      {
        input: "4,2,0,3,2,5",
        expectedOutput: "9",
        isHidden: false
      },
      {
        input: "3,0,2,0,4",
        expectedOutput: "7",
        isHidden: true
      },
      {
        input: "0,1,0,0,0,1,0",
        expectedOutput: "4",
        isHidden: true
      }
    ],
    constraints: [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5"
    ],
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"]
  },
  {
    id: 9,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2."
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
      }
    ],
    testCases: [
      {
        input: "1,3\n2",
        expectedOutput: "2.00000",
        isHidden: false
      },
      {
        input: "1,2\n3,4",
        expectedOutput: "2.50000",
        isHidden: false
      },
      {
        input: "0,0\n0,0",
        expectedOutput: "0.00000",
        isHidden: true
      },
      {
        input: "\n1",
        expectedOutput: "1.00000",
        isHidden: true
      }
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6"
    ],
    tags: ["Array", "Binary Search", "Divide and Conquer"]
  },
  {
    id: 10,
    title: "Regular Expression Matching",
    difficulty: "Hard",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:\n\n- '.' Matches any single character.\n- '*' Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).",
    examples: [
      {
        input: "s = \"aa\", p = \"a\"",
        output: "false",
        explanation: "\"a\" does not match the entire string \"aa\"."
      },
      {
        input: "s = \"aa\", p = \"a*\"",
        output: "true",
        explanation: "\"a*\" means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes \"aa\"."
      },
      {
        input: "s = \"ab\", p = \".*\"",
        output: "true",
        explanation: "\".*\" means zero or more of any character."
      }
    ],
    testCases: [
      {
        input: "aa\na",
        expectedOutput: "false",
        isHidden: false
      },
      {
        input: "aa\na*",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "ab\n.*",
        expectedOutput: "true",
        isHidden: true
      },
      {
        input: "aab\nc*a*b",
        expectedOutput: "true",
        isHidden: true
      },
      {
        input: "mississippi\nmis*is*p*.",
        expectedOutput: "false",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= s.length <= 20",
      "1 <= p.length <= 30",
      "s contains only lowercase English letters.",
      "p contains only lowercase English letters, '.', and '*'.",
      "It is guaranteed for each appearance of the character '*', there will be a previous valid character to match."
    ],
    tags: ["String", "Dynamic Programming", "Recursion"]
  },
  {
    id: 11,
    title: "Maximum Subarray",
    difficulty: "Easy",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nA subarray is a contiguous part of an array.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "[4,-1,2,1] has the largest sum = 6."
      },
      {
        input: "nums = [1]",
        output: "1"
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23"
      }
    ],
    testCases: [
      {
        input: "-2,1,-3,4,-1,2,1,-5,4",
        expectedOutput: "6",
        isHidden: false
      },
      {
        input: "1",
        expectedOutput: "1",
        isHidden: false
      },
      {
        input: "5,4,-1,7,8",
        expectedOutput: "23",
        isHidden: true
      },
      {
        input: "-1,-2,-3,-4",
        expectedOutput: "-1",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"]
  },
  {
    id: 12,
    title: "Climbing Stairs",
    difficulty: "Easy",
    description: "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps"
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways to climb to the top.\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step"
      }
    ],
    testCases: [
      {
        input: "2",
        expectedOutput: "2",
        isHidden: false
      },
      {
        input: "3",
        expectedOutput: "3",
        isHidden: false
      },
      {
        input: "5",
        expectedOutput: "8",
        isHidden: true
      },
      {
        input: "10",
        expectedOutput: "89",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= n <= 45"
    ],
    tags: ["Math", "Dynamic Programming", "Memoization"]
  },
  {
    id: 13,
    title: "3Sum",
    difficulty: "Medium",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.",
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]"
      },
      {
        input: "nums = []",
        output: "[]"
      },
      {
        input: "nums = [0]",
        output: "[]"
      }
    ],
    testCases: [
      {
        input: "-1,0,1,2,-1,-4",
        expectedOutput: "-1,-1,2;-1,0,1",
        isHidden: false
      },
      {
        input: "0,0,0",
        expectedOutput: "0,0,0",
        isHidden: false
      },
      {
        input: "-2,0,1,1,2",
        expectedOutput: "-2,0,2;-2,1,1",
        isHidden: true
      },
      {
        input: "-3,-1,0,1,2,4",
        expectedOutput: "-3,-1,4;-3,1,2;-1,0,1",
        isHidden: true
      }
    ],
    constraints: [
      "0 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5"
    ],
    tags: ["Array", "Two Pointers", "Sorting"]
  },
  {
    id: 14,
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]"
      },
      {
        input: "root = [1]",
        output: "[[1]]"
      },
      {
        input: "root = []",
        output: "[]"
      }
    ],
    testCases: [
      {
        input: "3,9,20,null,null,15,7",
        expectedOutput: "3;9,20;15,7",
        isHidden: false
      },
      {
        input: "1",
        expectedOutput: "1",
        isHidden: false
      },
      {
        input: "",
        expectedOutput: "",
        isHidden: true
      },
      {
        input: "1,2,3,4,5,6,7",
        expectedOutput: "1;2,3;4,5,6,7",
        isHidden: true
      }
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000].",
      "-1000 <= Node.val <= 1000"
    ],
    tags: ["Tree", "Breadth-First Search", "Binary Tree"]
  },
  {
    id: 15,
    title: "Word Search",
    difficulty: "Medium",
    description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
    examples: [
      {
        input: "board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'ABCCED'",
        output: "true"
      },
      {
        input: "board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'SEE'",
        output: "true"
      },
      {
        input: "board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'ABCB'",
        output: "false"
      }
    ],
    testCases: [
      {
        input: "ABCE,SFCS,ADEE\nABCCED",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "ABCE,SFCS,ADEE\nSEE",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "ABCE,SFCS,ADEE\nABCB",
        expectedOutput: "false",
        isHidden: true
      },
      {
        input: "AB,CD\nABDC",
        expectedOutput: "true",
        isHidden: true
      }
    ],
    constraints: [
      "m == board.length",
      "n = board[i].length",
      "1 <= m, n <= 6",
      "1 <= word.length <= 15",
      "board and word consists of only lowercase and uppercase English letters."
    ],
    tags: ["Array", "Backtracking", "Matrix"]
  },
  {
    id: 16,
    title: "Word Ladder",
    difficulty: "Hard",
    description: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that:\n\n- Every adjacent pair of words differs by a single letter.\n- Every si for 1 <= i <= k is in wordList. Note that beginWord does not need to be in wordList.\n- sk == endWord\n\nGiven two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
    examples: [
      {
        input: "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]",
        output: "5",
        explanation: "One shortest transformation sequence is \"hit\" -> \"hot\" -> \"dot\" -> \"dog\" -> \"cog\", which is 5 words long."
      },
      {
        input: "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]",
        output: "0",
        explanation: "The endWord \"cog\" is not in wordList, therefore there is no valid transformation sequence."
      }
    ],
    testCases: [
      {
        input: "hit\ncog\nhot,dot,dog,lot,log,cog",
        expectedOutput: "5",
        isHidden: false
      },
      {
        input: "hit\ncog\nhot,dot,dog,lot,log",
        expectedOutput: "0",
        isHidden: false
      },
      {
        input: "a\nc\na,b,c",
        expectedOutput: "2",
        isHidden: true
      },
      {
        input: "hot\ndog\nhot,dog,dot",
        expectedOutput: "3",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= beginWord.length <= 10",
      "endWord.length == beginWord.length",
      "1 <= wordList.length <= 5000",
      "wordList[i].length == beginWord.length",
      "beginWord, endWord, and wordList[i] consist of lowercase English letters.",
      "beginWord != endWord",
      "All the words in wordList are unique."
    ],
    tags: ["Breadth-First Search", "Hash Table", "String"]
  },
  {
    id: 17,
    title: "Serialize and Deserialize Binary Tree",
    difficulty: "Hard",
    description: "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n\nDesign an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.",
    examples: [
      {
        input: "root = [1,2,3,null,null,4,5]",
        output: "[1,2,3,null,null,4,5]",
        explanation: "The serialized format follows level order traversal, where 'null' signifies a path terminator where no node exists below."
      }
    ],
    testCases: [
      {
        input: "1,2,3,null,null,4,5",
        expectedOutput: "1,2,3,null,null,4,5",
        isHidden: false
      },
      {
        input: "",
        expectedOutput: "",
        isHidden: false
      },
      {
        input: "1",
        expectedOutput: "1",
        isHidden: true
      },
      {
        input: "1,2,3",
        expectedOutput: "1,2,3",
        isHidden: true
      }
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 10^4].",
      "-1000 <= Node.val <= 1000"
    ],
    tags: ["Tree", "Depth-First Search", "Breadth-First Search", "Design", "String", "Binary Tree"]
  },
  {
    id: 18,
    title: "LRU Cache",
    difficulty: "Medium",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class:\n\n- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.\n- int get(int key) Return the value of the key if the key exists, otherwise return -1.\n- void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.",
    examples: [
      {
        input: "Input\n[\"LRUCache\", \"put\", \"put\", \"get\", \"put\", \"get\", \"put\", \"get\", \"get\", \"get\"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]",
        output: "Output\n[null, null, null, 1, null, -1, null, -1, 3, 4]",
        explanation: "LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // cache is {1=1}\nlRUCache.put(2, 2); // cache is {1=1, 2=2}\nlRUCache.get(1);    // return 1\nlRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}\nlRUCache.get(2);    // returns -1 (not found)\nlRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}\nlRUCache.get(1);    // return -1 (not found)\nlRUCache.get(3);    // return 3\nlRUCache.get(4);    // return 4"
      }
    ],
    testCases: [
      {
        input: "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4",
        expectedOutput: "1,-1,-1,3,4",
        isHidden: false
      },
      {
        input: "1\nput 1 1\nput 2 2\nget 1\nget 2",
        expectedOutput: "-1,2",
        isHidden: true
      },
      {
        input: "2\nput 2 1\nput 1 1\nput 2 3\nput 4 1\nget 1\nget 2",
        expectedOutput: "-1,3",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put."
    ],
    tags: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"]
  },
  {
    id: 19,
    title: "Reverse Linked List",
    difficulty: "Easy",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]"
      },
      {
        input: "head = [1,2]",
        output: "[2,1]"
      },
      {
        input: "head = []",
        output: "[]"
      }
    ],
    testCases: [
      {
        input: "1,2,3,4,5",
        expectedOutput: "5,4,3,2,1",
        isHidden: false
      },
      {
        input: "1,2",
        expectedOutput: "2,1",
        isHidden: false
      },
      {
        input: "",
        expectedOutput: "",
        isHidden: true
      },
      {
        input: "1",
        expectedOutput: "1",
        isHidden: true
      }
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    tags: ["Linked List", "Recursion"]
  },
  {
    id: 20,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5. Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell."
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0."
      }
    ],
    testCases: [
      {
        input: "7,1,5,3,6,4",
        expectedOutput: "5",
        isHidden: false
      },
      {
        input: "7,6,4,3,1",
        expectedOutput: "0",
        isHidden: false
      },
      {
        input: "2,4,1",
        expectedOutput: "2",
        isHidden: true
      },
      {
        input: "1,2",
        expectedOutput: "1",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4"
    ],
    tags: ["Array", "Dynamic Programming"]
  },
  {
    id: 21,
    title: "Rotate Image",
    difficulty: "Medium",
    description: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).\n\nYou have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.",
    examples: [
      {
        input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        output: "[[7,4,1],[8,5,2],[9,6,3]]"
      },
      {
        input: "matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]",
        output: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]"
      }
    ],
    testCases: [
      {
        input: "1,2,3;4,5,6;7,8,9",
        expectedOutput: "7,4,1;8,5,2;9,6,3",
        isHidden: false
      },
      {
        input: "5,1,9,11;2,4,8,10;13,3,6,7;15,14,12,16",
        expectedOutput: "15,13,2,5;14,3,4,1;12,6,8,9;16,7,10,11",
        isHidden: false
      },
      {
        input: "1",
        expectedOutput: "1",
        isHidden: true
      },
      {
        input: "1,2;3,4",
        expectedOutput: "3,1;4,2",
        isHidden: true
      }
    ],
    constraints: [
      "n == matrix.length == matrix[i].length",
      "1 <= n <= 20",
      "-1000 <= matrix[i][j] <= 1000"
    ],
    tags: ["Array", "Math", "Matrix"]
  },
  {
    id: 22,
    title: "Group Anagrams",
    difficulty: "Medium",
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    examples: [
      {
        input: "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        output: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"
      },
      {
        input: "strs = [\"\"]",
        output: "[[\"\"]]"
      },
      {
        input: "strs = [\"a\"]",
        output: "[[\"a\"]]"
      }
    ],
    testCases: [
      {
        input: "eat,tea,tan,ate,nat,bat",
        expectedOutput: "bat;nat,tan;ate,eat,tea",
        isHidden: false
      },
      {
        input: "",
        expectedOutput: "",
        isHidden: false
      },
      {
        input: "a",
        expectedOutput: "a",
        isHidden: true
      },
      {
        input: "abc,bca,cab,xyz,zyx",
        expectedOutput: "abc,bca,cab;xyz,zyx",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters."
    ],
    tags: ["Array", "Hash Table", "String", "Sorting"]
  },
  {
    id: 23,
    title: "Jump Game",
    difficulty: "Medium",
    description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.\n\nReturn true if you can reach the last index, or false otherwise.",
    examples: [
      {
        input: "nums = [2,3,1,1,4]",
        output: "true",
        explanation: "Jump 1 step from index 0 to 1, then 3 steps to the last index."
      },
      {
        input: "nums = [3,2,1,0,4]",
        output: "false",
        explanation: "You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index."
      }
    ],
    testCases: [
      {
        input: "2,3,1,1,4",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "3,2,1,0,4",
        expectedOutput: "false",
        isHidden: false
      },
      {
        input: "0",
        expectedOutput: "true",
        isHidden: true
      },
      {
        input: "2,0,0",
        expectedOutput: "true",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "0 <= nums[i] <= 10^5"
    ],
    tags: ["Array", "Dynamic Programming", "Greedy"]
  },
  {
    id: 24,
    title: "Find First and Last Position of Element in Sorted Array",
    difficulty: "Medium",
    description: "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.\n\nIf target is not found in the array, return [-1, -1].\n\nYou must write an algorithm with O(log n) runtime complexity.",
    examples: [
      {
        input: "nums = [5,7,7,8,8,10], target = 8",
        output: "[3,4]"
      },
      {
        input: "nums = [5,7,7,8,8,10], target = 6",
        output: "[-1,-1]"
      },
      {
        input: "nums = [], target = 0",
        output: "[-1,-1]"
      }
    ],
    testCases: [
      {
        input: "5,7,7,8,8,10\n8",
        expectedOutput: "3,4",
        isHidden: false
      },
      {
        input: "5,7,7,8,8,10\n6",
        expectedOutput: "-1,-1",
        isHidden: false
      },
      {
        input: "\n0",
        expectedOutput: "-1,-1",
        isHidden: true
      },
      {
        input: "1,1,1,1\n1",
        expectedOutput: "0,3",
        isHidden: true
      }
    ],
    constraints: [
      "0 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
      "nums is a non-decreasing array.",
      "-10^9 <= target <= 10^9"
    ],
    tags: ["Array", "Binary Search"]
  },
  {
    id: 25,
    title: "Unique Paths",
    difficulty: "Medium",
    description: "A robot is located at the top-left corner of a m x n grid (marked 'Start' in the diagram below).\n\nThe robot can only move either down or right at any point in time. The robot is trying to reach the bottom-right corner of the grid (marked 'Finish' in the diagram below).\n\nHow many possible unique paths are there?",
    examples: [
      {
        input: "m = 3, n = 7",
        output: "28"
      },
      {
        input: "m = 3, n = 2",
        output: "3",
        explanation: "From the top-left corner, there are a total of 3 ways to reach the bottom-right corner:\n1. Right -> Down -> Down\n2. Down -> Right -> Down\n3. Down -> Down -> Right"
      }
    ],
    testCases: [
      {
        input: "3\n7",
        expectedOutput: "28",
        isHidden: false
      },
      {
        input: "3\n2",
        expectedOutput: "3",
        isHidden: false
      },
      {
        input: "1\n1",
        expectedOutput: "1",
        isHidden: true
      },
      {
        input: "7\n3",
        expectedOutput: "28",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= m, n <= 100",
      "It's guaranteed that the answer will be less than or equal to 2 * 10^9."
    ],
    tags: ["Math", "Dynamic Programming", "Combinatorics"]
  },
  {
    id: 26,
    title: "Permutations",
    difficulty: "Medium",
    description: "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"
      },
      {
        input: "nums = [0,1]",
        output: "[[0,1],[1,0]]"
      },
      {
        input: "nums = [1]",
        output: "[[1]]"
      }
    ],
    testCases: [
      {
        input: "1,2,3",
        expectedOutput: "1,2,3;1,3,2;2,1,3;2,3,1;3,1,2;3,2,1",
        isHidden: false
      },
      {
        input: "0,1",
        expectedOutput: "0,1;1,0",
        isHidden: false
      },
      {
        input: "1",
        expectedOutput: "1",
        isHidden: true
      },
      {
        input: "1,2",
        expectedOutput: "1,2;2,1",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= nums.length <= 6",
      "-10 <= nums[i] <= 10",
      "All the integers of nums are unique."
    ],
    tags: ["Array", "Backtracking"]
  },
  {
    id: 27,
    title: "Minimum Path Sum",
    difficulty: "Medium",
    description: "Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path.\n\nNote: You can only move either down or right at any point in time.",
    examples: [
      {
        input: "grid = [[1,3,1],[1,5,1],[4,2,1]]",
        output: "7",
        explanation: "Because the path 1 → 3 → 1 → 1 → 1 minimizes the sum."
      },
      {
        input: "grid = [[1,2,3],[4,5,6]]",
        output: "12"
      }
    ],
    testCases: [
      {
        input: "1,3,1;1,5,1;4,2,1",
        expectedOutput: "7",
        isHidden: false
      },
      {
        input: "1,2,3;4,5,6",
        expectedOutput: "12",
        isHidden: false
      },
      {
        input: "1",
        expectedOutput: "1",
        isHidden: true
      },
      {
        input: "1,2;1,1",
        expectedOutput: "3",
        isHidden: true
      }
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 200",
      "0 <= grid[i][j] <= 100"
    ],
    tags: ["Array", "Dynamic Programming", "Matrix"]
  },
  {
    id: 28,
    title: "Palindrome Partitioning",
    difficulty: "Medium",
    description: "Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.",
    examples: [
      {
        input: "s = \"aab\"",
        output: "[[\"a\",\"a\",\"b\"],[\"aa\",\"b\"]]"
      },
      {
        input: "s = \"a\"",
        output: "[[\"a\"]]"
      }
    ],
    testCases: [
      {
        input: "aab",
        expectedOutput: "a,a,b;aa,b",
        isHidden: false
      },
      {
        input: "a",
        expectedOutput: "a",
        isHidden: false
      },
      {
        input: "aba",
        expectedOutput: "a,b,a;aba",
        isHidden: true
      },
      {
        input: "aaa",
        expectedOutput: "a,a,a;a,aa;aa,a;aaa",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= s.length <= 16",
      "s contains only lowercase English letters."
    ],
    tags: ["String", "Dynamic Programming", "Backtracking"]
  },
  {
    id: 29,
    title: "Merge Intervals",
    difficulty: "Medium",
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Intervals [1,4] and [4,5] are considered overlapping."
      }
    ],
    testCases: [
      {
        input: "1,3;2,6;8,10;15,18",
        expectedOutput: "1,6;8,10;15,18",
        isHidden: false
      },
      {
        input: "1,4;4,5",
        expectedOutput: "1,5",
        isHidden: false
      },
      {
        input: "1,4;0,4",
        expectedOutput: "0,4",
        isHidden: true
      },
      {
        input: "1,3;2,4;5,7;6,8",
        expectedOutput: "1,4;5,8",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= starti <= endi <= 10^4"
    ],
    tags: ["Array", "Sorting"]
  },
  {
    id: 30,
    title: "N-Queens",
    difficulty: "Hard",
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n\nGiven an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.\n\nEach solution contains a distinct board configuration of the n-queens placement, where 'Q' and '.' both indicate a queen and an empty space, respectively.",
    examples: [
      {
        input: "n = 4",
        output: "[[\".\",\"Q\",\".\",\".\"],[\".\",\".\",\".\",\"Q\"],[\"Q\",\".\",\".\",\".\"],[\".\",\".\",\"Q\",\".\"]]",
        explanation: "There exist two distinct solutions to the 4-queens puzzle as shown above."
      },
      {
        input: "n = 1",
        output: "[[\"Q\"]]"
      }
    ],
    testCases: [
      {
        input: "4",
        expectedOutput: "2",
        isHidden: false
      },
      {
        input: "1",
        expectedOutput: "1",
        isHidden: false
      },
      {
        input: "5",
        expectedOutput: "10",
        isHidden: true
      },
      {
        input: "8",
        expectedOutput: "92",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= n <= 9"
    ],
    tags: ["Array", "Backtracking"]
  }
];

// Sample starter code for different languages and problems
export const starterCode: StarterCode = {
  'twoSum': {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your solution here
};`,
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Your solution here
        pass`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
    }
}`,
    c: `/*
Note: The returned array must be malloced, assume caller calls free().
*/
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
    }
};`
  },
  'validParentheses': {
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Your solution here
};`,
    python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Your solution here
        pass`,
    java: `class Solution {
    public boolean isValid(String s) {
        // Your solution here
    }
}`,
    c: `bool isValid(char* s) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    bool isValid(string s) {
        // Your solution here
    }
};`
  },
  'mergeTwoLists': {
    javascript: `/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
    // Your solution here
};`,
    python: `class Solution:
    def mergeTwoLists(self, list1, list2):
        # Your solution here
        pass`,
    java: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Your solution here
    }
}`,
    c: `struct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        // Your solution here
    }
};`
  },
  'addTwoNumbers': {
    javascript: `/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
function addTwoNumbers(l1, l2) {
    // Your solution here
};`,
    python: `class Solution:
    def addTwoNumbers(self, l1, l2):
        # Your solution here
        pass`,
    java: `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // Your solution here
    }
}`,
    c: `struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        // Your solution here
    }
};`
  },
  'longestSubstring': {
    javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
    // Your solution here
};`,
    python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your solution here
    }
}`,
    c: `int lengthOfLongestSubstring(char* s) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Your solution here
    }
};`
  },
  'containerWater': {
    javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
    // Your solution here
};`,
    python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int maxArea(int[] height) {
        // Your solution here
    }
}`,
    c: `int maxArea(int* height, int heightSize) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        // Your solution here
    }
};`
  },
  'mergeKLists': {
    javascript: `/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
function mergeKLists(lists) {
    // Your solution here
};`,
    python: `class Solution:
    def mergeKLists(self, lists):
        # Your solution here
        pass`,
    java: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // Your solution here
    }
}`,
    c: `struct ListNode* mergeKLists(struct ListNode** lists, int listsSize, int* returnSize) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // Your solution here
    }
};`
  },
  'trappingRainWater': {
    javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
    // Your solution here
};`,
    python: `class Solution:
    def trap(self, height: list[int]) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int trap(int[] height) {
        // Your solution here
    }
}`,
    c: `int trap(int* height, int heightSize) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        // Your solution here
    }
};`
  },
  'medianTwoArrays': {
    javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
    // Your solution here
};`,
    python: `class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        # Your solution here
        pass`,
    java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Your solution here
    }
}`,
    c: `double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        // Your solution here
    }
};`
  },
  'regexMatch': {
    javascript: `/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
function isMatch(s, p) {
    // Your solution here
};`,
    python: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        # Your solution here
        pass`,
    java: `class Solution {
    public boolean isMatch(String s, String p) {
        // Your solution here
    }
}`,
    c: `bool isMatch(char* s, char* p) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    bool isMatch(string s, string p) {
        // Your solution here
    }
};`
  },
  'maxSubarray': {
    javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Your solution here
}`,
    python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your solution here
        return 0;
    }
}`,
    c: `int maxSubArray(int* nums, int numsSize) {
    // Your solution here
    return 0;
}`,
    cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Your solution here
        return 0;
    }
};`
  },
  'climbingStairs': {
    javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    // Your solution here
}`,
    python: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int climbStairs(int n) {
        // Your solution here
        return 0;
    }
}`,
    c: `int climbStairs(int n) {
    // Your solution here
    return 0;
}`,
    cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Your solution here
        return 0;
    }
};`
  },
  'threeSum': {
    javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
    // Your solution here
}`,
    python: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        # Your solution here
        pass`,
    java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Your solution here
        return new ArrayList<>();
    }
}`,
    c: `/**
 * Return an array of arrays of size *returnSize.
 * The sizes of the arrays are returned as *returnColumnSizes array.
 */
int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    // Your solution here
    *returnSize = 0;
    return NULL;
}`,
    cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Your solution here
        return {};
    }
};`
  },
  'levelOrder': {
    javascript: `/**
 * Definition for a binary tree node is provided.
 * function TreeNode(val, left, right) { ... }
 *
 * @param {TreeNode} root
 * @return {number[][]}
 */
function levelOrder(root) {
    // Your solution here
}`,
    python: `# Definition for a binary tree node is provided.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None): ...

class Solution:
    def levelOrder(self, root) -> list[list[int]]:
        # Your solution here
        pass`,
    java: `/**
 * Definition for a binary tree node is provided.
 * class TreeNode { int val; TreeNode left; TreeNode right; ... }
 */
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        // Your solution here
        return new ArrayList<>();
    }
}`,
    c: `/**
 * Definition for a binary tree node is provided.
 * struct TreeNode { int val; struct TreeNode *left; struct TreeNode *right; };
 */
int** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {
    // Your solution here
    *returnSize = 0;
    return NULL;
}`,
    cpp: `/**
 * Definition for a binary tree node is provided.
 * struct TreeNode { int val; TreeNode *left; TreeNode *right; ... };
 */
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        // Your solution here
        return {};
    }
};`
  },
  'wordSearch': {
    javascript: `/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
function exist(board, word) {
    // Your solution here
}`,
    python: `class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        # Your solution here
        pass`,
    java: `class Solution {
    public boolean exist(char[][] board, String word) {
        // Your solution here
        return false;
    }
}`,
    c: `#include <stdbool.h>
bool exist(char** board, int boardSize, int* boardColSize, char* word) {
    // Your solution here
    return false;
}`,
    cpp: `class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        // Your solution here
        return false;
    }
};`
  },
  'wordLadder': {
    javascript: `/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
function ladderLength(beginWord, endWord, wordList) {
    // Your solution here
}`,
    python: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        // Your solution here
        return 0;
    }
}`,
    c: `int ladderLength(char* beginWord, char* endWord, char** wordList, int wordListSize) {
    // Your solution here
    return 0;
}`,
    cpp: `class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        // Your solution here
        return 0;
    }
};`
  },
  'serializeDeserialize': {
    javascript: `/**
 * Definition for a binary tree node is provided.
 * function TreeNode(val, left, right) { ... }
 */
class Codec {
    /**
     * Encodes a tree to a single string.
     * @param {TreeNode} root
     * @return {string}
     */
    serialize(root) {
        // Your solution here
    }

    /**
     * Decodes your encoded data to tree.
     * @param {string} data
     * @return {TreeNode}
     */
    deserialize(data) {
        // Your solution here
    }
}`,
    python: `# Definition for a binary tree node is provided.
# class TreeNode: ...

class Codec:
    def serialize(self, root):
        """Encodes a tree to a single string."""
        # Your solution here
        pass

    def deserialize(self, data):
        """Decodes your encoded data to tree."""
        # Your solution here
        pass`,
    java: `/**
 * Definition for a binary tree node is provided.
 * class TreeNode { int val; TreeNode left; TreeNode right; ... }
 */
class Codec {
    // Encodes a tree to a single string.
    public String serialize(TreeNode root) {
        // Your solution here
        return "";
    }

    // Decodes your encoded data to tree.
    public TreeNode deserialize(String data) {
        // Your solution here
        return null;
    }
}`,
    c: `/**
 * Definition for a binary tree node is provided.
 * struct TreeNode { int val; struct TreeNode *left; struct TreeNode *right; };
 */
char* serialize(struct TreeNode* root) {
    // Your solution here
    return "";
}

struct TreeNode* deserialize(char* data) {
    // Your solution here
    return NULL;
}`,
    cpp: `/**
 * Definition for a binary tree node is provided.
 * struct TreeNode { int val; TreeNode *left; TreeNode *right; ... };
 */
class Codec {
public:
    // Encodes a tree to a single string.
    string serialize(TreeNode* root) {
        // Your solution here
        return "";
    }

    // Decodes your encoded data to tree.
    TreeNode* deserialize(string data) {
        // Your solution here
        return nullptr;
    }
};`
  },
  'lruCache': {
    javascript: `/**
 * @param {number} capacity
 */
class LRUCache {
    constructor(capacity) {
        // Your solution here
    }

    /**
     * @param {number} key
     * @return {number}
     */
    get(key) {
        // Your solution here
    }

    /**
     * @param {number} key
     * @param {number} value
     * @return {void}
     */
    put(key, value) {
        // Your solution here
    }
}`,
    python: `class LRUCache:
    def __init__(self, capacity: int):
        # Your solution here
        pass

    def get(self, key: int) -> int:
        # Your solution here
        pass

    def put(self, key: int, value: int) -> None:
        # Your solution here
        pass`,
    java: `class LRUCache {
    public LRUCache(int capacity) {
        // Your solution here
    }

    public int get(int key) {
        // Your solution here
        return -1;
    }

    public void put(int key, int value) {
        // Your solution here
    }
}`,
    c: `typedef struct {
    // Define your data structure here
} LRUCache;

LRUCache* lRUCacheCreate(int capacity) {
    // Your solution here
    return NULL;
}

int lRUCacheGet(LRUCache* obj, int key) {
    // Your solution here
    return -1;
}

void lRUCachePut(LRUCache* obj, int key, int value) {
    // Your solution here
}

void lRUCacheFree(LRUCache* obj) {
    // Your solution here
}`,
    cpp: `class LRUCache {
public:
    LRUCache(int capacity) {
        // Your solution here
    }

    int get(int key) {
        // Your solution here
        return -1;
    }

    void put(int key, int value) {
        // Your solution here
    }
};`
  },
  'reverseLinkedList': {
    javascript: `/**
 * Definition for singly-linked list node is provided.
 * function ListNode(val, next) { ... }
 *
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    // Your solution here
}`,
    python: `# Definition for singly-linked list is provided.
# class ListNode:
#     def __init__(self, val=0, next=None): ...

class Solution:
    def reverseList(self, head):
        # Your solution here
        pass`,
    java: `/**
 * Definition for singly-linked list is provided.
 * class ListNode { int val; ListNode next; ... }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // Your solution here
        return null;
    }
}`,
    c: `/**
 * Definition for singly-linked list is provided.
 * struct ListNode { int val; struct ListNode *next; };
 */
struct ListNode* reverseList(struct ListNode* head) {
    // Your solution here
    return NULL;
}`,
    cpp: `/**
 * Definition for singly-linked list is provided.
 * struct ListNode { int val; ListNode *next; ... };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Your solution here
        return nullptr;
    }
};`
  },
  'buyAndSellStock': {
    javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    // Your solution here
}`,
    python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int maxProfit(int[] prices) {
        // Your solution here
        return 0;
    }
}`,
    c: `int maxProfit(int* prices, int pricesSize) {
    // Your solution here
    return 0;
}`,
    cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Your solution here
        return 0;
    }
};`
  },
  'rotateImage': {
    javascript: `/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
function rotate(matrix) {
    // Your solution here
}`,
    python: `class Solution:
    def rotate(self, matrix: list[list[int]]) -> None:
        # Do not return anything, modify matrix in-place instead.
        pass`,
    java: `class Solution {
    public void rotate(int[][] matrix) {
        // Your solution here
    }
}`,
    c: `void rotate(int** matrix, int matrixSize, int* matrixColSize) {
    // Your solution here
}`,
    cpp: `class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        // Your solution here
    }
};`
  },
  'groupAnagrams': {
    javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
    // Your solution here
}`,
    python: `class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        # Your solution here
        pass`,
    java: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Your solution here
        return new ArrayList<>();
    }
}`,
    c: `/**
 * Return an array of arrays of size *returnSize.
 * The sizes of the arrays are returned as *returnColumnSizes.
 */
char*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {
    // Your solution here
    *returnSize = 0;
    return NULL;
}`,
    cpp: `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        // Your solution here
        return {};
    }
};`
  },
  'jumpGame': {
    javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function canJump(nums) {
    // Your solution here
}`,
    python: `class Solution:
    def canJump(self, nums: list[int]) -> bool:
        # Your solution here
        pass`,
    java: `class Solution {
    public boolean canJump(int[] nums) {
        // Your solution here
        return false;
    }
}`,
    c: `#include <stdbool.h>
bool canJump(int* nums, int numsSize) {
    // Your solution here
    return false;
}`,
    cpp: `class Solution {
public:
    bool canJump(vector<int>& nums) {
        // Your solution here
        return false;
    }
};`
  },
  'searchRange': {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function searchRange(nums, target) {
    // Your solution here
}`,
    python: `class Solution:
    def searchRange(self, nums: list[int], target: int) -> list[int]:
        # Your solution here
        pass`,
    java: `class Solution {
    public int[] searchRange(int[] nums, int target) {
        // Your solution here
        return new int[]{-1, -1};
    }
}`,
    c: `int* searchRange(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* res = (int*)malloc(2 * sizeof(int));
    res[0] = -1; res[1] = -1;
    // Your solution here
    return res;
}`,
    cpp: `class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        // Your solution here
        return {-1, -1};
    }
};`
  },
  'uniquePaths': {
    javascript: `/**
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
function uniquePaths(m, n) {
    // Your solution here
}`,
    python: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int uniquePaths(int m, int n) {
        // Your solution here
        return 0;
    }
}`,
    c: `int uniquePaths(int m, int n) {
    // Your solution here
    return 0;
}`,
    cpp: `class Solution {
public:
    int uniquePaths(int m, int n) {
        // Your solution here
        return 0;
    }
};`
  },
  'permutations': {
    javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permute(nums) {
    // Your solution here
}`,
    python: `class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        # Your solution here
        pass`,
    java: `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        // Your solution here
        return new ArrayList<>();
    }
}`,
    c: `/**
 * Return an array of arrays of size *returnSize.
 * The sizes of the arrays are returned as *returnColumnSizes.
 */
int** permute(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    // Your solution here
    *returnSize = 0;
    return NULL;
}`,
    cpp: `class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        // Your solution here
        return {};
    }
};`
  },
  'minPathSum': {
    javascript: `/**
 * @param {number[][]} grid
 * @return {number}
 */
function minPathSum(grid) {
    // Your solution here
}`,
    python: `class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int minPathSum(int[][] grid) {
        // Your solution here
        return 0;
    }
}`,
    c: `int minPathSum(int** grid, int gridSize, int* gridColSize) {
    // Your solution here
    return 0;
}`,
    cpp: `class Solution {
public:
    int minPathSum(vector<vector<int>>& grid) {
        // Your solution here
        return 0;
    }
};`
  },
  'palindromePartitioning': {
    javascript: `/**
 * @param {string} s
 * @return {string[][]}
 */
function partition(s) {
    // Your solution here
}`,
    python: `class Solution:
    def partition(self, s: str) -> list[list[str]]:
        # Your solution here
        pass`,
    java: `class Solution {
    public List<List<String>> partition(String s) {
        // Your solution here
        return new ArrayList<>();
    }
}`,
    c: `/**
 * Return an array of arrays of size *returnSize.
 * The sizes of the arrays are returned as *returnColumnSizes.
 */
char*** partition(char* s, int* returnSize, int** returnColumnSizes) {
    // Your solution here
    *returnSize = 0;
    return NULL;
}`,
    cpp: `class Solution {
public:
    vector<vector<string>> partition(string s) {
        // Your solution here
        return {};
    }
};`
  },
  'mergeIntervals': {
    javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
    // Your solution here
}`,
    python: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        # Your solution here
        pass`,
    java: `class Solution {
    public int[][] merge(int[][] intervals) {
        // Your solution here
        return new int[0][0];
    }
}`,
    c: `int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {
    // Your solution here
    *returnSize = 0;
    return NULL;
}`,
    cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Your solution here
        return {};
    }
};`
  },
  'nQueens': {
    javascript: `/**
 * @param {number} n
 * @return {number}
 */
function totalNQueens(n) {
    // Your solution here
}`,
    python: `class Solution:
    def totalNQueens(self, n: int) -> int:
        # Your solution here
        pass`,
    java: `class Solution {
    public int totalNQueens(int n) {
        // Your solution here
        return 0;
    }
}`,
    c: `int totalNQueens(int n) {
    // Your solution here
    return 0;
}`,
    cpp: `class Solution {
public:
    int totalNQueens(int n) {
        // Your solution here
        return 0;
    }
};`
  },
  'default': {
    javascript: `/**
 * Your solution here
 */
function solve(input) {
    // Write your code here
};`,
    python: `class Solution:
    def solve(self, input):
        # Write your code here
        pass`,
    java: `class Solution {
    public void solve(String input) {
        // Write your code here
    }
}`,
    c: `void solve(char* input) {
    // Write your code here
}`,
    cpp: `class Solution {
public:
    void solve(string input) {
        // Write your code here
    }
};`
  }
};

// Re-export types from the generic wrapper generator for convenience
export type { FunctionMeta, ParamDef } from '../services/api/wrapperGenerator';
import { generateStarterCode } from '../services/api/wrapperGenerator';

/**
 * Get initial code snippet based on the problem and language.
 *
 * Resolution order:
 *   1. Problem's embedded `starterCode` (Firebase / self-describing problems)
 *   2. Auto-generated from `functionMeta` (new problems with signature metadata)
 *   3. Built-in template map (static problems 1-30)
 *   4. Default generic template
 */
export const getInitialCodeSnippet = (language: string, problemId: number, problem?: any): string => {
  // 1. Problem has explicit starter code for this language
  if (problem?.starterCode?.[language]) {
    return problem.starterCode[language];
  }

  // 2. Auto-generate from function metadata
  if (problem?.functionMeta) {
    const generated = generateStarterCode(language, problem.functionMeta);
    if (generated) return generated;
  }

  // 3. Fall through to built-in template map (existing problems 1-30)
  // Map problem ID to template key
  const templateMap: { [key: number]: string } = {
    1: 'twoSum',
    2: 'validParentheses',
    3: 'mergeTwoLists',
    4: 'addTwoNumbers',
    5: 'longestSubstring',
    6: 'containerWater',
    7: 'mergeKLists',
    8: 'trappingRainWater',
    9: 'medianTwoArrays',
    10: 'regexMatch',
    11: 'maxSubarray',
    12: 'climbingStairs',
    13: 'threeSum',
    14: 'levelOrder',
    15: 'wordSearch',
    16: 'wordLadder',
    17: 'serializeDeserialize',
    18: 'lruCache',
    19: 'reverseLinkedList',
    20: 'buyAndSellStock',
    21: 'rotateImage',
    22: 'groupAnagrams',
    23: 'jumpGame',
    24: 'searchRange',
    25: 'uniquePaths',
    26: 'permutations',
    27: 'minPathSum',
    28: 'palindromePartitioning',
    29: 'mergeIntervals',
    30: 'nQueens',
  };

  const templateKey = templateMap[problemId] || 'default';
  return starterCode[templateKey][language] || starterCode['default'][language];
};

// This function returns a problem by its ID
export const getProblemById = (id: number): CodeProblem | undefined => {
  return codingProblems.find(problem => problem.id === id);
};