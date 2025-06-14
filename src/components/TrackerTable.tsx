"use client";

import { useState, useTransition } from "react";
import { useTracker } from "@/hooks/use-tracker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, LinkIcon, Trash2, Plus, BookOpen, Group } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { curatedLists } from "@/lib/curated-lists";
import {
  getDifficultyColor,
  getTopicColor,
  getStatusColor,
} from "@/lib/color-matching";
import { AddProblemModal } from "@/components/AddProblemModal";
import { Sheet } from "./ui/sheet";
import { ProblemDetailSheet } from "./ProblemDetailSheet";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  url: string;
  description: string;
  examples: any[];
  constraints: string[];
  starterCode: string;
  slug: string;
}

interface UserProblem {
  id: string;
  problemId: string;
  userId: string;
  status: string;
  lastAttempt: string | null;
  notes: string | null;
  code: string | null;
  rating: number | null;
}

interface ProblemWithUserData {
  problem: Problem;
  userProblem: UserProblem;
}

const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Stuck",
  "Partial Solution",
  "Completed",
  "Needs Optimization",
  "Revisit",
];

// Utility to format status for display
function formatStatus(status: string) {
  // Convert snake_case or lowercase to Title Case
  return status
    .replace(/_/g, " ")
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

export function TrackerTable() {
  const { problems, isLoading, error, mutate } = useTracker();
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [groupBy, setGroupBy] = useState<
    "none" | "difficulty" | "topic" | "status"
  >("none");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my-problems");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProblem, setSelectedProblem] =
    useState<ProblemWithUserData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRating, setEditingRating] = useState<{
    id: string;
    value: string;
  } | null>(null);
  const [editingDate, setEditingDate] = useState<{
    id: string;
    value: Date | undefined;
  } | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  const filteredProblems = (problems as ProblemWithUserData[]).filter(
    (item: ProblemWithUserData) => {
      const matchesSearch = item.problem.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        difficultyFilter === "all" ||
        item.problem.difficulty === difficultyFilter;
      const matchesTopic =
        topicFilter === "all" || item.problem.topic === topicFilter;
      const matchesStatus =
        statusFilter === "all" || item.userProblem.status === statusFilter;

      return (
        matchesSearch && matchesDifficulty && matchesTopic && matchesStatus
      );
    }
  );

  const handleProblemClick = (
    problem: ProblemWithUserData,
    event: React.MouseEvent
  ) => {
    const target = event.target as HTMLElement;
    const cell = target.closest("td");
    if (!cell) return;

    // Get the index of the clicked cell
    const cellIndex = Array.from(cell.parentElement?.children || []).indexOf(
      cell
    );

    // If clicked on the problem name cell (index 0)
    if (cellIndex === 0) {
      setSelectedProblem(problem);
      setIsSheetOpen(true);
    }
  };

  const groupedProblems = () => {
    if (groupBy === "none") return { "All Problems": filteredProblems };

    return filteredProblems.reduce(
      (
        groups: Record<string, ProblemWithUserData[]>,
        item: ProblemWithUserData
      ) => {
        const key =
          groupBy === "difficulty"
            ? item.problem.difficulty
            : groupBy === "topic"
            ? item.problem.topic
            : groupBy === "status"
            ? item.userProblem.status
            : "All Problems";

        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
      },
      {}
    );
  };

  const handleRatingChange = async (problemId: string, value: string) => {
    // Only allow numbers between 1-10
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1 || numValue > 10) {
      return;
    }

    // Find the problem to get its slug
    const problem = (problems as ProblemWithUserData[]).find(
      (p) => p.problem.id === problemId
    );

    if (!problem) {
      console.error("Problem not found");
      return;
    }

    // Optimistically update the UI
    mutate((currentProblems) => {
      if (!currentProblems) return currentProblems;
      return currentProblems.map((p) =>
        p.problem.id === problemId
          ? {
              ...p,
              userProblem: { ...p.userProblem, rating: numValue },
            }
          : p
      );
    }, false);

    // Start a transition for the API call
    startTransition(async () => {
      try {
        await fetch(`/api/problems/${problem.problem.slug}/rating`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating: numValue }),
        });
        // Revalidate after successful update
        mutate();
      } catch (error) {
        console.error("Failed to update rating:", error);
        // Revert the optimistic update if the API call fails
        mutate((currentProblems) => {
          if (!currentProblems) return currentProblems;
          return currentProblems.map((p) =>
            p.problem.id === problemId
              ? {
                  ...p,
                  userProblem: {
                    ...p.userProblem,
                    rating: p.userProblem.rating || 7,
                  },
                }
              : p
          );
        }, false);
      }
    });
  };

  const handleDateChange = async (
    problemId: string,
    date: Date | undefined
  ) => {
    // Find the problem to get its slug
    const problem = (problems as ProblemWithUserData[]).find(
      (p) => p.problem.id === problemId
    );

    if (!problem) {
      console.error("Problem not found");
      return;
    }

    // Optimistically update the UI
    mutate((currentProblems) => {
      if (!currentProblems) return currentProblems;
      return currentProblems.map((p) =>
        p.problem.id === problemId
          ? {
              ...p,
              userProblem: {
                ...p.userProblem,
                lastAttempt: date?.toISOString() || null,
              },
            }
          : p
      );
    }, false);

    // Start a transition for the API call
    startTransition(async () => {
      try {
        await fetch(`/api/problems/${problem.problem.slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lastAttempt: date?.toISOString() || null }),
        });
        // Revalidate after successful update
        mutate();
      } catch (error) {
        console.error("Failed to update date:", error);
        // Revert the optimistic update if the API call fails
        mutate((currentProblems) => {
          if (!currentProblems) return currentProblems;
          return currentProblems.map((p) =>
            p.problem.id === problemId
              ? {
                  ...p,
                  userProblem: {
                    ...p.userProblem,
                    lastAttempt: p.userProblem.lastAttempt,
                  },
                }
              : p
          );
        }, false);
      }
    });
  };

  const handleStatusChange = async (problemId: string, newStatus: string) => {
    // Find the problem to get its slug
    const problem = (problems as ProblemWithUserData[]).find(
      (p) => p.problem.id === problemId
    );
    if (!problem) {
      console.error("Problem not found");
      return;
    }
    // Optimistically update the UI
    mutate((currentProblems) => {
      if (!currentProblems) return currentProblems;
      return currentProblems.map((p) =>
        p.problem.id === problemId
          ? {
              ...p,
              userProblem: { ...p.userProblem, status: newStatus },
            }
          : p
      );
    }, false);
    // Start a transition for the API call
    startTransition(async () => {
      try {
        await fetch(`/api/problems/${problem.problem.slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });
        mutate();
      } catch (error) {
        console.error("Failed to update status:", error);
        // Revert the optimistic update if the API call fails
        mutate((currentProblems) => {
          if (!currentProblems) return currentProblems;
          return currentProblems.map((p) =>
            p.problem.id === problemId
              ? {
                  ...p,
                  userProblem: {
                    ...p.userProblem,
                    status: problem.userProblem.status,
                  },
                }
              : p
          );
        }, false);
      }
    });
  };

  const handleSaveProblem = async (updatedProblem: any) => {
    try {
      await fetch(`/api/problems/${updatedProblem.problem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProblem),
      });
      mutate();
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Failed to update problem:", error);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedProblem(null);
  };

  const handleGroupByChange = (
    value: "none" | "difficulty" | "topic" | "status"
  ) => {
    setGroupBy(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse bg-muted rounded" />
        <div className="h-[400px] animate-pulse bg-muted rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-red-500">
          Error loading problems. Please try again later.
        </p>
      </div>
    );
  }

  // if ((problems as ProblemWithUserData[]).length === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
  //       <p className="text-gray-500">No problems added yet.</p>
  //       <Button onClick={() => setIsAddModalOpen(true)}>
  //         <Plus className="w-4 h-4 mr-2" />
  //         Add Your First Problem
  //       </Button>
  //     </div>
  //   );
  // }

  return (
    <Tabs
      defaultValue="my-problems"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="my-problems">My Problems</TabsTrigger>
        <TabsTrigger value="blind75">Blind 75</TabsTrigger>
        <TabsTrigger value="neetcode150">NeetCode 150</TabsTrigger>
        <TabsTrigger value="grind75">Grind 75</TabsTrigger>
      </TabsList>

      {/* My Problems Tab */}
      <TabsContent value="my-problems" className="space-y-6">
        {/* Problems Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Problems ({filteredProblems.length})</CardTitle>
                <CardDescription>
                  Click on any problem to edit details
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* Group By Selector */}
                <Select value={groupBy} onValueChange={handleGroupByChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Grouping</SelectItem>
                    <SelectItem value="difficulty">By Difficulty</SelectItem>
                    <SelectItem value="topic">By Topic</SelectItem>
                    <SelectItem value="status">By Status</SelectItem>
                  </SelectContent>
                </Select>

                {/* Add Problem Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Problem
                </Button>

                {/* Clear Progress Button */}
                <AlertDialog
                  open={isClearModalOpen}
                  onOpenChange={setIsClearModalOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Progress
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Progress</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your tracked problems
                        and progress. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          // TODO: Implement clear progress functionality
                          setIsClearModalOpen(false);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Clear All Progress
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search problems..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="Array">Array</SelectItem>
                    <SelectItem value="String">String</SelectItem>
                    <SelectItem value="Linked List">Linked List</SelectItem>
                    <SelectItem value="Tree">Tree</SelectItem>
                    <SelectItem value="Stack">Stack</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Solved">Solved</SelectItem>
                    <SelectItem value="Attempted">Attempted</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Object.entries(groupedProblems()).map(([groupName, problems]) => (
              <div key={groupName} className="mb-6 last:mb-0">
                {groupBy !== "none" && (
                  <div className="flex items-center gap-2 mb-3">
                    <Group className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{groupName}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {problems.length} problems
                    </Badge>
                  </div>
                )}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="border-r w-[700px]">
                          Problem
                        </TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Last Attempt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {problems.map((item: ProblemWithUserData) => (
                        <TableRow
                          key={item.problem.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => handleProblemClick(item, e)}
                        >
                          <TableCell className="font-medium border-r w-[700px]">
                            {item.problem.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getDifficultyColor(
                                item.problem.difficulty
                              )}
                            >
                              {item.problem.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getTopicColor(item.problem.topic)}
                            >
                              {item.problem.topic}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="relative w-[200px] min-h-[40px] flex items-center">
                              <div
                                className={`flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 transition-opacity duration-200 ${
                                  isPending ? "opacity-50" : "opacity-100"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingStatus(item.problem.id);
                                }}
                                style={{ width: "100%" }}
                              >
                                <Badge
                                  className={getStatusColor(
                                    item.userProblem.status
                                  )}
                                >
                                  {formatStatus(item.userProblem.status)}
                                </Badge>
                              </div>
                              {editingStatus === item.problem.id && (
                                <div className="absolute left-0 top-0 w-full z-50">
                                  <Select
                                    value={item.userProblem.status}
                                    onValueChange={(value) => {
                                      handleStatusChange(
                                        item.problem.id,
                                        value
                                      );
                                      setEditingStatus(null);
                                    }}
                                    open
                                    onOpenChange={(open) => {
                                      if (!open) setEditingStatus(null);
                                    }}
                                  >
                                    <SelectTrigger className="sr-only" />
                                    <SelectContent className="z-50 w-[200px]">
                                      {STATUS_OPTIONS.filter(
                                        (status) =>
                                          status !== item.userProblem.status
                                      ).map((status) => (
                                        <SelectItem key={status} value={status}>
                                          {formatStatus(status)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {editingRating?.id === item.problem.id ? (
                              <div className="flex items-center">
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={editingRating.value}
                                  onChange={(e) =>
                                    setEditingRating({
                                      id: item.problem.id,
                                      value: e.target.value,
                                    })
                                  }
                                  onBlur={() => {
                                    if (editingRating) {
                                      handleRatingChange(
                                        item.problem.id,
                                        editingRating.value
                                      );
                                      setEditingRating(null);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      if (editingRating) {
                                        handleRatingChange(
                                          item.problem.id,
                                          editingRating.value
                                        );
                                        setEditingRating(null);
                                      }
                                    } else if (e.key === "Escape") {
                                      setEditingRating(null);
                                    }
                                  }}
                                  className={`w-8 h-6 text-sm px-0.5 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 m-0 transition-opacity duration-200 ${
                                    isPending ? "opacity-50" : "opacity-100"
                                  }`}
                                  autoFocus
                                />
                                <span className="text-xs text-gray-400">
                                  /10
                                </span>
                              </div>
                            ) : (
                              <div
                                className={`flex items-center gap-0.5 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 transition-opacity duration-200 ${
                                  isPending ? "opacity-50" : "opacity-100"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRating({
                                    id: item.problem.id,
                                    value: "",
                                  });
                                }}
                              >
                                {item.userProblem.rating ? (
                                  <>
                                    <span className="text-sm font-medium">
                                      {item.userProblem.rating}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      /10
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    Click to rate
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div className="relative">
                              <Popover
                                open={editingDate?.id === item.problem.id}
                                onOpenChange={(open) =>
                                  !open && setEditingDate(null)
                                }
                              >
                                <PopoverTrigger asChild>
                                  <div
                                    className={`flex items-center gap-0.5 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 transition-opacity duration-200 ${
                                      isPending ? "opacity-50" : "opacity-100"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingDate({
                                        id: item.problem.id,
                                        value: item.userProblem.lastAttempt
                                          ? new Date(
                                              item.userProblem.lastAttempt
                                            )
                                          : undefined,
                                      });
                                    }}
                                  >
                                    {item.userProblem.lastAttempt
                                      ? new Date(
                                          item.userProblem.lastAttempt
                                        ).toLocaleDateString()
                                      : "Click to set date"}
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={editingDate?.value}
                                    onSelect={(date) => {
                                      handleDateChange(item.problem.id, date);
                                      setEditingDate(null);
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Curated Lists Tabs */}
      {["blind75", "neetcode150", "grind75"].map((listKey) => (
        <TabsContent key={listKey} value={listKey} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {listKey === "blind75"
                  ? "Blind 75"
                  : listKey === "neetcode150"
                  ? "NeetCode 150"
                  : "Grind 75"}
              </CardTitle>
              <CardDescription>
                {listKey === "blind75" &&
                  "Essential 75 problems for technical interviews"}
                {listKey === "neetcode150" &&
                  "Comprehensive 150 problems covering all important patterns"}
                {listKey === "grind75" &&
                  "Curated list of 75 problems for interview preparation"}
              </CardDescription>

              {/* Filter Controls for curated lists */}
              <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search problems..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={difficultyFilter}
                    onValueChange={setDifficultyFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={topicFilter} onValueChange={setTopicFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      <SelectItem value="Array">Array</SelectItem>
                      <SelectItem value="String">String</SelectItem>
                      <SelectItem value="Linked List">Linked List</SelectItem>
                      <SelectItem value="Tree">Tree</SelectItem>
                      <SelectItem value="Stack">Stack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Problem</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProblems.map((item: ProblemWithUserData) => (
                      <TableRow
                        key={item.problem.id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {item.problem.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getDifficultyColor(
                              item.problem.difficulty
                            )}
                          >
                            {item.problem.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getTopicColor(item.problem.topic)}
                          >
                            {item.problem.topic}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(item.userProblem.status)}
                          >
                            {formatStatus(item.userProblem.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleProblemClick(item, e)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}

      {/* Add Problem Modal */}
      <AddProblemModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onProblemAdded={mutate}
      />

      {/* Problem Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {selectedProblem && (
          <ProblemDetailSheet
            problem={selectedProblem}
            onSave={handleSaveProblem}
            onClose={handleCloseSheet}
            mutate={mutate}
          />
        )}
      </Sheet>
    </Tabs>
  );
}
