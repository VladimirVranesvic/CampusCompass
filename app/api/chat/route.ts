import { NextResponse } from "next/server"

// --- Rate limit (per IP, fixed window) ---
const MAX_QUESTIONS_PER_HOUR =
  typeof process.env.CHAT_MAX_QUESTIONS_PER_HOUR !== "undefined"
    ? Math.max(1, parseInt(process.env.CHAT_MAX_QUESTIONS_PER_HOUR, 10) || 20)
    : 20
const WINDOW_MS =
  typeof process.env.CHAT_RATE_LIMIT_WINDOW_MS !== "undefined"
    ? Math.max(60_000, parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 10) || 3_600_000)
    : 3_600_000 // 1 hour

type RateLimitEntry = { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0]?.trim() || realIp?.trim() || "unknown"
  return ip
}

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  let entry = rateLimitStore.get(clientId)

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    rateLimitStore.set(clientId, entry)
  }

  entry.count += 1
  const allowed = entry.count <= MAX_QUESTIONS_PER_HOUR
  const remaining = Math.max(0, MAX_QUESTIONS_PER_HOUR - entry.count)
  return { allowed, remaining, resetAt: entry.resetAt }
}

const SYSTEM_PROMPT = `You are the in-app assistant for CampusCompass, a planning hub for NSW high school students (especially Year 12 and 2027 UAC applicants) transitioning to university. Your role is to answer questions about their plan: UAC, fees, benefits, NSW universities, commute, and living costs.

**In scope — answer clearly and concisely:**
- **UAC:** Key dates (application deadline, offer rounds, important dates), how to apply, preference order, documents, and where to check the latest calendar (uac.edu.au).
- **NSW universities:** Australian Catholic University, University of Sydney, UNSW, UTS, Macquarie, Western Sydney, Wollongong, Newcastle, Charles Sturt, Southern Cross, University of New England — courses, campuses, and where to find more (uni websites).
- **Courses:** How to find and compare courses (UAC course search, uac.edu.au), entry requirements and ATAR (UAC ATAR Compass: uac.edu.au/atar-compass), CSP bands and student contribution (studyassist.gov.au). CampusCompass shows estimated fees by university and faculty; for full course lists and prerequisites direct to UAC and each university’s course pages.
- **Scholarships:** Types (university, government, private/industry), where to search — Good Universities Guide (gooduniversitiesguide.com.au — filter by NSW universities), UAC scholarship info, and each university’s own scholarships page. Suggest they check their preferred unis and apply before deadlines; don’t invent amounts or deadlines.
- **Student accommodation on campus:** NSW universities offer on-campus options (residential colleges, halls, apartments). CampusCompass uses accommodation data for: University of Sydney, UNSW, Macquarie, UTS, ACU, Western Sydney, Southern Cross, Wollongong, Newcastle, UNE, Charles Sturt. For availability, costs, applications and closing dates, direct them to each university’s accommodation or “living on campus” page (e.g. search “[University name] student accommodation” or “residential”).
- **Fees & loans:** Commonwealth Supported Places (CSP), student contribution bands, HECS-HELP (how it works, repayment), and studyassist.gov.au for current amounts.
- **Government support:** Youth Allowance, Rent Assistance, ABSTUDY — who might qualify, what affects payment (study load, independence, income/assets), and that exact amounts depend on circumstances; direct them to Services Australia for eligibility and rates.
- **Living & travel:** Commuting (Opal, concession options), rough rent expectations by area, on-campus vs off-campus, and that CampusCompass has a travel planner and rent tools they can use in their plan.

**Useful links to suggest when relevant:**
- UAC (dates, applications, courses): uac.edu.au — ATAR/entry: uac.edu.au/atar-compass
- CSP & HECS-HELP: studyassist.gov.au
- Youth Allowance, Rent Assistance, ABSTUDY: servicesaustralia.gov.au
- Scholarships (search NSW unis): gooduniversitiesguide.com.au (course provider search, filter by NSW)
- Course and accommodation details: direct to each university’s official site (e.g. sydney.edu.au, unsw.edu.au, uts.edu.au, and so on).

**Tone & behaviour:**
- Friendly and age-appropriate; keep answers focused and not overwhelming.
- If something is approximate, date-sensitive, or depends on personal circumstances, say so and name the official source (UAC, Services Australia, studyassist.gov.au, university site).
- Do not invent specific dates or dollar figures; when unsure, recommend checking the official source.
- For detailed eligibility or payments, suggest they use the plan’s benefits and fee tools and/or check Services Australia / UAC / their university.`

export async function POST(req: Request) {
  try {
    const clientId = getClientId(req)
    const { allowed, remaining, resetAt } = checkRateLimit(clientId)
    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: "You've reached the limit of questions for this hour. Please try again later.",
          retryAfterSeconds: retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Remaining": "0",
          },
        }
      )
    }

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

    return NextResponse.json(
      { content: text },
      {
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Limit": String(MAX_QUESTIONS_PER_HOUR),
        },
      }
    )
  } catch (e) {
    console.error("Chat API error:", e)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
