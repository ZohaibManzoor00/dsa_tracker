import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { problems, userProblems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getProblemBySlug,
  updateUserProblemStatus,
} from "@/lib/actions/problems";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [problem] = await db
      .select({
        problem: problems,
        userProblem: userProblems,
      })
      .from(userProblems)
      .innerJoin(problems, eq(userProblems.problemId, problems.id))
      .where(
        and(eq(userProblems.userId, userId), eq(problems.slug, params.slug))
      );

    if (!problem) {
      return new NextResponse("Problem not found", { status: 404 });
    }

    return NextResponse.json(problem);
  } catch (error) {
    console.error("[PROBLEM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { slug: string } }
) {
  const { slug } = context.params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { rating, notes, status, lastAttempt } = body;

    // First get the problem ID from the slug
    const [problem] = await db
      .select()
      .from(problems)
      .where(eq(problems.slug, slug))
      .limit(1);

    if (!problem) {
      return new NextResponse("Problem not found", { status: 404 });
    }

    // Update the user problem
    const [updatedProblem] = await db
      .update(userProblems)
      .set({
        rating: rating !== undefined ? rating : undefined,
        notes: notes !== undefined ? notes : undefined,
        status: status !== undefined ? status : undefined,
        lastAttempt:
          lastAttempt !== undefined ? new Date(lastAttempt) : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userProblems.userId, userId),
          eq(userProblems.problemId, problem.id)
        )
      )
      .returning();

    if (!updatedProblem) {
      return new NextResponse("Problem not found", { status: 404 });
    }

    // Get the complete problem data
    const [completeProblem] = await db
      .select({
        problem: problems,
        userProblem: userProblems,
      })
      .from(userProblems)
      .innerJoin(problems, eq(userProblems.problemId, problems.id))
      .where(eq(userProblems.id, updatedProblem.id));

    return NextResponse.json(completeProblem);
  } catch (error) {
    console.error("[PROBLEM_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const { data: problem, error: problemError } = await getProblemBySlug(
      params.slug
    );
    if (problemError || !problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const { data, error } = await updateUserProblemStatus(
      userId,
      problem.id,
      status
    );
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in problem API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
