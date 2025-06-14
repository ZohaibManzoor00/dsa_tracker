import { NextResponse } from "next/server";

const LEETCODE_API_URL = "https://leetcode.com/graphql";

const PROBLEM_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
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
    console.log("Received request for titleSlug:", titleSlug);

    if (!titleSlug) {
      console.error("Missing titleSlug in request");
      return NextResponse.json(
        { error: "Title slug is required" },
        { status: 400 }
      );
    }

    console.log("Fetching from LeetCode API...");
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
      const errorText = await response.text();
      console.error("LeetCode API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Failed to fetch from LeetCode API: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Received LeetCode API response:", {
      hasData: !!data.data,
      hasErrors: !!data.errors,
      questionId: data.data?.question?.questionId,
      title: data.data?.question?.title,
      content: data.data?.question?.content ? "present" : "missing",
      exampleTestcases: data.data?.question?.exampleTestcases
        ? "present"
        : "missing",
      codeSnippets: data.data?.question?.codeSnippets
        ? `${data.data.question.codeSnippets.length} snippets`
        : "missing",
      topicTags: data.data?.question?.topicTags
        ? `${data.data.question.topicTags.length} tags`
        : "missing",
      fullResponse: JSON.stringify(data, null, 2),
    });

    if (data.errors) {
      console.error("LeetCode API returned errors:", data.errors);
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 400 }
      );
    }

    if (!data.data?.question) {
      console.error("No question data in LeetCode API response:", data);
      return NextResponse.json(
        { error: "No question data found" },
        { status: 404 }
      );
    }

    // Validate required fields
    const question = data.data.question;
    if (
      !question.content ||
      !question.exampleTestcases ||
      !question.codeSnippets ||
      !question.topicTags
    ) {
      console.error("Missing required fields in question data:", {
        hasContent: !!question.content,
        hasExamples: !!question.exampleTestcases,
        hasCodeSnippets: !!question.codeSnippets,
        hasTopicTags: !!question.topicTags,
      });
      return NextResponse.json(
        { error: "Incomplete problem data received from LeetCode" },
        { status: 400 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error in LeetCode API route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch problem data",
      },
      { status: 500 }
    );
  }
}
