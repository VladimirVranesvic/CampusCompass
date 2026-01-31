"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Calendar, HelpCircle, MapPin, Award, Calculator } from "lucide-react"

const tools = [
  {
    id: "timeline",
    icon: Calendar,
    title: "UAC Timeline & Calendar",
    description:
      "Never miss a deadline with our comprehensive UAC timeline. Track offer rounds, application deadlines, and important university dates all in one calendar view.",
    features: [
      "Personalized deadline reminders",
      "Sync with your calendar app",
      "Offer round countdown",
    ],
  },
  {
    id: "benefits",
    icon: HelpCircle,
    title: "Benefits & Concessions Quiz",
    description:
      "Discover what government support you may be eligible for, including Youth Allowance, ABSTUDY, and Opal concessions.",
    features: [
      "Quick eligibility checker",
      "Step-by-step application guides",
      "Centrelink tips & resources",
    ],
  },
  {
    id: "commute",
    icon: MapPin,
    title: "Commute & Rent Planner",
    description:
      "Compare travel times from different suburbs and estimate rent costs to find the perfect balance for your uni life.",
    features: [
      "Real-time travel estimates",
      "Suburb comparison tool",
      "Budget calculator",
    ],
  },
  {
    id: "scholarships",
    icon: Award,
    title: "Scholarship Finder",
    description:
      "Get matched with scholarships based on your background, field of study, and circumstances. Never miss funding opportunities.",
    features: [
      "Personalized matches",
      "Application deadline alerts",
      "Eligibility filters",
    ],
  },
  {
    id: "fees",
    icon: Calculator,
    title: "Fees & HELP Calculator",
    description:
      "Understand your course fees and HELP loan implications. Calculate repayments and plan your financial future.",
    features: [
      "Course fee breakdown",
      "HECS-HELP repayment calculator",
      "Upfront payment options",
    ],
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
