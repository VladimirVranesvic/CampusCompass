import { User } from "lucide-react"

const testimonials = [
  {
    quote:
      "I felt lost with UAC and all the deadlines, but this hub made everything simple. The checklist kept me organised and I always knew what to do next.",
    name: "James Wu",
    role: "Bachelor of Engineering",
  },
  {
    quote:
      "Sorting my commute and Youth Allowance was so much easier here. The tools gave me confidence to start uni and manage life changes.",
    name: "Uzair Waraich",
    role: "Bachelor of Science",
  },
]

export function Testimonials() {
  return (
    <section id="blog" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Student voices,
            <br />
            real uni journeys
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Discover how students like you navigated the leap from high school to
            university. Their stories prove you're not alone—and that your path is
            possible.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="space-y-6">
              <blockquote className="text-xl font-medium leading-relaxed md:text-2xl">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
