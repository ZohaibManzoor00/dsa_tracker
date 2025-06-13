import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";

// Progress data for the line graph
const progressData = [
  { milestone: "Beginner", problems: 0, reached: true, current: false },
  { milestone: "Learning", problems: 25, reached: true, current: false },
  { milestone: "Practicing", problems: 50, reached: true, current: true },
  { milestone: "Almost Ready", problems: 100, reached: false, current: false },
  { milestone: "Ready", problems: 150, reached: false, current: false },
  { milestone: "Beyond Ready", problems: 200, reached: false, current: false },
];

export function InterviewProgressSection() {
  const currentProblems = 64;
  const nextMilestone = progressData.find((m) => !m.reached);
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
                {currentProblems}
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
                const isReached =
                  milestone.reached || currentProblems >= milestone.problems;
                const isCurrent =
                  !isReached &&
                  (index === 0 ||
                    progressData[index - 1].reached ||
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
