
# CampusCompass

## Database: Saved plans

To let users save and return to plans, create the `plans` table in Supabase:

1. Open your [Supabase](https://supabase.com) project → **SQL Editor** → **New query**.
2. Copy the contents of **`supabase/plans-schema.sql`** and run it.

This creates the `plans` table and Row Level Security (RLS) so each user only sees their own plans. The app expects:

- **Env**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

---

# Functionalities

## UAC Deadlines
### Overview

## Chat (AI assistant)
A floating chat widget (bottom-right) lets users ask questions about UAC, fees, benefits, and universities. It uses Google Gemini (free tier). Set `GEMINI_API_KEY` in `.env.local` — get a key at [Google AI Studio](https://aistudio.google.com/app/apikey). Without the key, the chat API returns a friendly error.

---

### Sources
UAC Dates - https://www.uac.edu.au/assets/documents/ug-fact-sheets/ug-fact-sheet-key-dates.pdf

---

## Travel Planner 
### Overview


### What can be improved:
1.Documentation 
    - README still describes old TransXChange approach

2. Error Handling 
    - Generic errors instead of specific messages

3. UX Enhancements:
    - No loading spinner
    - Only shows fastest route (not multiple options)
    - No real-time departure times
    - No service disruption alerts

4. Performance 
    - No API response caching or request debouncing

5. Monitoring 
    - No error logging or rate limit tracking

6. Testing 
    - No automated tests

##### Additional Data needed from the questionaire (More accurately determine travel details)
    1. Time & Schedule Details
        Class start time (e.g., 9am, 2pm, 6pm)
            - Why: NSW Transport API can provide time-specific routes with actual service schedules
            - Impact: Peak vs off-peak affects both availability and costs
        Days per week attending (e.g., 2-3 days, 4-5 days, daily)
            - Why: Determines weekly Opal cap relevance ($50 adult/$25 concession)
        Typical departure time preference
            - Why: Morning peak (7-9am) has more frequent services but more crowded

    2. Concession Status ⭐ MOST IMPORTANT
        Student concession card eligibility
            - Impact: ~50% discount on fares! Your current calculation doesn't account for this
            - A $5 adult fare becomes $2.50 with concession
        Age bracket (under 16, 16-18, 18+, 60+)
            - Why: Different fare structures for youth/seniors

    3. Accessibility Requirements
        Mobility needs (wheelchair accessible, elevator required, etc.)
            - Why: NSW API has excludedMeans and impaired parameters for accessible routing
            - Can filter out non-accessible services
        Maximum comfortable walking distance (5min, 10min, 15min+)
            - Why: Affects route options (some routes have longer walks to stops)

    4. Location Precision
        Specific street address (optional, instead of just postcode)
            - Why: Postcodes can cover large areas - a street address is more precise
            - Example: Postcode 2000 covers CBD from Circular Quay to Central Station
        Preferred starting point (home, work, other)
            - Why: Some students commute from part-time job locations

    5. Travel Preferences
        Preferred transport modes (train only, bus+train, any)
            - Why: NSW API supports excludedMeans parameter to filter modes
        Maximum acceptable transfers (0, 1, 2+)
            - Why: More transfers = faster route but less convenient
        Whether they have a driver's license
            - Why: Compare driving costs vs public transport

    6. Frequency & Context
        Semester dates or when they plan to start
            - Why: Can calculate annual costs more accurately
            - Can warn about service changes during university breaks






### Sources
Postcodes - Custom
Trip API - https://opendata.transport.nsw.gov.au/data/dataset/trip-planner-apis

---

## Rental Prices
### Overview 


### Sources
Rental Prices - https://www.nsw.gov.au/housing-and-construction/rental-forms-surveys-and-data/rental-bond-data
University Accomidation data
    1. Univerisity of Sydney - 
    2. University of New South Wales
    3. Macquaire University
    4. University of Technology Sydney
    5. Australian Catholic University 
    6. Western Sydney University
    7. Southern Cross University 


---

## Course Prefeneces

### Soruces
- https://www.studyassist.gov.au/financial-and-study-support/commonwealth-supported-places/student-contribution-amounts



### Other tools
- https://www.uac.edu.au/atar-compass/