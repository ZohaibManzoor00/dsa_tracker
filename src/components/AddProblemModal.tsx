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
  const { problems } = useTracker();

  // Get 3 random problems from the list, only when modal opens
  const randomProblems = useMemo(() => {
    return [...neetcodeProblems]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }, [isOpen]); // Only re-randomize when modal opens/closes

  const isProblemAdded = (problemTitle: string) => {
    return problems.some((p: any) => p.problem.title === problemTitle);
  };

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
        toast.error("Invalid LeetCode URL");
        return;
      }

      const slug = match[1];
      const title = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const response = await fetch("/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          difficulty: "Medium", // Default difficulty
          topic: "Array", // Default topic
          url: leetcodeUrl,
        }),
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
                  key={problem.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getTopicColor(problem.topic)}
                      >
                        {problem.topic}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{problem.title}</h4>
                  </div>
                  <Button
                    variant={alreadyAdded ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleAddProblem(problem)}
                    disabled={isLoading || alreadyAdded}
                  >
                    {alreadyAdded ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
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
