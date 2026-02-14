"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calculator, Loader2, Plus, Trash2 } from "lucide-react"
import { calculateAtar, type SubjectInput } from "@/lib/data/atar-calculator"

type SubjectRow = { id: string; subjectId: number; subjectName: string; units: number; mark: string }

export default function AtarCalculatorPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [yearsAvailable, setYearsAvailable] = useState<number[]>([])
  const [subjects, setSubjects] = useState<{ id: number; name: string; units: number }[]>([])
  const [scalingStats, setScalingStats] = useState<any[]>([])
  const [atarConversion, setAtarConversion] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<SubjectRow[]>([])
  const [result, setResult] = useState<{ aggregate: number; atar: number; bySubject: { subjectName: string; units: number; scaledMark: number }[] } | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/atar?year=${year}`)
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(new Error(e.details || e.error || "Failed to fetch")))
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setSubjects(data.subjects)
        setScalingStats(data.scalingStats)
        setAtarConversion(data.atarConversion)
        if (data.atarConversion?.length) {
          setYearsAvailable((prev) => (prev.includes(year) ? prev : [...prev, year].sort((a, b) => b - a)))
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load ATAR data. Check Supabase env and tables.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [year])

  const addSubject = () => {
    if (!subjects.length) return
    const first = subjects[0]
    setRows((r) => [
      ...r,
      {
        id: crypto.randomUUID(),
        subjectId: first.id,
        subjectName: first.name,
        units: first.units,
        mark: "",
      },
    ])
  }

  const removeRow = (id: string) => {
    setRows((r) => r.filter((x) => x.id !== id))
    setResult(null)
  }

  const updateRow = (id: string, updates: Partial<SubjectRow>) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...updates } : x)))
    setResult(null)
  }

  const onSubjectChange = (rowId: string, subjectIdStr: string) => {
    const subjectId = parseInt(subjectIdStr, 10)
    const sub = subjects.find((s) => s.id === subjectId)
    if (sub) updateRow(rowId, { subjectId: sub.id, subjectName: sub.name, units: sub.units })
  }

  const handleCalculate = () => {
    const inputs: SubjectInput[] = rows
      .map((r) => ({
        subjectId: r.subjectId,
        subjectName: r.subjectName,
        units: r.units,
        mark: parseFloat(r.mark),
      }))
      .filter((s) => !Number.isNaN(s.mark) && s.mark >= 0 && s.mark <= 50)
    if (inputs.length === 0) {
      setResult(null)
      return
    }
    const res = calculateAtar(inputs, scalingStats, atarConversion)
    setResult(res)
  }

  const totalUnits = rows.reduce((acc, r) => acc + r.units, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">ATAR Calculator</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your HSC aligned mark (0–50) for each subject. We use scaling data from our database to estimate your aggregate and ATAR.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Estimate your ATAR
              </CardTitle>
              <CardDescription>
                Select a year, add subjects, and enter your HSC aligned mark (0–50) for each. Best 10 units are used.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading subjects and scaling data…
                </div>
              )}
              {error && (
                <p className="text-sm text-destructive">
                  {error}
                </p>
              )}
              {!loading && !error && (
                <>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select
                      value={String(year)}
                      onValueChange={(v) => {
                        setYear(parseInt(v, 10))
                        setResult(null)
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearsAvailable.length
                          ? yearsAvailable.map((y) => (
                              <SelectItem key={y} value={String(y)}>
                                {y}
                              </SelectItem>
                            ))
                          : [year, year - 1, year - 2].map((y) => (
                              <SelectItem key={y} value={String(y)}>
                                {y}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Subjects (best 10 units count)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addSubject} disabled={!subjects.length}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add subject
                      </Button>
                    </div>
                    {rows.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Click “Add subject” and enter your HSC aligned mark (0–50) for each. You need at least 10 units.
                      </p>
                    )}
                    {rows.map((row) => (
                      <div key={row.id} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
                        <div className="flex-1 min-w-[140px] space-y-1">
                          <Label className="text-xs">Subject</Label>
                          <Select
                            value={String(row.subjectId)}
                            onValueChange={(v) => onSubjectChange(row.id, v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                  {s.name} ({s.units}u)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">HSC aligned mark (0–50)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            step={0.5}
                            placeholder="e.g. 42"
                            value={row.mark}
                            onChange={(e) => updateRow(row.id, { mark: e.target.value })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(row.id)}
                          aria-label="Remove subject"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {rows.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        className="bg-lime text-foreground hover:bg-lime-hover"
                        onClick={handleCalculate}
                      >
                        Calculate ATAR
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Total units: {totalUnits} {totalUnits < 10 && "(need 10 for full aggregate)"}
                      </span>
                    </div>
                  )}

                  {result && (
                    <div className="rounded-lg border-2 border-lime/40 bg-lime/10 p-4 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Estimated result</p>
                      <p className="text-3xl font-bold">ATAR: {result.atar}</p>
                      <p className="text-sm text-muted-foreground">Aggregate: {result.aggregate.toFixed(2)}</p>
                      {result.bySubject.length > 0 && (
                        <ul className="mt-2 text-sm text-muted-foreground">
                          {result.bySubject.map((s, i) => (
                            <li key={i}>
                              {s.subjectName}: {s.scaledMark.toFixed(2)} (×{s.units})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
