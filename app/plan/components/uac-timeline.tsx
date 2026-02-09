"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { format, isAfter} from "date-fns"

interface UACTimelineProps {
  timeline: {
    applicationDeadline: string
    offerRounds: Array<{ round: number; description: string; applyBy: string }>
    importantDates: Array<{ date: string; event: string }>
  }
}

export function UACTimeline({ timeline }: UACTimelineProps) {
  const today = new Date()
  const deadline = new Date(timeline.applicationDeadline)
  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>UAC Timeline & Key Dates</CardTitle>
        <CardDescription>
          Important dates for your university application journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Application Deadline Alert */}
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">
                Application Deadline: {format(deadline, "MMMM d, yyyy")}
              </p>
              <p className="text-sm text-amber-700">
                {daysUntilDeadline > 0
                  ? `${daysUntilDeadline} days remaining`
                  : "Deadline has passed"}
              </p>
            </div>
          </div>
        </div>

        {/* Offer Rounds */}
        <div>
          <h3 className="font-semibold mb-3">Application Deadlines</h3>
          <div className="space-y-3">
          {timeline.offerRounds.map((round) => {
              const applyByDate = new Date(round.applyBy) // Changed from round.date
              const isUpcoming = isAfter(applyByDate, today) // Check if apply-by is upcoming
              return (
                <div
                  key={round.round}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime font-bold">
                    {round.round}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{round.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Apply by {format(applyByDate, "MMMM d, yyyy")}
                    </div>
                  </div>
                  {isUpcoming && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      Upcoming
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Important Dates */}
        <div>
          <h3 className="font-semibold mb-3">Important Dates</h3>
          <div className="space-y-2">
            {timeline.importantDates
              .filter(dateItem => {
                const date = new Date(dateItem.date)
                return isAfter(date, today) || date.toDateString() === today.toDateString()
              })
              .map((dateItem, index) => {
                const date = new Date(dateItem.date)
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">{dateItem.event}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {format(date, "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
