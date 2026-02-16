"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Menu, X, ChevronDown, User as UserIcon, LogOut } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getInitial = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u ?? null)
    }
    getInitial()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="CampusCompass" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold">CampusCompass</span>
        </Link>

        {/* Desktop: Auth + CTA */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/plans">My plans</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span className="max-w-[140px] truncate text-sm">
                      {user.email ?? "Account"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="bg-lime text-foreground hover:bg-lime-hover" asChild>
                <Link href="/plan">Create plan</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
              <Button className="bg-lime text-foreground hover:bg-lime-hover" asChild>
                <Link href="/plan">Create plan</Link>
              </Button>
            </>
          )}
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
            {user && (
              <Link
                href="/plans"
                className="flex items-center justify-between py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                My plans
              </Link>
            )}
            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              {user ? (
                <>
                  <Button className="bg-lime text-foreground hover:bg-lime-hover" asChild>
                    <Link href="/plan" onClick={() => setIsOpen(false)}>
                      Create plan
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => { setIsOpen(false); handleLogout(); }}>
                    Sign out
                  </Button>
                  <p className="text-xs text-muted-foreground truncate px-2">{user.email}</p>
                </>
              ) : (
                <>
                  <Button className="bg-lime text-foreground hover:bg-lime-hover" asChild>
                    <Link href="/plan" onClick={() => setIsOpen(false)}>
                      Create plan
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
