### Route calculation 
Nice-to-Haves (Not Critical):
1. Documentation
⚠️ README.md still describes the old TransXChange approach - should update it to reflect the API
2. Better Error Handling
Currently shows generic "Failed to generate plan" alert
Could show specific errors (e.g., "Postcode not found", "API rate limit", etc.)
Could show a fallback UI instead of just an alert
3. User Experience Enhancements
Loading spinner/skeleton while API is fetching
Show multiple route options (fastest, least transfers, cheapest)
Show real-time departure times (next bus/train in X minutes)
Display service alerts/disruptions from the API
Better accessibility information
4. Performance
Cache API responses (avoid calling API repeatedly for same routes)
Add request debouncing
5. Monitoring
Log API errors for debugging
Track API usage/rate limits

### Rental Prices
