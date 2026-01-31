import Image from "next/image"

const features = [
  {
    title: "Personalized checklist",
    description:
      "Get a custom checklist for every step—UAC deadlines, open days, and more—so nothing slips through the cracks.",
    image: "/images/checklist-desk.jpg",
    imageAlt: "Organized desk with laptop and stationery",
    bgColor: "bg-sky-100",
    size: "small",
  },
  {
    title: "Key dates at a glance",
    description:
      "See every important uni and UAC date in one clear view, so you're always ahead of the game.",
    image: "/images/tablet-education.jpg",
    imageAlt: "Person holding tablet with education app",
    bgColor: "bg-violet-100",
    size: "large",
  },
  {
    title: "Commute & rent planner",
    description:
      "Compare travel times and living costs to find the best fit for your daily uni life.",
    image: "/images/students-circle.jpg",
    imageAlt: "Students sitting in a circle outdoors",
    bgColor: "bg-purple-100",
    size: "large",
  },
  {
    title: "Benefits & scholarships guide",
    description:
      "Find out which support, benefits, and scholarships you can access—no more missing out.",
    image: "/images/students-meeting.jpg",
    imageAlt: "Students having a meeting at a table",
    bgColor: "bg-amber-100",
    size: "small",
  },
]

export function Features() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            All your uni tools, one place
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Stay organized and confident with personalized checklists, key dates, and
            planning tools designed for your uni journey.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 - Small */}
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold">{features[0].title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {features[0].description}
              </p>
            </div>
            <div className={`${features[0].bgColor} p-4`}>
              <Image
                src={features[0].image || "/placeholder.svg"}
                alt={features[0].imageAlt}
                width={400}
                height={300}
                className="h-48 w-full rounded-lg object-cover"
              />
            </div>
          </div>

          {/* Card 2 - Large spanning 2 columns */}
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card lg:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold">{features[1].title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {features[1].description}
              </p>
            </div>
            <div className={`${features[1].bgColor} p-4`}>
              <Image
                src={features[1].image || "/placeholder.svg"}
                alt={features[1].imageAlt}
                width={800}
                height={400}
                className="h-64 w-full rounded-lg object-cover md:h-80"
              />
            </div>
          </div>

          {/* Card 3 - Large spanning 2 columns */}
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card lg:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold">{features[2].title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {features[2].description}
              </p>
            </div>
            <div className={`${features[2].bgColor} p-4`}>
              <Image
                src={features[2].image || "/placeholder.svg"}
                alt={features[2].imageAlt}
                width={800}
                height={400}
                className="h-64 w-full rounded-lg object-cover md:h-80"
              />
            </div>
          </div>

          {/* Card 4 - Small */}
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold">{features[3].title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {features[3].description}
              </p>
            </div>
            <div className={`${features[3].bgColor} p-4`}>
              <Image
                src={features[3].image || "/placeholder.svg"}
                alt={features[3].imageAlt}
                width={400}
                height={300}
                className="h-48 w-full rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
