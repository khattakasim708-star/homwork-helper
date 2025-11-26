import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not set" }, { status: 500 });

    const response = await fetch("https://api.generative.ai/v1/models/gemini-1.5/outputs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: prompt }),
    });

    const data = await response.json();
    const answer = data?.output?.[0]?.content?.[0]?.text || "No answer returned";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
  }
}
