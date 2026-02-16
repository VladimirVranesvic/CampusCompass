"use client"

import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Calendar, ListTodo, MapPin, Home, HelpCircle, Calculator } from "lucide-react"

const tools = [
  {
    id: "checklist",
    icon: ListTodo,
    title: "Your Checklist",
    description:
      "Track your progress with an actionable checklist—UAC steps, benefits, and more—so nothing slips through the cracks.",
    features: [
      "Next steps at a glance",
      "Track tasks completed",
      "Stay on top of applications",
    ],
    href: null as string | null,
  },
  {
    id: "timeline",
    icon: Calendar,
    title: "UAC Application Deadlines and Dates",
    description:
      "Never miss a deadline. View your next apply-by date and open the dropdown to see all application and offer release dates.",
    features: [
      "Application deadline reminders",
      "Offer round dates",
      "Key UAC dates in one place",
    ],
    href: null as string | null,
  },
  {
    id: "commute",
    icon: MapPin,
    title: "Commute & Travel Planner",
    description:
      "Travel times and costs from your postcode to your target universities. Change postcode to compare. Uses Opal single-trip caps.",
    features: [
      "Live updates when reloaded",
      "Travel time and cost per trip",
      "Route breakdown and transport options",
    ],
    href: null as string | null,
  },
  {
    id: "rent",
    icon: Home,
    title: "Rent & Living Cost Estimates",
    description:
      "Rental data for your area: average weekly rent by dwelling type and bedroom count, plus nearby suburbs comparison.",
    features: [
      "Apartment, house, townhouse averages",
      "Filter by number of bedrooms",
      "Nearby suburbs with real names",
    ],
    href: null as string | null,
  },
  {
    id: "benefits",
    icon: HelpCircle,
    title: "Benefits & Support Eligibility",
    description:
      "Government support you may be eligible for: Youth Allowance and Rent Assistance estimates from your questionnaire, plus next steps.",
    features: [
      "Youth Allowance estimate (household income, study load, personal income & assets, siblings)",
      "Rent Assistance estimate when paying rent",
      "Next steps and links to Services Australia",
    ],
    href: null as string | null,
  },
  {
    id: "fees",
    icon: Calculator,
    title: "Course Preferences and Information",
    description:
      "Estimated course fees by university and faculty, HECS-HELP info, upfront payment option, and links to faculty pages.",
    features: [
      "Primary preference and other options",
      "Course fee breakdown by university",
      "HECS-HELP and upfront payment info",
    ],
    href: null as string | null,
  },
]

export function ToolsShowcase() {
  return (
    <section id="tools" className="border-y border-border/40 bg-sage py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Explore our tools
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Everything you need to navigate your transition to university
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {tools.map((tool) => (
              <AccordionItem key={tool.id} value={tool.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background">
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">{tool.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-13 ml-13">
                    <p className="text-muted-foreground">{tool.description}</p>
                    <ul className="mt-4 space-y-2">
                      {tool.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-lime" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {"href" in tool && tool.href && (
                      <Button className="mt-4 bg-lime text-foreground hover:bg-lime-hover" asChild>
                        <Link href={tool.href}>Try it</Link>
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
