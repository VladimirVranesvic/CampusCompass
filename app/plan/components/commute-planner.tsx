"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, DollarSign, Train } from "lucide-react"

interface CommutePlannerProps {
  commuteData: Array<{
    university: string
    fromPostcode: string
    travelTime: number
    cost: string
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

export function CommutePlanner({ commuteData, userData }: CommutePlannerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commute & Travel Planner</CardTitle>
        <CardDescription>
          Travel times and costs from your postcode ({userData.postcode}) to your target
          universities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {commuteData.map((commute, index) => (
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
                    <p className="font-medium">${commute.cost} per trip</p>
                  </div>
                </div>
              </div>
              {commute.routeDetails && (
                <div className="pt-2 border-t">
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
