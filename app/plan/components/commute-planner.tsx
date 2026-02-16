"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, DollarSign, Train, ChevronDown, Loader2 } from "lucide-react"

interface CommutePlannerProps {
  commuteData: Array<{
    university: string
    fromPostcode: string
    travelTime: number
    cost: string
    costUncapped?: string
    costIsCapped?: boolean
    transportOptions: string[]
    accessibility: string
    distance?: number
    routeDetails?: {
      walkingToStop: number
      transitTime: number
      walkingFromStop: number
      transfers: number
    }
  }>
  userData: any
}

const normalizePostcode = (p: string) => String(p ?? "").replace(/\D/g, "").padStart(4, "0").slice(0, 4)

export function CommutePlanner({ commuteData, userData }: CommutePlannerProps) {
  const initialPostcode = normalizePostcode(String(userData?.postcode ?? "")) || "2000"
  const [fromPostcode, setFromPostcode] = useState(initialPostcode)
  const [displayData, setDisplayData] = useState(commuteData)
  const [loading, setLoading] = useState(false)

  const fetchCommute = useCallback(
    async (postcode: string) => {
      const pc = normalizePostcode(postcode)
      if (pc.length !== 4 || !commuteData.length) return
      setLoading(true)
      try {
        const res = await fetch("/api/commute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postcode: pc,
            universities: commuteData.map((c) => c.university),
          }),
        })
        if (!res.ok) throw new Error("Failed to fetch commute")
        const data = await res.json()
        setDisplayData(data)
        setFromPostcode(pc)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [commuteData]
  )

  const handlePostcodeSubmit = () => {
    const pc = normalizePostcode(fromPostcode)
    if (pc.length === 4 && pc !== displayData[0]?.fromPostcode) fetchCommute(pc)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commute & Travel Planner</CardTitle>
        <p className="font-bold italic text-sm">Live updates when reloaded.</p>
        <CardDescription>
          Travel times and costs from your postcode to your target
          universities. Costs use Opal single-trip adult caps by distance and mode (train/metro bands, bus bands, ferry cap). Capped fares apply per trip.
        </CardDescription>
        <div className="flex flex-wrap items-end gap-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="commute-from-postcode" className="text-sm text-muted-foreground">
              Travel from postcode
            </Label>
            <Input
              id="commute-from-postcode"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2088"
              maxLength={4}
              value={fromPostcode}
              onChange={(e) => setFromPostcode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onBlur={handlePostcodeSubmit}
              onKeyDown={(e) => e.key === "Enter" && handlePostcodeSubmit()}
              className="w-28"
            />
          </div>
          {loading && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating…
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayData.map((commute, index) => (
            <div key={index} className="p-4 rounded-lg border space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">{commute.university}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Travel Time</p>
                    <p className="font-medium">{commute.travelTime} minutes</p>
                  </div>
                </div>

                {commute.distance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Distance</p>
                      <p className="font-medium">{commute.distance} km</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    <p className="font-medium">
                      ${commute.cost} per trip
                      {commute.costIsCapped && commute.costUncapped && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          (Opal cap; uncapped ~${commute.costUncapped})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
                  Route breakdown
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 pt-3">
                    {commute.routeDetails && (
                      <div>
                        <p className="text-sm font-medium mb-2">Route Breakdown</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Walking: </span>
                            <span className="font-medium">{commute.routeDetails.walkingToStop} min</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Transit: </span>
                            <span className="font-medium">{commute.routeDetails.transitTime} min</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Transfers: </span>
                            <span className="font-medium">{commute.routeDetails.transfers}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Transport Options</p>
                      <div className="flex flex-wrap gap-2">
                        {commute.transportOptions.map((option) => (
                          <span
                            key={option}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-sm"
                          >
                            <Train className="h-3 w-3" />
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Accessibility: </span>
                        <span className="font-medium">{commute.accessibility}</span>
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
