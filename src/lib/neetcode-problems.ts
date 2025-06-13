export interface CuratedProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  url: string;
}

export const neetcodeProblems: CuratedProblem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Array",
    url: "https://leetcode.com/problems/two-sum/",
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    url: "https://leetcode.com/problems/valid-parentheses/",
  },
  {
    id: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topic: "Linked List",
    url: "https://leetcode.com/problems/merge-two-sorted-lists/",
  },
  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    topic: "Array",
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
  },
  {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    topic: "String",
    url: "https://leetcode.com/problems/valid-palindrome/",
  },
  {
    id: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    topic: "Tree",
    url: "https://leetcode.com/problems/invert-binary-tree/",
  },
  {
    id: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    topic: "String",
    url: "https://leetcode.com/problems/valid-anagram/",
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    topic: "Binary Search",
    url: "https://leetcode.com/problems/binary-search/",
  },
  {
    id: "flood-fill",
    title: "Flood Fill",
    difficulty: "Easy",
    topic: "Graph",
    url: "https://leetcode.com/problems/flood-fill/",
  },
  {
    id: "lowest-common-ancestor-of-a-binary-search-tree",
    title: "Lowest Common Ancestor of a Binary Search Tree",
    difficulty: "Easy",
    topic: "Tree",
    url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
  },
  // Add more problems as needed...
];
