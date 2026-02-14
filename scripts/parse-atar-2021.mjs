#!/usr/bin/env node
/**
 * Parses data/atar-2021-report.txt (2021 NSW HSC scaling report format)
 * and outputs SQL to load subjects + scaling_stats (year 2021) for Supabase.
 *
 * Run: node scripts/parse-atar-2021.mjs
 * Then run the printed SQL in Supabase SQL Editor.
 */

import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const reportPath = join(root, "data", "atar-2021-report.txt")

const text = readFileSync(reportPath, "utf8")
const lines = text.split(/\r?\n/)

const entries = []
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  if (!line.includes(" HSC ")) continue
  const scaledLine = lines[i + 1]
  if (!scaledLine || !scaledLine.trimStart().startsWith("scaled")) continue

  const beforeHsc = line.split(" HSC ")[0].trim()
  const afterHsc = line.split(" HSC ")[1] || ""
  const parts = beforeHsc.split(/\s+/)
  const num = parts.pop()
  const name = parts.join(" ").trim()
  if (!name) continue

  const hscNums = afterHsc.trim().split(/\s+/).map((s) => parseFloat(s)).filter((n) => !Number.isNaN(n))
  const scaledStr = scaledLine.replace(/^scaled\s*/, "").trim()
  const scaledNums = scaledStr.split(/\s+/).map((s) => parseFloat(s)).filter((n) => !Number.isNaN(n))

  if (hscNums.length < 8 || scaledNums.length < 8) continue

  const alignedMarks = hscNums.slice(2, 8)
  const scaledMarks = scaledNums.slice(2, 8)
  const units = name.includes("Extension") ? 1 : 2
  entries.push({ name, units, points: alignedMarks.map((a, i) => [a, scaledMarks[i]]) })
}

function sqlEscape(s) {
  return "'" + String(s).replace(/'/g, "''") + "'"
}

const subjectRows = [...new Map(entries.map((e) => [e.name, { name: e.name, units: e.units }])).values()]
console.log("-- 2021 NSW HSC scaling: subjects and scaling_stats (run in Supabase SQL Editor)")
console.log("-- First ensure tables exist (see supabase/atar-schema.sql)")
console.log("")
console.log("INSERT INTO subjects (name, units) VALUES")
console.log(
  subjectRows.map((s) => `  (${sqlEscape(s.name)}, ${s.units})`).join(",\n")
)
console.log("ON CONFLICT (name) DO NOTHING;")
console.log("")

console.log("-- Scaling stats: percentile column stores aligned HSC mark (0-50) for interpolation")
console.log("INSERT INTO scaling_stats (subject_id, year, percentile, scaled_mark) VALUES")
const valueRows = []
for (const e of entries) {
  for (const [aligned, scaled] of e.points) {
    valueRows.push(
      `  ((SELECT id FROM subjects WHERE name = ${sqlEscape(e.name)} LIMIT 1), 2021, ${aligned}, ${scaled})`
    )
  }
}
console.log(valueRows.join(",\n"))
console.log(";")
console.log("")
console.log("-- Optional: add 2021 aggregate->ATAR conversion (replace with official table if you have it)")
console.log("-- INSERT INTO atar_conversion (year, aggregate, atar) VALUES (2021, 100, 99.95), (2021, 90, 95), ...;")
console.log(`-- Parsed ${entries.length} subjects with scaling data.`)
console.log(`-- Subject names: ${subjectRows.length} unique.`)
