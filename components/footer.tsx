"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react"
import { useState } from "react"

const exploreLinks = [
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
  { label: "FAQ", href: "#faq" },
  { label: "Support", href: "#support" },
  { label: "Blog", href: "#blog" },
]

const resourceLinks = [
  { label: "Timeline", href: "#timeline" },
  { label: "Benefits", href: "#benefits" },
  { label: "Daily", href: "#daily" },
  { label: "Fees", href: "#fees" },
  { label: "Scholarships", href: "#scholarships" },
]

const socialLinks = [
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "Twitter", href: "#", icon: Twitter },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "YouTube", href: "#", icon: Youtube },
]

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribeEmail, setSubscribeEmail] = useState("")

  return (
    <footer>
      {/* Newsletter Banner */}
      <div className="bg-sage-dark py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            {/* Left - Headline */}
            <div className="lg:max-w-md">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Start your uni
                <br />
                journey strong
              </h2>
            </div>

            {/* Right - Form */}
            <div className="lg:max-w-lg">
              <p className="text-muted-foreground leading-relaxed">
                Get practical tips, checklists, and reminders to help you feel confident about your
                next steps. Sign up for updates and make your move to uni smoother, one email at a
                time.
              </p>
              <form
                className="mt-6 flex gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  setEmail("")
                }}
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 flex-1 rounded-md border-border bg-background"
                />
                <Button
                  type="submit"
                  className="h-12 rounded-md bg-lime px-6 text-foreground hover:bg-lime-hover"
                >
                  Submit
                </Button>
              </form>
              <p className="mt-3 text-sm text-muted-foreground">
                We only send useful info—no spam, ever.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-foreground py-12 text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
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

            {/* Connect */}
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-background/60">
                Connect
              </h4>
              <ul className="mt-4 space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 text-background/80 transition-colors hover:text-background"
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscribe */}
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-background/60">
                Subscribe
              </h4>
              <p className="mt-4 text-background/80">Stay updated with uni tips & news.</p>
              <form
                className="mt-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  setSubscribeEmail("")
                }}
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  required
                  className="h-12 rounded-md border-background/20 bg-background/10 text-background placeholder:text-background/50"
                />
                <Button
                  type="submit"
                  className="mt-3 h-12 w-full rounded-md bg-lime text-foreground hover:bg-lime-hover sm:w-auto sm:px-8"
                >
                  Subscribe
                </Button>
              </form>
              <p className="mt-4 text-sm text-background/60">
                By signing up, you agree to our{" "}
                <Link href="#privacy" className="underline hover:text-background">
                  Privacy
                </Link>
                .
              </p>
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
