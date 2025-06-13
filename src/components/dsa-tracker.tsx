"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Target, Building2 } from "lucide-react";
import { InterviewProgressSection } from "./InterviewProgressSection";
import { HeatMap } from "./HeatMap";
import { AddProblemDialog } from "./AddProblemDialog";
import { Sheet } from "./ui/sheet";
import { ProblemDetailSheet } from "./ProblemDetailSheet";
import { TrackerTable } from "./TrackerTable";

const mockSessions = [
  {
    id: 1,
    name: "General Prep",
    type: "ongoing",
    problemCount: 45,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Google Interview",
    type: "company",
    problemCount: 23,
    createdAt: "2024-02-01",
  },
  {
    id: 3,
    name: "Meta Prep",
    type: "company",
    problemCount: 18,
    createdAt: "2024-02-10",
  },
  {
    id: 4,
    name: "System Design Role",
    type: "role",
    problemCount: 12,
    createdAt: "2024-02-15",
  },
];

export function DSATracker() {
  const [currentSession, setCurrentSession] = useState(mockSessions[0]);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [userProblems, setUserProblems] = useState<any>([]);

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "company":
        return <Building2 className="w-4 h-4" />;
      case "role":
        return <Target className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const handleSaveProblem = (updatedProblem: any) => {
    setUserProblems(
      userProblems.map((p) => (p.id === updatedProblem.id ? updatedProblem : p))
    );
    setIsSheetOpen(false);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedProblem(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">DSA Tracker</h1>
              <p className="text-muted-foreground">
                Track your data structures and algorithms progress
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={currentSession.id.toString()}
                onValueChange={(value) => {
                  const session = mockSessions.find(
                    (s) => s.id.toString() === value
                  );
                  if (session) setCurrentSession(session);
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      <div className="flex items-center gap-2">
                        {getSessionIcon(session.type)}
                        <span>{session.name}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {session.problemCount}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AddProblemDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <InterviewProgressSection />

        <HeatMap />

        <TrackerTable />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {selectedProblem && (
          <ProblemDetailSheet
            problem={selectedProblem}
            onSave={handleSaveProblem}
            onClose={handleCloseSheet}
          />
        )}
      </Sheet>
    </div>
  );
}
