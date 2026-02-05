import Image from "next/image"
import { Button } from "@/components/ui/button"

const floatingImages = [
  {
    src: "/images/cta-tablet.jpg",
    alt: "Tablet with education app",
    className: "absolute left-4 top-16 h-40 w-32 rounded-xl md:left-12 md:h-80 md:w-80",
  },
  {
    src: "/images/calculator.jpg",
    alt: "Calculator",
    className: "absolute right-4 top-8 h-32 w-32 rounded-xl md:right-16 md:h-80 md:w-80",
  },
  {
    src: "/images/laptop-calendar.jpg",
    alt: "Laptop with calendar",
    className: "absolute bottom-24 left-8 h-36 w-48 rounded-xl md:bottom-32 md:left-16 md:h-80 md:w-80",
  },
  {
    src: "/images/tablet-app.jpg",
    alt: "Tablet with app interface",
    className: "absolute bottom-48 left-1/2 h-40 w-32 -translate-x-1/2 rounded-xl md:h-52 md:w-60 hidden md:block",
  },
  {
    src: "/images/group-meeting.jpg",
    alt: "Students in group meeting",
    className: "absolute bottom-24 right-8 h-36 w-48 rounded-xl md:bottom-32 md:right-16 md:h-80 md:w-80",
  },
]

export function CTASection() {
  return (
    <section className="relative min-h-[700px] overflow-hidden bg-background py-24 md:min-h-[800px] md:py-32">
      {/* Floating Images */}
      {floatingImages.map((image, index) => (
        <div key={index} className={`${image.className} overflow-hidden shadow-lg`}>
          <Image
            src={image.src || "/placeholder.svg"}
            alt={image.alt}
            fill
            className="object-cover"
          />
        </div>
      ))}

      {/* Centered Content */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-start px-4 pt-16 pb-64 text-center sm:px-6 lg:px-8 md:pt-24 md:pb-80">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Ready for your next big move?
        </p>

        <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Plan your uni
          <br />
          journey today
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-muted-foreground">
          Discover upcoming tools, tips, and checklists to personalize your
          transition, stay organized, and feel confident as you start uni life.
        </p>

        <Button
          size="lg"
          variant="outline"
          className="mt-8 border-foreground bg-transparent hover:bg-foreground hover:text-background"
        >
          {"See what's next"}
        </Button>
      </div>
    </section>
  )
}
