import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  url: string;
  slug: string;
  description: string;
  examples: any[];
  constraints: string[];
  starterCode: string;
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export type { Problem, ProblemWithUserData };
export function useTracker() {
  const { userId } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<ProblemWithUserData[]>(
    userId ? `/api/problems?userOnly=true` : null,
    fetcher
  );

  return {
    problems: data || [],
    isLoading,
    error,
    mutate,
  };
}
