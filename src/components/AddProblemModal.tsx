import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { neetcodeProblems, CuratedProblem } from "@/lib/neetcode-problems";
import { getDifficultyColor, getTopicColor } from "@/lib/color-matching";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LinkIcon, Plus, Check } from "lucide-react";
import { useTracker } from "@/hooks/use-tracker";

interface AddProblemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProblemAdded: () => void;
}

export function AddProblemModal({
  isOpen,
  onOpenChange,
  onProblemAdded,
}: AddProblemModalProps) {
  const { userId } = useAuth();
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { problems, mutate } = useTracker();

  const isProblemAdded = (problemTitle: string) => {
    return problems.some((p: any) => p.problem.title === problemTitle);
  };

  const handleAddFromSlug = async (slug: string) => {
    if (!slug) {
      toast.error("Invalid problem slug");
      return;
    }

    // Format the URL properly
    const formattedUrl = `https://leetcode.com/problems/${slug}/`;
    setLeetcodeUrl(formattedUrl);

    try {
      // Use the formatted URL directly instead of waiting for state update
      const match = formattedUrl.match(/leetcode\.com\/problems\/([^/]+)/);
      if (!match) {
        console.error("Invalid LeetCode URL format:", formattedUrl);
        toast.error("Invalid LeetCode URL");
        return;
      }

      const problemSlug = match[1];
      setIsLoading(true);

      console.log("Fetching problem data for slug:", problemSlug);

      // Fetch problem data from LeetCode API
      const response = await fetch("/api/leetcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titleSlug: problemSlug }),
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `Failed to fetch problem data: ${response.status} ${response.statusText}`
        );
      }

      const problemData: LeetCodeProblem = await response.json();
      console.log("Received problem data:", {
        title: problemData.title,
        titleSlug: problemData.titleSlug,
        difficulty: problemData.difficulty,
        hasContent: !!problemData.content,
        hasExamples: !!problemData.exampleTestcases,
        hasCodeSnippets: !!problemData.codeSnippets?.length,
        hasTopicTags: !!problemData.topicTags?.length,
        fullData: problemData,
      });

      if (!problemData || !problemData.title) {
        console.error("Invalid problem data received:", problemData);
        throw new Error("Invalid problem data received from API");
      }

      // Extract only the essential information
      const description = problemData.content
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/Example\s*\d*:[\s\S]*?(?=Constraints:|$)/gi, "") // Remove examples
        .replace(/Constraints:[\s\S]*$/gi, "") // Remove constraints section
        .replace(/\n\s*\n/g, "\n\n") // Clean up newlines
        .replace(/&nbsp;/g, " ") // Replace &nbsp;
        .trim();

      // Parse examples from the problem data
      const examples: Example[] = [];
      if (problemData.exampleTestcases) {
        const testCases = problemData.exampleTestcases.split("\n");
        for (let i = 0; i < testCases.length; i += 2) {
          if (i + 1 < testCases.length) {
            examples.push({
              input: decodeHTMLEntities(testCases[i]),
              output: decodeHTMLEntities(testCases[i + 1]),
              explanation: "",
            });
          }
        }
      }

      // Extract constraints from content
      const constraintsMatch = problemData.content.match(
        /<p><strong>Constraints:<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/
      );
      const constraints = constraintsMatch
        ? constraintsMatch[1]
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .split("\n") // Split into array by newlines
            .map((c: string) => decodeHTMLEntities(c.trim())) // Decode HTML entities and trim
            .filter((c: string) => c.length > 0) // Remove empty lines
        : [];

      // Get topic from topicTags
      const topic = problemData.topicTags[0]?.name || "Unknown";

      // Prepare the problem data for saving
      const problemToSave = {
        title: problemData.title,
        slug: problemData.titleSlug,
        difficulty: problemData.difficulty,
        topic: topic,
        url: formattedUrl,
        description: description,
        examples: examples,
        constraints: constraints,
        starterCode:
          problemData.codeSnippets.find(
            (snippet: { langSlug: string; code: string }) =>
              snippet.langSlug === "typescript"
          )?.code || "",
      };

      // Save the problem to the database
      const saveResponse = await fetch("/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(problemToSave),
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error("Save Error Response:", {
          status: saveResponse.status,
          statusText: saveResponse.statusText,
          body: errorText,
        });
        throw new Error(
          `Failed to save problem: ${saveResponse.status} ${saveResponse.statusText}`
        );
      }

      const savedProblem = await saveResponse.json();
      console.log("Saved problem:", savedProblem);

      // Refresh the problems list
      await mutate();

      toast.success("Problem added successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding problem:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add problem"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get 3 random problems from the list, only when modal opens
  const randomProblems = useMemo(() => {
    return [...neetcodeProblems].sort(() => Math.random() - 0.5).slice(0, 3);
  }, [isOpen]); // Only re-randomize when modal opens/closes

  const handleAddProblem = async (problem: CuratedProblem) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(problem),
      });

      if (!response.ok) {
        const error = await response.text();
        console.log("Error response:", error);

        if (
          error === "Problem already exists in your list" ||
          error.includes("is already in your list")
        ) {
          toast.error("This problem is already in your list", {
            description: "You can find it in your problem list above",
            duration: 4000,
          });
        } else if (error.includes("Missing required fields")) {
          toast.error("Missing information", {
            description: "Please make sure all required fields are filled out",
            duration: 4000,
          });
        } else if (error.includes("Invalid LeetCode URL")) {
          toast.error("Invalid URL", {
            description: "Please enter a valid LeetCode problem URL",
            duration: 4000,
          });
        } else {
          console.log("Falling back to generic error");
          toast.error("Something went wrong", {
            description: "Please try again in a moment",
            duration: 4000,
          });
        }
        return;
      }

      toast.success("Problem added successfully");
      onProblemAdded();
      setLeetcodeUrl(""); // Clear the URL input
    } catch (error) {
      console.error("Caught error:", error);
      toast.error("Failed to add problem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFromUrl = async () => {
    try {
      setIsLoading(true);

      // Extract problem details from URL
      const match = leetcodeUrl.match(/leetcode\.com\/problems\/([^/]+)/);
      if (!match) {
        console.error("Invalid LeetCode URL format:", leetcodeUrl);
        toast.error("Invalid LeetCode URL");
        return;
      }

      const slug = match[1];
      console.log("Extracted slug:", slug);

      // First, fetch problem details from LeetCode API
      console.log("Fetching problem details from LeetCode API...");
      const leetcodeResponse = await fetch("/api/leetcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titleSlug: slug }),
      });

      if (!leetcodeResponse.ok) {
        const errorText = await leetcodeResponse.text();
        console.error("LeetCode API error:", errorText);
        throw new Error(
          `Failed to fetch problem details from LeetCode: ${errorText}`
        );
      }

      const leetcodeData = await leetcodeResponse.json();
      console.log("Received LeetCode data:", leetcodeData);

      if (!leetcodeData) {
        console.error("No data received from LeetCode API");
        throw new Error("No data received from LeetCode API");
      }

      const problemData = leetcodeData;
      console.log("Problem data:", {
        title: problemData.title,
        difficulty: problemData.difficulty,
        topicTags: problemData.topicTags,
      });

      // Extract only the essential information
      const description = problemData.content
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/Example\s*\d*:[\s\S]*?(?=Constraints:|$)/gi, "") // Remove examples
        .replace(/Constraints:[\s\S]*$/gi, "") // Remove constraints section
        .replace(/\n\s*\n/g, "\n\n") // Clean up newlines
        .replace(/&nbsp;/g, " ") // Replace &nbsp;
        .trim();

      // Parse examples from the problem data
      const examples: Example[] = [];
      if (problemData.exampleTestcases) {
        const testCases = problemData.exampleTestcases.split("\n");
        for (let i = 0; i < testCases.length; i += 2) {
          if (i + 1 < testCases.length) {
            examples.push({
              input: decodeHTMLEntities(testCases[i]),
              output: decodeHTMLEntities(testCases[i + 1]),
              explanation: "",
            });
          }
        }
      }

      // Extract constraints from content
      const constraintsMatch = problemData.content.match(
        /<p><strong>Constraints:<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/
      );
      const constraints = constraintsMatch
        ? constraintsMatch[1]
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .split("\n") // Split into array by newlines
            .map((c: string) => decodeHTMLEntities(c.trim())) // Decode HTML entities and trim
            .filter((c: string) => c.length > 0) // Remove empty lines
        : [];

      // Get topic from topicTags
      const topic = problemData.topicTags[0]?.name || "Unknown";

      // Prepare the problem data for saving
      const problemToSave = {
        title: problemData.title,
        slug: problemData.titleSlug,
        difficulty: problemData.difficulty,
        topic: topic,
        url: leetcodeUrl,
        description: description,
        examples: examples,
        constraints: constraints,
        starterCode:
          problemData.codeSnippets.find(
            (snippet: { langSlug: string; code: string }) =>
              snippet.langSlug === "typescript"
          )?.code || "",
      };

      // Save the problem to the database
      console.log("Saving problem to database...");
      const response = await fetch("/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(problemToSave),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Error saving problem:", error);

        if (
          error === "Problem already exists in your list" ||
          error.includes("is already in your list")
        ) {
          toast.error("This problem is already in your list", {
            description: "You can find it in your problem list above",
            duration: 4000,
          });
        } else if (error.includes("Missing required fields")) {
          toast.error("Missing information", {
            description: "Please make sure all required fields are filled out",
            duration: 4000,
          });
        } else if (error.includes("Invalid LeetCode URL")) {
          toast.error("Invalid URL", {
            description: "Please enter a valid LeetCode problem URL",
            duration: 4000,
          });
        } else {
          console.error("Unexpected error:", error);
          toast.error("Something went wrong", {
            description: "Please try again in a moment",
            duration: 4000,
          });
        }
        return;
      }

      const savedProblem = await response.json();
      console.log("Problem saved successfully:", savedProblem);

      toast.success("Problem added successfully");
      onProblemAdded();
      setLeetcodeUrl(""); // Clear the URL input
    } catch (error) {
      console.error("Error in handleAddFromUrl:", error);
      toast.error("Failed to add problem", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to decode HTML entities
  function decodeHTMLEntities(text: string): string {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }

  // Helper function to format problem description
  function formatProblemDescription(content: string): string {
    // First decode HTML entities
    let formatted = decodeHTMLEntities(content);

    // Remove HTML tags
    formatted = formatted.replace(/<[^>]*>/g, "");

    // Remove examples section
    formatted = formatted.replace(
      /Example\s*\d*:[\s\S]*?(?=Constraints:|$)/gi,
      ""
    );

    // Replace multiple newlines with a single one
    formatted = formatted.replace(/\n\s*\n/g, "\n\n");

    // Replace &nbsp; with space
    formatted = formatted.replace(/&nbsp;/g, " ");

    // Fix spacing around special characters
    formatted = formatted.replace(/\s*([.,;:!?])\s*/g, "$1 ");

    // Fix spacing around brackets and parentheses
    formatted = formatted.replace(/\s*([\[\](){}])\s*/g, "$1");

    // Fix spacing around operators
    formatted = formatted.replace(/\s*([+\-*/=<>])\s*/g, " $1 ");

    // Remove extra spaces
    formatted = formatted.replace(/\s+/g, " ").trim();

    return formatted;
  }

  interface Example {
    input: string;
    output: string;
    explanation: string;
  }

  interface LeetCodeProblem {
    title: string;
    titleSlug: string;
    difficulty: string;
    content: string;
    exampleTestcases: string;
    codeSnippets: Array<{ code: string; langSlug: string }>;
    topicTags: Array<{ name: string; slug: string }>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Problem</DialogTitle>
          <DialogDescription>
            Add a problem from LeetCode URL or choose from our curated list
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="leetcode-url">LeetCode URL</Label>
            <div className="flex gap-2">
              <Input
                id="leetcode-url"
                placeholder="https://leetcode.com/problems/two-sum/"
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
              />
              <Button
                onClick={handleAddFromUrl}
                disabled={
                  !leetcodeUrl.includes("leetcode.com/problems/") || isLoading
                }
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or choose from our curated list
              </span>
            </div>
          </div>

          {/* Random Problems */}
          <div className="space-y-4">
            {randomProblems.map((problem) => {
              const alreadyAdded = isProblemAdded(problem.title);
              return (
                <div
                  key={problem.slug}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{problem.title}</h3>
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(problem.difficulty)}
                      >
                        {problem.difficulty}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getTopicColor(problem.topic)}
                      >
                        {problem.topic}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFromSlug(problem.slug)}
                    disabled={alreadyAdded || isLoading}
                  >
                    {alreadyAdded ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
