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
      console.error("Unauthorized: No userId found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    console.log("Received problem data:", {
      title: body.title,
      difficulty: body.difficulty,
      topic: body.topic,
      hasDescription: !!body.description,
      hasExamples: !!body.examples,
      hasConstraints: !!body.constraints,
      hasStarterCode: !!body.starterCode,
    });

    const {
      title,
      difficulty,
      topic,
      url,
      description,
      examples,
      constraints,
      starterCode,
    } = body;

    if (!title || !difficulty || !topic || !url) {
      console.error("Missing required fields:", {
        title,
        difficulty,
        topic,
        url,
      });
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Extract slug from URL
    const slug =
      url.split("/problems/")[1]?.replace(/\/$/, "") ||
      title.toLowerCase().replace(/\s+/g, "-");
    console.log("Extracted slug:", slug);

    // First, check if the problem already exists by URL
    console.log("Checking for existing problem by URL...");
    const existingProblem = await db
      .select()
      .from(problems)
      .where(eq(problems.url, url))
      .limit(1);

    let problemId;
    if (existingProblem.length > 0) {
      console.log("Found existing problem by URL:", existingProblem[0].id);
      problemId = existingProblem[0].id;
    } else {
      try {
        console.log("Creating new problem...");
        // Create new problem with all the details from LeetCode
        const [newProblem] = await db
          .insert(problems)
          .values({
            slug,
            title,
            difficulty,
            topic,
            url,
            description: description || "",
            examples: examples || "[]",
            constraints: constraints || "[]",
            starterCode: starterCode || "",
          })
          .returning();
        console.log("Created new problem:", newProblem.id);
        problemId = newProblem.id;
      } catch (error: any) {
        console.error("Error creating problem:", error);
        // If we get a duplicate error, try to find the existing problem by slug
        if (error.message?.includes("duplicate key")) {
          console.log(
            "Duplicate key error, checking for existing problem by slug..."
          );
          const existingProblem = await db
            .select()
            .from(problems)
            .where(eq(problems.slug, slug))
            .limit(1);

          if (existingProblem.length > 0) {
            console.log(
              "Found existing problem by slug:",
              existingProblem[0].id
            );
            problemId = existingProblem[0].id;
          } else {
            console.error(
              "No existing problem found despite duplicate key error"
            );
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
    console.log("Checking if user already has this problem...");
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
      console.log("User already has this problem");
      return new NextResponse(`"${title}" is already in your list`, {
        status: 400,
      });
    }

    // Add problem to user's list
    console.log("Adding problem to user's list...");
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
    console.log("Added problem to user's list:", userProblem.id);

    // Return the complete problem data
    console.log("Fetching complete problem data...");
    const [completeProblem] = await db
      .select({
        problem: problems,
        userProblem: userProblems,
      })
      .from(userProblems)
      .innerJoin(problems, eq(userProblems.problemId, problems.id))
      .where(eq(userProblems.id, userProblem.id));

    console.log("Successfully saved problem:", {
      problemId: completeProblem.problem.id,
      title: completeProblem.problem.title,
      userId: completeProblem.userProblem.userId,
      hasDescription: !!completeProblem.problem.description,
      hasExamples: !!completeProblem.problem.examples,
      hasConstraints: !!completeProblem.problem.constraints,
      hasStarterCode: !!completeProblem.problem.starterCode,
    });

    return NextResponse.json(completeProblem);
  } catch (error: any) {
    console.error("Error in problems POST route:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to save problem",
      { status: 500 }
    );
  }
}
