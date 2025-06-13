import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { problems, userProblems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userOnly = searchParams.get("userOnly") === "true";

    if (userOnly) {
      // Fetch only problems that belong to the user
      const userProblemsData = await db
        .select({
          problem: problems,
          userProblem: userProblems,
        })
        .from(userProblems)
        .innerJoin(problems, eq(userProblems.problemId, problems.id))
        .where(eq(userProblems.userId, userId));

      return NextResponse.json(userProblemsData);
    }

    // If not userOnly, return all problems
    const allProblems = await db.select().from(problems);
    return NextResponse.json(allProblems);
  } catch (error) {
    console.error("[PROBLEMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, difficulty, topic, url } = body;

    if (!title || !difficulty || !topic || !url) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Extract slug from URL
    const slug =
      url.split("/problems/")[1]?.replace(/\/$/, "") ||
      title.toLowerCase().replace(/\s+/g, "-");

    // First, check if the problem already exists by URL
    const existingProblem = await db
      .select()
      .from(problems)
      .where(eq(problems.url, url))
      .limit(1);

    let problemId;
    if (existingProblem.length > 0) {
      problemId = existingProblem[0].id;
    } else {
      try {
        // Create new problem
        const [newProblem] = await db
          .insert(problems)
          .values({
            slug,
            title,
            difficulty,
            topic,
            url,
            description: "",
            examples: [],
            constraints: [],
            starterCode: "",
          })
          .returning();
        problemId = newProblem.id;
      } catch (error: any) {
        // If we get a duplicate error, try to find the existing problem by slug
        if (error.message?.includes("duplicate key")) {
          const existingProblem = await db
            .select()
            .from(problems)
            .where(eq(problems.slug, slug))
            .limit(1);

          if (existingProblem.length > 0) {
            problemId = existingProblem[0].id;
          } else {
            return new NextResponse(`"${title}" is already in your list`, {
              status: 400,
            });
          }
        } else {
          throw error;
        }
      }
    }

    // Check if user already has this problem
    const existingUserProblem = await db
      .select()
      .from(userProblems)
      .where(
        and(
          eq(userProblems.userId, userId),
          eq(userProblems.problemId, problemId)
        )
      )
      .limit(1);

    if (existingUserProblem.length > 0) {
      return new NextResponse(`"${title}" is already in your list`, {
        status: 400,
      });
    }

    // Add problem to user's list
    const [userProblem] = await db
      .insert(userProblems)
      .values({
        userId,
        problemId,
        status: "not_started",
        rating: 0,
        notes: "",
        lastAttempt: null,
      })
      .returning();

    // Return the complete problem data
    const [completeProblem] = await db
      .select({
        problem: problems,
        userProblem: userProblems,
      })
      .from(userProblems)
      .innerJoin(problems, eq(userProblems.problemId, problems.id))
      .where(eq(userProblems.id, userProblem.id));

    return NextResponse.json(completeProblem);
  } catch (error: any) {
    // In case of any error, return a generic message since we might not have access to the title
    return new NextResponse("Problem already exists in your list", {
      status: 400,
    });
  }
}
