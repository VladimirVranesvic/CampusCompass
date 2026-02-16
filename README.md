# CampusCompass

A one-stop hub for NSW high school students (especially Year 12 and UAC applicants) transitioning to university. Personalized checklists, UAC dates, commute planner, rent estimates, benefits triage, and more — all in one place.

**Stack:** Next.js, React, Supabase (auth + data), Tailwind CSS.

**Run locally:** `npm install` then `npm run dev`. Set the env vars below in `.env.local`.

---

## Environment

**Auth & email links (production)**  
Set **`NEXT_PUBLIC_APP_URL`** to your live site URL (e.g. `https://www.campuscompass-nsw.com`). Used for the confirm-email link when users sign up so the link points to your domain instead of localhost.

- **Production:** In your hosting env (Vercel, etc.), add `NEXT_PUBLIC_APP_URL=https://www.campuscompass-nsw.com`.
- **Supabase:** In [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → URL Configuration, set **Site URL** to `https://www.campuscompass-nsw.com` and add `https://www.campuscompass-nsw.com/auth/callback` to **Redirect URLs**.

**Supabase (auth + rental data)**  
- `NEXT_PUBLIC_SUPABASE_URL`  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Chat (AI assistant)**  
- `GEMINI_API_KEY` — get a key at [Google AI Studio](https://aistudio.google.com/app/apikey). Without it, the chat API returns a friendly error.
- Optional: `CHAT_MAX_QUESTIONS_PER_HOUR` (default 20), `CHAT_RATE_LIMIT_WINDOW_MS` (default 3600000). Chat is limited per IP; when the limit is reached, the API returns 429; responses include `X-RateLimit-Remaining` and `X-RateLimit-Limit` headers.

---

## Functionalities

### Plan (questionnaire + results)

Multi-step questionnaire (basic info, course preferences, living situation, government subsidy eligibility). Results include a personalized dashboard: UAC timeline, commute planner, rent estimator, benefits triage, fees calculator, and checklist. Plans can be saved and revisited when logged in.

---

### UAC Deadlines

**Overview**  
Key dates and offer rounds for UAC applications. Shown in the plan results so users don’t miss deadlines.

**Sources**  
- UAC key dates — https://www.uac.edu.au/assets/documents/ug-fact-sheets/ug-fact-sheet-key-dates.pdf

---

### Chat (AI assistant)

**Overview**  
Floating chat widget (bottom-right). Users ask questions about UAC, fees, benefits, NSW universities, commute, and living costs. Uses Google Gemini (free tier). Markdown in responses (bold, lists, links). Rate limited per IP.

**Sources**  
- Gemini API (Google AI Studio)

---

### Travel Planner

**Overview**  
Travel times and costs from the user’s postcode to target NSW universities. Uses Opal single-trip caps. Shown in plan results.

**Sources**  
- Postcodes — Custom (Supabase)
- Trip API — https://opendata.transport.nsw.gov.au/data/dataset/trip-planner-apis

---

### Rental Prices

**Overview**  
Rental data by postcode: median weekly rent by dwelling type and bedroom count, plus nearby suburbs. Shown in plan results; can use preferred location postcode when “Renting/Moving out” is selected.

**Sources**  
- Rental bond data — https://www.nsw.gov.au/housing-and-construction/rental-forms-surveys-and-data/rental-bond-data  
- Supabase rental table: date bond lodged, postcode, dwelling type (F/H/T/O/U), bedrooms, weekly rent (as provided by agent/landlord).

---

### Course Preferences

**Overview**  
Estimated course fees by university and faculty, HECS-HELP info, and links to faculty pages. User selects target universities and preferred fields in the questionnaire; results show fee breakdowns.

**Sources**  
- Student contribution amounts — https://www.studyassist.gov.au/financial-and-study-support/commonwealth-supported-places/student-contribution-amounts

---

### Other tools

**ATAR**  
- ATAR Compass — https://www.uac.edu.au/atar-compass/

**Scholarships**  
- Good Universities Guide — https://www.gooduniversitiesguide.com.au/course-provider/search?simple_institution_types=university&states=nsw&page=1
