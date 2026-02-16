"use client"

import Link from "next/link"

const exploreLinks = [
  { label: "About", href: "#about" },
  { label: "Tools", href: "#tools" },
  { label: "FAQ", href: "#faq" },
]

const resourceLinks = [
  { label: "Create plan", href: "/plan" },
  { label: "My plans", href: "/plans" },
  { label: "Login", href: "/login" },
  { label: "Create account", href: "/signup" },
]

const otherToolsLinks = [
  { label: "Study Australia", href: "https://www.studyaustralia.gov.au/" },
  { label: "Good Universities Guide", href: "https://www.gooduniversitiesguide.com.au/course-provider/search?simple_institution_types=university&states=nsw&page=1" },
  { label: "ATAR Compass", href: "https://www.uac.edu.au/atar-compass/" },
]

export function Footer() {
  return (
    <footer>

      {/* Main Footer */}
      <div className="bg-foreground py-12 text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Explore */}
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-background/60">
                Explore
              </h4>
              <ul className="mt-4 space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-background/80 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-background/60">
                Resources
              </h4>
              <ul className="mt-4 space-y-3">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-background/80 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other tools */}
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-background/60">
                Other tools
              </h4>
              <ul className="mt-4 space-y-3">
                {otherToolsLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-background/80 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
            <p className="text-sm text-background/60">
              © 2025 CampusCompass. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#disclaimer"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Disclaimer
              </Link>
              <Link
                href="#data"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Data
              </Link>
              <Link
                href="#terms"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
