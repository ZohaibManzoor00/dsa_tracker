import { NextResponse } from "next/server";

const LEETCODE_API_URL = "https://leetcode.com/graphql";

const PROBLEM_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      difficulty
      content
      exampleTestcases
      codeSnippets {
        lang
        langSlug
        code
      }
      topicTags {
        name
        slug
      }
    }
  }
`;

export async function POST(request: Request) {
  try {
    const { titleSlug } = await request.json();

    if (!titleSlug) {
      return NextResponse.json(
        { error: "Title slug is required" },
        { status: 400 }
      );
    }

    const response = await fetch(LEETCODE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: PROBLEM_QUERY,
        variables: { titleSlug },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from LeetCode API");
    }

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: data.data.question });
  } catch (error) {
    console.error("Error fetching from LeetCode:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem data" },
      { status: 500 }
    );
  }
}
