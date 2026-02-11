
# Functionalities

## Chat (AI assistant)
A floating chat widget (bottom-right) lets users ask questions about UAC, fees, benefits, and universities. It uses Google Gemini (free tier). Set `GEMINI_API_KEY` in `.env.local` — get a key at [Google AI Studio](https://aistudio.google.com/app/apikey). Without the key, the chat API returns a friendly error.

## UAC Deadlines


 

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

### Additional Data needed from the questionaire (More accurately determine travel details)
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


### Rental Prices
