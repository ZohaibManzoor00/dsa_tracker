import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useTracker } from "@/hooks/use-tracker";
import { useEffect } from "react";

export interface InterviewProgressSectionProps {
  mutate?: () => void;
}

export function InterviewProgressSection({
  mutate: externalMutate,
}: InterviewProgressSectionProps = {}) {
  const { problems, isLoading, mutate } = useTracker();

  // If an external mutate is provided, use it for refreshes (for future extensibility)
  useEffect(() => {
    if (externalMutate) {
      // Optionally, could listen to changes and trigger mutate
    }
  }, [externalMutate]);

  // Count solved problems (case-insensitive, matches 'Solved' or 'Completed')
  const solvedCount = problems.filter(
    (item) =>
      typeof item.userProblem.status === "string" &&
      ["solved", "completed"].includes(
        item.userProblem.status.trim().toLowerCase()
      )
  ).length;
  const currentProblems = isLoading ? 0 : solvedCount;

  // Determine milestone progress
  const progressData = [
    { milestone: "Beginner", problems: 0 },
    { milestone: "Learning", problems: 25 },
    { milestone: "Practicing", problems: 50 },
    { milestone: "Almost Ready", problems: 100 },
    { milestone: "Ready", problems: 150 },
    { milestone: "Beyond Ready", problems: 200 },
  ];
  const nextMilestone = progressData.find((m) => currentProblems < m.problems);
  const problemsToNext = nextMilestone
    ? nextMilestone.problems - currentProblems
    : 0;

  return (
    <div className="space-y-6 mb-6">
      {/* Progress Line Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Interview Readiness Journey
          </CardTitle>
          <CardDescription>
            Your progress towards DSA interview excellence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {isLoading ? "..." : currentProblems}
              </div>
              <div className="text-sm text-muted-foreground">
                Problems Solved
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {nextMilestone?.milestone || "Beyond Ready"}
              </div>
              <div className="text-sm text-muted-foreground">
                {nextMilestone
                  ? `${problemsToNext} problems to go`
                  : "You've made it!"}
              </div>
            </div>
          </div>

          {/* Progress Line */}
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
            <div className="flex justify-between items-center relative">
              {progressData.map((milestone, index) => {
                const isReached = currentProblems >= milestone.problems;
                const isCurrent =
                  !isReached &&
                  (index === 0 ||
                    currentProblems >= progressData[index - 1].problems);

                return (
                  <div
                    key={milestone.milestone}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-xs font-bold relative z-10 ${
                        isReached
                          ? "bg-green-500 border-green-500 text-white"
                          : isCurrent
                          ? "bg-blue-500 border-blue-500 text-white animate-pulse"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {isReached ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : isCurrent ? (
                        <Clock className="w-6 h-6" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <div
                        className={`text-sm font-medium ${
                          isReached
                            ? "text-green-600"
                            : isCurrent
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      >
                        {milestone.milestone}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {milestone.problems}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
