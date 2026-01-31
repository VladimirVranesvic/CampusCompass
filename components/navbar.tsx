"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, GraduationCap, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Tools", href: "#tools" },
  { label: "Support", href: "#support" },
  { label: "Blog", href: "#blog" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
            <GraduationCap className="h-5 w-5 text-background" />
          </div>
          <span className="text-lg font-semibold">CampusCompass</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              )}
            >
              {item.label}
              {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Button className="bg-lime text-foreground hover:bg-lime-hover" asChild>
            <Link href="/plan">Create plan</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t md:hidden">
          <nav className="flex flex-col px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
              </Link>
            ))}
            <Button className="mt-4 bg-lime text-foreground hover:bg-lime-hover" asChild>
              <Link href="/plan">Create plan</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
