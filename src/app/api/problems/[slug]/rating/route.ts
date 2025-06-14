import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { userProblems, problems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: Request,
  context: { params: { slug: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const { slug } = params;

    // First get the problem ID from the slug
    const [problem] = await db
      .select()
      .from(problems)
      .where(eq(problems.slug, slug))
      .limit(1);

    if (!problem) {
      return new NextResponse("Problem not found", { status: 404 });
    }

    const body = await request.json();
    const { rating } = body;

    if (typeof rating !== "number" || rating < 1 || rating > 10) {
      return new NextResponse("Invalid rating value", { status: 400 });
    }

    // Update the rating in the database
    const [updatedProblem] = await db
      .update(userProblems)
      .set({
        rating,
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

    return NextResponse.json(updatedProblem);
  } catch (error) {
    console.error("[RATING_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
