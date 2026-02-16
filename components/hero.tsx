import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-sage py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="max-w-xl">
            <div className="mb-6 text-sm text-muted-foreground">
              <span>For 2027 UAC applicants</span>
            </div>

            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Your uni journey, simplified
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Personalized checklists, UAC dates, commute planner, rent estimates,
              benefits triage & more — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-lime text-foreground hover:bg-lime-hover"
                asChild
              >
                <Link href="/plan">Get started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#tools">Preview tools</Link>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/images/hero-students.jpg"
                alt="Diverse group of university students collaborating"
                width={600}
                height={450}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
