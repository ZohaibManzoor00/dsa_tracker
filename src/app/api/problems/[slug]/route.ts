import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import {
  getProblemBySlug,
  updateUserProblemStatus,
} from "@/lib/actions/problems";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { data, error } = await getProblemBySlug(params.slug);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
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

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = auth();
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
