import { db } from "./config";
import { problems, userProblems, attemptHistory, codeSnippets } from "./schema";
import { eq } from "drizzle-orm";

// Fake user ID
const userId = "user_123";

// 10 sample problems (from curated-lists and mockProblems)
const sampleProblems = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Array",
    url: "https://leetcode.com/problems/two-sum/",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: JSON.stringify([
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ]),
    constraints: JSON.stringify([
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ]),
    starterCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
    }
}`,
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    url: "https://leetcode.com/problems/valid-parentheses/",
    description:
      "Given a string s containing just the characters (), {}, and [], determine if the input string is valid.",
    examples: JSON.stringify([
      { input: 's = "()"', output: "true", explanation: "Valid." },
    ]),
    constraints: JSON.stringify(["1 <= s.length <= 10^4"]),
    starterCode: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
    }
}`,
  },
  {
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "String",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples: JSON.stringify([
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
    ]),
    constraints: JSON.stringify(["0 <= s.length <= 5 * 10^4"]),
    starterCode: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your code here
    }
}`,
  },
  {
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topic: "Linked List",
    url: "https://leetcode.com/problems/merge-two-sorted-lists/",
    description:
      "Merge two sorted linked lists and return it as a new sorted list.",
    examples: JSON.stringify([
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
        explanation: "",
      },
    ]),
    constraints: JSON.stringify([
      "The number of nodes in both lists is in the range [0, 50].",
    ]),
    starterCode: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your code here
    }
}`,
  },
  {
    slug: "binary-tree-inorder-traversal",
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    topic: "Tree",
    url: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    description:
      "Given the root of a binary tree, return the inorder traversal of its nodes values.",
    examples: JSON.stringify([
      { input: "root = [1,null,2,3]", output: "[1,3,2]", explanation: "" },
    ]),
    constraints: JSON.stringify([
      "The number of nodes in the tree is in the range [0, 100].",
    ]),
    starterCode: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        // Write your code here
    }
}`,
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    topic: "String",
    url: "https://leetcode.com/problems/valid-anagram/",
    description:
      "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    examples: JSON.stringify([
      {
        input: 's = "anagram", t = "nagaram"',
        output: "true",
        explanation: "",
      },
    ]),
    constraints: JSON.stringify(["1 <= s.length, t.length <= 5 * 10^4"]),
    starterCode: `class Solution {
    public boolean isAnagram(String s, String t) {
        // Write your code here
    }
}`,
  },
  {
    slug: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    topic: "String",
    url: "https://leetcode.com/problems/group-anagrams/",
    description: "Given an array of strings strs, group the anagrams together.",
    examples: JSON.stringify([
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[ ["bat"], ["nat","tan"], ["ate","eat","tea"] ]',
        explanation: "",
      },
    ]),
    constraints: JSON.stringify(["1 <= strs.length <= 10^4"]),
    starterCode: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Write your code here
    }
}`,
  },
  {
    slug: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    topic: "Array",
    url: "https://leetcode.com/problems/container-with-most-water/",
    description:
      "Given n non-negative integers a1, a2, ..., an , where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of the line i is at (i, ai) and (i, 0). Find two lines, which, together with the x-axis forms a container, such that the container contains the most water.",
    examples: JSON.stringify([
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "" },
    ]),
    constraints: JSON.stringify(["n == height.length"]),
    starterCode: `class Solution {
    public int maxArea(int[] height) {
        // Write your code here
    }
}`,
  },
  {
    slug: "3sum",
    title: "3Sum",
    difficulty: "Medium",
    topic: "Array",
    url: "https://leetcode.com/problems/3sum/",
    description:
      "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    examples: JSON.stringify([
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        explanation: "",
      },
    ]),
    constraints: JSON.stringify(["3 <= nums.length <= 3000"]),
    starterCode: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your code here
    }
}`,
  },
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    topic: "String",
    url: "https://leetcode.com/problems/valid-palindrome/",
    description:
      "Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.",
    examples: JSON.stringify([
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: "",
      },
    ]),
    constraints: JSON.stringify(["1 <= s.length <= 2 * 10^5"]),
    starterCode: `class Solution {
    public boolean isPalindrome(String s) {
        // Write your code here
    }
}`,
  },
];

// Mock attempt history data
const mockAttempts = [
  {
    status: "Failed",
    approach: "Brute Force",
    duration: 30,
    notes: "Tried brute force but exceeded time limit.",
  },
  {
    status: "Partial",
    approach: "Hash Map",
    duration: 20,
    notes: "Got partial solution with hash map.",
  },
  {
    status: "Solved",
    approach: "Hash Map",
    duration: 15,
    notes: "Solved using hash map approach.",
  },
];

// Mock code submissions
const mockSubmissions = [
  {
    caption: "Brute Force",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    code: "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
  },
  {
    caption: "Hash Map",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    code: "def twoSum(nums, target):\n    hashmap = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hashmap:\n            return [hashmap[complement], i]\n        hashmap[num] = i\n    return []",
  },
];

async function main() {
  // Clear existing data
  await db.delete(attemptHistory);
  await db.delete(codeSnippets);
  await db.delete(userProblems);
  await db.delete(problems);

  // Insert problems
  for (const p of sampleProblems) {
    await db.insert(problems).values(p);
  }

  // Fetch problem IDs
  const dbProblems = await db
    .select()
    .from(problems)
    .where((row) => sampleProblems.map((p) => p.slug).includes(row.slug));

  // Insert userProblems for fake user
  for (const p of dbProblems) {
    await db.insert(userProblems).values({
      userId,
      problemId: p.id,
      status: "Not Started",
      rating: 5,
      notes: "",
      lastAttempt: null,
    });
  }

  // Fetch userProblems to get their IDs
  const userProblemsList = await db
    .select()
    .from(userProblems)
    .where(eq(userProblems.userId, userId));

  // Insert mock attempt history and code submissions for each user problem
  for (const up of userProblemsList) {
    // Insert 1-3 random attempts
    const numAttempts = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numAttempts; i++) {
      const attempt =
        mockAttempts[Math.floor(Math.random() * mockAttempts.length)];
      await db.insert(attemptHistory).values({
        userProblemId: up.id,
        date: new Date(),
        duration: attempt.duration,
        status: attempt.status,
        approach: attempt.approach,
        notes: attempt.notes,
      });
    }

    // Insert 1-2 random code submissions
    const numSubmissions = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numSubmissions; i++) {
      const submission =
        mockSubmissions[Math.floor(Math.random() * mockSubmissions.length)];
      await db.insert(codeSnippets).values({
        userProblemId: up.id,
        caption: submission.caption,
        timeComplexity: submission.timeComplexity,
        spaceComplexity: submission.spaceComplexity,
        code: submission.code,
      });
    }
  }

  console.log("Seed complete!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
