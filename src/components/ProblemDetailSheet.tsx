import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Code, ExternalLink, Plus } from "lucide-react";

export function ProblemDetailSheet({
    problem,
    onSave,
    onClose,
  }: {
    problem: any;
    onSave: (problem: any) => void;
    onClose: () => void;
  }) {
    const [notes, setNotes] = useState(problem.notes || "");
    const [showDifficulty, setShowDifficulty] = useState(false);
    const [showCategory, setShowCategory] = useState(false);
    const [rating, setRating] = useState(problem.rating || 7);
    const [lastAttempt, setLastAttempt] = useState(problem.lastAttempt);
    const [codeSnippets, setCodeSnippets] = useState([
      {
        id: 1,
        caption: "Brute Force",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        code: problem.code || "",
      },
    ]);
  
    const handleOpenDedicatedPage = () => {
      window.open(`/problem/${problem.id}`, "_blank");
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
  
    const handleSave = () => {
      onSave({
        ...problem,
        notes,
        rating,
        lastAttempt,
        code: codeSnippets[0]?.code || "",
      });
    };
  
    return (
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-5">
        <SheetHeader className="p-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              {problem.title}
            </SheetTitle>
            <Button variant="outline" size="sm" asChild className="mr-5">
              <a href={problem.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                LeetCode
              </a>
            </Button>
          </div>
          <SheetDescription>Problem details and your solutions</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Problem Info and Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Difficulty</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type={showDifficulty ? "text" : "password"}
                    value={problem.difficulty}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDifficulty(!showDifficulty)}
                  >
                    {showDifficulty ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
  
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type={showCategory ? "text" : "password"}
                    value={problem.topic}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCategory(!showCategory)}
                  >
                    {showCategory ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
            </div>
  
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Interview Difficulty Rating (1-10)
                </Label>
                <div className="flex items-center gap-2 mt-1">
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
                <div className="text-xs text-muted-foreground mt-1">
                  10 = Easiest interview question
                </div>
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
            </div>
          </div>
  
          {/* Notes Section */}
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