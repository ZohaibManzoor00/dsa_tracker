import { db } from "@/lib/db/config";
import { problems, userProblems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getAllProblems() {
  try {
    const allProblems = await db.select().from(problems);
    return { data: allProblems, error: null };
  } catch (error) {
    console.error("Error fetching problems:", error);
    return { data: null, error: "Failed to fetch problems" };
  }
}

export async function getProblemBySlug(slug: string) {
  try {
    const problem = await db
      .select()
      .from(problems)
      .where(eq(problems.slug, slug))
      .limit(1);

    return { data: problem[0], error: null };
  } catch (error) {
    console.error("Error fetching problem:", error);
    return { data: null, error: "Failed to fetch problem" };
  }
}

export async function getUserProblems(userId: string) {
  try {
    const userProblemsList = await db
      .select({
        problem: problems,
        userProblem: userProblems,
      })
      .from(userProblems)
      .innerJoin(problems, eq(userProblems.problemId, problems.id))
      .where(eq(userProblems.userId, userId));

    return { data: userProblemsList, error: null };
  } catch (error) {
    console.error("Error fetching user problems:", error);
    return { data: null, error: "Failed to fetch user problems" };
  }
}

export async function updateUserProblemStatus(
  userId: string,
  problemId: number,
  status: "Not Started" | "In Progress" | "Solved"
) {
  try {
    const updated = await db
      .update(userProblems)
      .set({ status })
      .where(
        eq(userProblems.userId, userId) && eq(userProblems.problemId, problemId)
      )
      .returning();

    return { data: updated[0], error: null };
  } catch (error) {
    console.error("Error updating problem status:", error);
    return { data: null, error: "Failed to update problem status" };
  }
}
