
# CampusCompass

# Functionalities

## UAC Deadlines
### Overview

## Chat (AI assistant)
A floating chat widget (bottom-right) lets users ask questions about UAC, fees, benefits, and universities. It uses Google Gemini (free tier). Set `GEMINI_API_KEY` in `.env.local` — get a key at [Google AI Studio](https://aistudio.google.com/app/apikey). Without the key, the chat API returns a friendly error.

**Rate limiting:** Chat is limited per IP to avoid abuse. Default: 20 questions per hour. Optional env: `CHAT_MAX_QUESTIONS_PER_HOUR` (default 20), `CHAT_RATE_LIMIT_WINDOW_MS` (default 3600000). When the limit is reached, the API returns 429 with a message to try again later; responses include `X-RateLimit-Remaining` and `X-RateLimit-Limit` headers.

---

### Sources
UAC Dates - https://www.uac.edu.au/assets/documents/ug-fact-sheets/ug-fact-sheet-key-dates.pdf

---

## Travel Planner 
### Overview


### Sources
Postcodes - Custom
Trip API - https://opendata.transport.nsw.gov.au/data/dataset/trip-planner-apis

---

## Rental Prices
### Overview 


### Sources
Rental Prices - https://www.nsw.gov.au/housing-and-construction/rental-forms-surveys-and-data/rental-bond-data


Supabase rental table key 
- Date that the bond was lodged with Fair Trading. For bonds lodged using Rental Bonds Online, this is the date that the agent or landlord completed the lodgement process
- Postcode of the rented premises address
- Type of rented premises as provided by the agent of landlord. (F) Flat/unit; (H) House; (T) Terrace/townhouse/semi-detached; (O) Other; (U) Unknown.  A Dwelling Type of ‘Other’ may include rented rooms, garages and car spaces.
- Number of bedrooms as provided by the agent or landlord; (U) unknown. A value of ‘0’ bedrooms may indicate a bedsitter or studio apartment, or rented premises such as a garage or car space.
- Weekly rent amount as provided by the agent or landlord; (U) unknown

---

## Course Prefeneces

### Soruces
- https://www.studyassist.gov.au/financial-and-study-support/commonwealth-supported-places/student-contribution-amounts



### Other tools
Atar Calculator
ATAR Compass - https://www.uac.edu.au/atar-compass/

Scholarships
Good Universities Guide - https://www.gooduniversitiesguide.com.au/course-provider/search?simple_institution_types=university&states=nsw&page=1


