import { NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are a helpful assistant for CampusCompass, a web app for NSW high school students transitioning to university. You help with:
- UAC dates and application process
- University choices (e.g. Australian Catholic University, University of Sydney, UNSW, UTS, Macquarie, Western Sydney, Wollongong, Newcastle, Charles Sturt, Southern Cross, University of New England)
- CSP fees and HECS-HELP
- Youth Allowance, Rent Assistance, ABSTUDY and other benefits
- Commute, rent estimates, and living arrangements

Be accurate and friendly. When something is approximate or depends on personal circumstances, say so and suggest checking official sources (UAC, Services Australia, university websites). Keep answers concise but helpful.`

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as {
      messages: Array<{ role: "user" | "assistant"; content: string }>
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chat is not configured. Please set GEMINI_API_KEY in .env.local." },
        { status: 503 }
      )
    }

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error("Gemini API error:", response.status, errText)
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: "Too many requests. Please wait a moment and try again.",
          },
          { status: 502 }
        )
      }
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json(
          {
            error: "Chat is not configured correctly. Check your GEMINI_API_KEY.",
          },
          { status: 502 }
        )
      }
      return NextResponse.json(
        { error: "Failed to get a response from the assistant." },
        { status: 502 }
      )
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> }
      }>
    }
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "I couldn't generate a response. Please try again."

    return NextResponse.json({ content: text })
  } catch (e) {
    console.error("Chat API error:", e)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
