import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Code, ExternalLink, Plus } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  getDifficultyColor,
  getTopicColor,
  getStatusColor,
} from "@/lib/color-matching";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  url: string;
  description: string;
  examples: any[];
  constraints: string[] | string;
  starterCode: string;
  slug: string;
}

interface UserProblem {
  id: string;
  problemId: string;
  userId: string;
  status: string;
  rating: number | null;
  notes: string | null;
  code: string | null;
  lastAttempt: string | null;
}

interface ProblemWithUserData {
  problem: Problem;
  userProblem: UserProblem;
}

export function ProblemDetailSheet({
  problem,
  onSave,
  onClose,
}: {
  problem: ProblemWithUserData;
  onSave: (problem: ProblemWithUserData) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(problem.userProblem.notes || "");
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [rating, setRating] = useState(problem.userProblem.rating || 7);
  const [lastAttempt, setLastAttempt] = useState(
    problem.userProblem.lastAttempt || ""
  );
  const [codeSnippets, setCodeSnippets] = useState([
    {
      id: 1,
      caption: "Solution",
      timeComplexity: "",
      spaceComplexity: "",
      code: problem.userProblem.code || problem.problem.starterCode || "",
    },
  ]);

  const handleOpenDedicatedPage = () => {
    window.open(`/problem/${problem.problem.id}`, "_blank");
  };

  const addCodeSnippet = () => {
    const newSnippet = {
      id: Date.now(),
      caption: "",
      timeComplexity: "",
      spaceComplexity: "",
      code: "",
    };
    setCodeSnippets([...codeSnippets, newSnippet]);
  };

  const updateCodeSnippet = (id: number, field: string, value: string) => {
    setCodeSnippets(
      codeSnippets.map((snippet) =>
        snippet.id === id ? { ...snippet, [field]: value } : snippet
      )
    );
  };

  const removeCodeSnippet = (id: number) => {
    setCodeSnippets(codeSnippets.filter((snippet) => snippet.id !== id));
  };

  const handleRatingChange = async (value: number) => {
    try {
      // Update the rating in the database
      await fetch(`/api/problems/${problem.problem.slug}/rating`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: value }),
      });
      setRating(value);
    } catch (error) {
      console.error("Failed to update rating:", error);
    }
  };

  const handleSave = () => {
    onSave({
      ...problem,
      userProblem: {
        ...problem.userProblem,
        notes,
        rating,
        lastAttempt,
        code: codeSnippets[0]?.code || "",
      },
    });
  };

  return (
    <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-5">
      <SheetHeader className="p-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <SheetTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              {problem.problem.title}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(problem.problem.difficulty)}>
                {problem.problem.difficulty}
              </Badge>
              <Badge
                variant="outline"
                className={getTopicColor(problem.problem.topic)}
              >
                {problem.problem.topic}
              </Badge>
              <Badge className={getStatusColor(problem.userProblem.status)}>
                {problem.userProblem.status}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mr-5">
            <a
              href={problem.problem.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              LeetCode
            </a>
          </Button>
        </div>
        <SheetDescription>Problem details and your solutions</SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Rating and Date Controls */}
        <div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg">
          <div className="flex-1">
            <Label className="text-sm font-medium">
              Interview Difficulty Rating (1-10)
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => handleRatingChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">{rating}/10</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              10 = Easiest interview question
            </div>
          </div>

          <div className="flex-1">
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
        </div>

        {/* Problem Description */}
        <div>
          <Label className="text-sm font-medium">Problem Description</Label>
          <div className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
            {problem.problem.description}
          </div>
        </div>

        {/* Examples */}
        <div>
          <Label className="text-sm font-medium">Examples</Label>
          <div className="mt-2 space-y-2">
            {Array.isArray(problem.problem.examples) &&
              problem.problem.examples.map((example, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg text-sm">
                  <div className="font-medium mb-1">Example {index + 1}:</div>
                  <div className="space-y-2">
                    <div>
                      <strong>Input:</strong> {example.input}
                    </div>
                    <div>
                      <strong>Output:</strong> {example.output}
                    </div>
                    {example.explanation && (
                      <div>
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Constraints and Notes Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Constraints</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg text-sm">
              <ul className="list-disc list-inside">
                {Array.isArray(problem.problem.constraints) &&
                  problem.problem.constraints.map(
                    (constraint: string, index: number) => (
                      <li key={index}>{constraint}</li>
                    )
                  )}
              </ul>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-base font-medium">
              Notes
            </Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this problem..."
              className="mt-2 w-full p-3 bg-muted rounded-lg text-sm min-h-[100px] resize-y border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Code Snippets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">Solutions</Label>
            <Button variant="outline" size="sm" onClick={addCodeSnippet}>
              <Plus className="w-4 h-4 mr-2" />
              Add Solution
            </Button>
          </div>

          <div className="space-y-4">
            {codeSnippets.map((snippet, index) => (
              <div key={snippet.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    placeholder="Solution caption (e.g., Brute Force, Optimized, Optimal)"
                    value={snippet.caption}
                    onChange={(e) =>
                      updateCodeSnippet(snippet.id, "caption", e.target.value)
                    }
                    className="flex-1 mr-2"
                  />
                  {codeSnippets.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCodeSnippet(snippet.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">
                      Time Complexity
                    </Label>
                    <Input
                      placeholder="e.g., O(n²)"
                      value={snippet.timeComplexity}
                      onChange={(e) =>
                        updateCodeSnippet(
                          snippet.id,
                          "timeComplexity",
                          e.target.value
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">
                      Space Complexity
                    </Label>
                    <Input
                      placeholder="e.g., O(1)"
                      value={snippet.spaceComplexity}
                      onChange={(e) =>
                        updateCodeSnippet(
                          snippet.id,
                          "spaceComplexity",
                          e.target.value
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium">Code</Label>
                  <textarea
                    value={snippet.code}
                    onChange={(e) =>
                      updateCodeSnippet(snippet.id, "code", e.target.value)
                    }
                    placeholder="Enter your solution code..."
                    className="mt-1 w-full p-3 bg-muted rounded-lg text-sm min-h-[150px] resize-y border-0 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="default" onClick={handleOpenDedicatedPage}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Full View
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}
