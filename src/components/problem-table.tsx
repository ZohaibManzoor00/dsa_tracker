"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProblems } from "@/hooks/use-problems";
import { Skeleton } from "@/components/ui/skeleton";

export function ProblemTable() {
  const { problems, isLoading, isError } = useProblems();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (isError) {
    return <div>Error loading problems</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Last Attempt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {problems.map((item: any) => (
          <TableRow key={item.problem.id}>
            <TableCell>{item.userProblem.status}</TableCell>
            <TableCell>{item.problem.title}</TableCell>
            <TableCell>{item.problem.difficulty}</TableCell>
            <TableCell>{item.problem.topic}</TableCell>
            <TableCell>
              {item.userProblem.lastAttempt
                ? new Date(item.userProblem.lastAttempt).toLocaleDateString()
                : "Never"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
