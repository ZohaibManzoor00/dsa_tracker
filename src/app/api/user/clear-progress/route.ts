import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { userProblems, attemptHistory, codeSnippets } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check for existence
    const userProblemsList = await db
      .select()
      .from(userProblems)
      .where(eq(userProblems.userId, userId));
    if (!userProblemsList.length) {
      return new NextResponse("No problems to clear", { status: 400 });
    }

    // Get all userProblem IDs for this user
    const userProblemIds = userProblemsList.map((up) => up.id);

    // Delete associated attemptHistory and codeSnippets by userProblemId
    if (userProblemIds.length > 0) {
      await db
        .delete(attemptHistory)
        .where(inArray(attemptHistory.userProblemId, userProblemIds));
      await db
        .delete(codeSnippets)
        .where(inArray(codeSnippets.userProblemId, userProblemIds));
    }

    // Delete userProblems
    await db.delete(userProblems).where(eq(userProblems.userId, userId));

    return new NextResponse("Progress cleared", { status: 200 });
  } catch (error) {
    console.error("[CLEAR_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
