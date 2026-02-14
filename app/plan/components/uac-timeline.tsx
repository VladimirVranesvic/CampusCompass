"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { format, isAfter } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface UACTimelineProps {
  timeline: {
    applicationDeadline: string
    offerRounds: Array<{ round: number; description: string; applyBy: string }>
    importantDates: Array<{ date: string; event: string }>
  }
}

export function UACTimeline({ timeline }: UACTimelineProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nextRound = timeline.offerRounds.find(
    (r) => r.applyBy === timeline.applicationDeadline
  )
  const otherRounds = timeline.offerRounds.filter(
    (r) => r.applyBy !== timeline.applicationDeadline
  )

  const deadline = new Date(timeline.applicationDeadline)
  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>UAC Application Deadlines</CardTitle>
        <CardDescription>
          Your next apply-by date is shown below. Open the dropdown to see all round deadlines.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Next deadline – prominent */}
        {nextRound && (
          <div className="rounded-xl border-2 border-lime/40 bg-sage/50 p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Next deadline
            </p>
            <p className="mt-1 text-lg font-semibold sm:text-xl">
              {nextRound.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Apply by {format(deadline, "EEEE, MMMM d, yyyy")}
              </span>
              {daysUntilDeadline > 0 && (
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Clock className="h-4 w-4" />
                  {daysUntilDeadline} {daysUntilDeadline === 1 ? "day" : "days"} left
                </span>
              )}
              {daysUntilDeadline === 0 && (
                <span className="font-medium text-lime">Due today</span>
              )}
              {daysUntilDeadline < 0 && (
                <span className="text-muted-foreground">Passed</span>
              )}
            </div>
          </div>
        )}

        {/* All other deadlines in dropdown */}
        {otherRounds.length > 0 && (
          <div>
            <Collapsible>
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
                View all application deadlines
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2 pt-3">
                  {otherRounds.map((round) => {
                    const applyByDate = new Date(round.applyBy)
                    const isUpcoming = isAfter(applyByDate, today)
                    return (
                      <div
                        key={round.round}
                        className="flex items-center gap-4 rounded-lg border p-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-sm">
                          {round.round}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{round.description}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            Apply by {format(applyByDate, "MMM d, yyyy")}
                          </p>
                        </div>
                        {isUpcoming && (
                          <span className="shrink-0 text-xs font-medium text-muted-foreground">
                            Upcoming
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Important Dates – dropdown list of offer release dates */}
        <div>
          <h3 className="font-semibold mb-3">Important Dates</h3>
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
              View all offer release dates
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-3">
                {timeline.importantDates.map((dateItem, index) => {
                  const date = new Date(dateItem.date)
                  const isUpcoming = isAfter(date, today) || date.toDateString() === today.toDateString()
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-lg border p-3"
                    >
                      <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{dateItem.event}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {format(date, "MMM d, yyyy")}
                        </p>
                      </div>
                      {isUpcoming && (
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">
                          Upcoming
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}
