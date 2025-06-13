"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Code, ExternalLink, Plus, TrendingUp, Target, BarChart3, BookOpen, Lightbulb } from "lucide-react"
import Link from "next/link"

// Mock data for the problem
const problemData = {
  id: 1,
  title: "Two Sum",
  slug: "two-sum",
  difficulty: "Easy",
  topic: "Array",
  url: "https://leetcode.com/problems/two-sum/",
  status: "Solved",
  rating: 9,
  lastAttempt: "2024-02-20",
  totalAttempts: 3,
  timeSpent: "45 min",
  notes:
    "Used hash map approach for O(n) solution. This is a classic problem that teaches the importance of trading space for time complexity.",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists.",
  ],
  codeSnippets: [
    {
      id: 1,
      caption: "Brute Force",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)",
      code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
    },
    {
      id: 2,
      caption: "Hash Map (Optimal)",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      code: `def twoSum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []`,
    },
  ],
  analytics: {
    attemptHistory: [
      { date: "2024-02-18", duration: 25, status: "Failed", approach: "Brute Force" },
      { date: "2024-02-19", duration: 15, status: "Partial", approach: "Hash Map" },
      { date: "2024-02-20", duration: 5, status: "Solved", approach: "Hash Map" },
    ],
    similarProblems: [
      { title: "3Sum", difficulty: "Medium", similarity: 85 },
      { title: "4Sum", difficulty: "Medium", similarity: 75 },
      { title: "Two Sum II", difficulty: "Medium", similarity: 90 },
    ],
    topicProgress: {
      current: 12,
      total: 15,
      percentage: 80,
    },
    difficultyProgress: {
      easy: { solved: 35, total: 40 },
      medium: { solved: 25, total: 45 },
      hard: { solved: 4, total: 13 },
    },
  },
}

function getTopicColor(topic: string) {
  const topicColors = {
    Array: "bg-blue-100 text-blue-800 border-blue-200",
    String: "bg-purple-100 text-purple-800 border-purple-200",
    "Linked List": "bg-indigo-100 text-indigo-800 border-indigo-200",
    Tree: "bg-green-100 text-green-800 border-green-200",
    Graph: "bg-red-100 text-red-800 border-red-200",
    "Dynamic Programming": "bg-orange-100 text-orange-800 border-orange-200",
    Stack: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Queue: "bg-teal-100 text-teal-800 border-teal-200",
    "Hash Table": "bg-pink-100 text-pink-800 border-pink-200",
    "Binary Search": "bg-violet-100 text-violet-800 border-violet-200",
  }
  return topicColors[topic] || "bg-gray-100 text-gray-800 border-gray-200"
}

export default function ProblemPage({ params }: { params: { problemslug: string } }) {
  const [notes, setNotes] = useState(problemData.notes)
  const [showDifficulty, setShowDifficulty] = useState(false)
  const [showCategory, setShowCategory] = useState(false)
  const [rating, setRating] = useState(problemData.rating)
  const [lastAttempt, setLastAttempt] = useState(problemData.lastAttempt)
  const [codeSnippets, setCodeSnippets] = useState(problemData.codeSnippets)

  const addCodeSnippet = () => {
    const newSnippet = {
      id: Date.now(),
      caption: "",
      timeComplexity: "",
      spaceComplexity: "",
      code: "",
    }
    setCodeSnippets([...codeSnippets, newSnippet])
  }

  const updateCodeSnippet = (id: number, field: string, value: string) => {
    setCodeSnippets(codeSnippets.map((snippet) => (snippet.id === id ? { ...snippet, [field]: value } : snippet)))
  }

  const removeCodeSnippet = (id: number) => {
    setCodeSnippets(codeSnippets.filter((snippet) => snippet.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tracker
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Code className="w-6 h-6" />
                  {problemData.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`${
                      problemData.difficulty === "Easy"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : problemData.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {problemData.difficulty}
                  </Badge>
                  <Badge variant="outline" className={getTopicColor(problemData.topic)}>
                    {problemData.topic}
                  </Badge>
                  <Badge
                    className={`${
                      problemData.status === "Solved"
                        ? "bg-green-500 text-white"
                        : problemData.status === "Attempted"
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {problemData.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href={problemData.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in LeetCode
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="problem" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="problem">Problem</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="problem" className="space-y-6">
                {/* Problem Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Problem Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line">{problemData.description}</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Examples:</h4>
                      {problemData.examples.map((example, index) => (
                        <div key={index} className="bg-muted p-4 rounded-lg">
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>Input:</strong> {example.input}
                            </div>
                            <div>
                              <strong>Output:</strong> {example.output}
                            </div>
                            <div>
                              <strong>Explanation:</strong> {example.explanation}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Constraints:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {problemData.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="solutions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Your Solutions
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={addCodeSnippet}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Solution
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {codeSnippets.map((snippet, index) => (
                        <div key={snippet.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Input
                              placeholder="Solution caption (e.g., Brute Force, Optimized, Optimal)"
                              value={snippet.caption}
                              onChange={(e) => updateCodeSnippet(snippet.id, "caption", e.target.value)}
                              className="flex-1 mr-2"
                            />
                            {codeSnippets.length > 1 && (
                              <Button variant="outline" size="sm" onClick={() => removeCodeSnippet(snippet.id)}>
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Time Complexity</Label>
                              <Input
                                placeholder="e.g., O(n²)"
                                value={snippet.timeComplexity}
                                onChange={(e) => updateCodeSnippet(snippet.id, "timeComplexity", e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Space Complexity</Label>
                              <Input
                                placeholder="e.g., O(1)"
                                value={snippet.spaceComplexity}
                                onChange={(e) => updateCodeSnippet(snippet.id, "spaceComplexity", e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Code</Label>
                            <textarea
                              value={snippet.code}
                              onChange={(e) => updateCodeSnippet(snippet.id, "code", e.target.value)}
                              placeholder="Enter your solution code..."
                              className="mt-1 w-full p-4 bg-muted rounded-lg text-sm min-h-[200px] resize-y border-0 focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Your Notes & Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes, insights, and key learnings about this problem..."
                      className="w-full p-4 bg-muted rounded-lg text-sm min-h-[300px] resize-y border-0 focus:ring-2 focus:ring-blue-500"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {/* Attempt History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Attempt History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {problemData.analytics.attemptHistory.map((attempt, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                attempt.status === "Solved"
                                  ? "bg-green-500"
                                  : attempt.status === "Partial"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            />
                            <div>
                              <div className="font-medium">{attempt.approach}</div>
                              <div className="text-sm text-muted-foreground">{attempt.date}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{attempt.duration} min</div>
                            <div className="text-sm text-muted-foreground">{attempt.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Similar Problems */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Similar Problems
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {problemData.analytics.similarProblems.map((problem, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">{problem.title}</div>
                            <Badge
                              variant="outline"
                              className={`mt-1 ${
                                problem.difficulty === "Easy"
                                  ? "bg-green-100 text-green-800"
                                  : problem.difficulty === "Medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {problem.difficulty}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{problem.similarity}% similar</div>
                            <Progress value={problem.similarity} className="w-20 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{rating}</div>
                    <div className="text-xs text-muted-foreground">Rating /10</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{problemData.totalAttempts}</div>
                    <div className="text-xs text-muted-foreground">Attempts</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Interview Difficulty Rating (1-10)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{rating}/10</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">10 = Easiest interview question</div>
                </div>

                <div>
                  <Label htmlFor="last-attempt" className="text-sm font-medium">
                    Last Attempt
                  </Label>
                  <Input
                    id="last-attempt"
                    type="date"
                    value={lastAttempt}
                    onChange={(e) => setLastAttempt(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Problem Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Problem Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Difficulty</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type={showDifficulty ? "text" : "password"}
                      value={problemData.difficulty}
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={() => setShowDifficulty(!showDifficulty)}>
                      {showDifficulty ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type={showCategory ? "text" : "password"}
                      value={problemData.topic}
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={() => setShowCategory(!showCategory)}>
                      {showCategory ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topic Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {problemData.topic} Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Problems Solved</span>
                    <span>
                      {problemData.analytics.topicProgress.current}/{problemData.analytics.topicProgress.total}
                    </span>
                  </div>
                  <Progress value={problemData.analytics.topicProgress.percentage} />
                  <div className="text-xs text-muted-foreground text-center">
                    {problemData.analytics.topicProgress.percentage}% Complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600">Easy</span>
                      <span>
                        {problemData.analytics.difficultyProgress.easy.solved}/
                        {problemData.analytics.difficultyProgress.easy.total}
                      </span>
                    </div>
                    <Progress
                      value={
                        (problemData.analytics.difficultyProgress.easy.solved /
                          problemData.analytics.difficultyProgress.easy.total) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-yellow-600">Medium</span>
                      <span>
                        {problemData.analytics.difficultyProgress.medium.solved}/
                        {problemData.analytics.difficultyProgress.medium.total}
                      </span>
                    </div>
                    <Progress
                      value={
                        (problemData.analytics.difficultyProgress.medium.solved /
                          problemData.analytics.difficultyProgress.medium.total) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600">Hard</span>
                      <span>
                        {problemData.analytics.difficultyProgress.hard.solved}/
                        {problemData.analytics.difficultyProgress.hard.total}
                      </span>
                    </div>
                    <Progress
                      value={
                        (problemData.analytics.difficultyProgress.hard.solved /
                          problemData.analytics.difficultyProgress.hard.total) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-6">
          <Button size="lg" className="px-8">
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
