"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Home, MapPin, BedDouble, Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type RentByType = { apartment: number; house: number; townhouse: number }

interface RentEstimatorProps {
  rentalData: {
    postcode: string
    locationLabel?: string
    filledFromNearby?: boolean
    medianWeeklyRent: RentByType
    byBedrooms?: Record<string, RentByType>
    nearbySuburbs: Array<{
      name: string
      distance: string
      medianRent: number
      medianWeeklyRent?: RentByType
      byBedrooms?: Record<string, RentByType>
    }>
  }
  userData: any
}

const BEDROOM_OPTIONS = [
  { value: "all", label: "All bedrooms" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1 bedroom" },
  { value: "2", label: "2 bedrooms" },
  { value: "3", label: "3 bedrooms" },
  { value: "4", label: "4+ bedrooms" },
] as const

type RentalDataShape = RentEstimatorProps["rentalData"]

const NORMALIZE_POSTCODE = (p: string) => String(p).replace(/\D/g, "").slice(0, 4).padStart(4, "0")

export function RentEstimator({ rentalData, userData }: RentEstimatorProps) {
  const [bedrooms, setBedrooms] = useState<string>("all")
  const [postcodeInput, setPostcodeInput] = useState<string>(() =>
    rentalData.postcode.replace(/\D/g, "").slice(0, 4).padStart(4, "0")
  )
  const [localRentalData, setLocalRentalData] = useState<RentalDataShape | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)

  const initialPostcode = rentalData.postcode.replace(/\D/g, "").padStart(4, "0")
  const displayedRentalData = localRentalData ?? rentalData

  const fetchRentalForPostcode = useCallback(
    async (postcode: string) => {
      const pc = NORMALIZE_POSTCODE(postcode)
      if (pc.length !== 4) return
      if (pc === initialPostcode) {
        setLocalRentalData(null)
        return
      }
      setLocationLoading(true)
      try {
        const params = new URLSearchParams({ postcode: pc })
        const res = await fetch(`/api/rental?${params}`)
        if (res.ok) {
          const data = (await res.json()) as RentalDataShape
          setLocalRentalData(data)
        }
      } catch {
        setLocalRentalData(null)
      } finally {
        setLocationLoading(false)
      }
    },
    [initialPostcode]
  )

  const applyPostcode = useCallback(() => {
    const pc = NORMALIZE_POSTCODE(postcodeInput)
    setPostcodeInput(pc)
    if (pc.length !== 4) return
    if (pc === initialPostcode) {
      setLocalRentalData(null)
      return
    }
    fetchRentalForPostcode(pc)
  }, [postcodeInput, initialPostcode, fetchRentalForPostcode])


  const displayedRent = useMemo((): RentByType => {
    if (bedrooms === "all" || !displayedRentalData.byBedrooms?.[bedrooms]) {
      return displayedRentalData.medianWeeklyRent
    }
    return displayedRentalData.byBedrooms[bedrooms]
  }, [bedrooms, displayedRentalData.medianWeeklyRent, displayedRentalData.byBedrooms])

  const chartData = useMemo(
    () =>
      [
        { name: "Apartment", rent: displayedRent.apartment },
        { name: "House", rent: displayedRent.house },
        { name: "Townhouse", rent: displayedRent.townhouse },
      ].filter((d) => d.rent > 0),
    [displayedRent]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent & Living Cost Estimates</CardTitle>
        <CardDescription>
          {displayedRentalData.locationLabel
            ? `Rental data for ${displayedRentalData.locationLabel} (${displayedRentalData.postcode}) and nearby areas`
            : `Rental data for postcode ${displayedRentalData.postcode} and nearby areas`}
          {displayedRentalData.filledFromNearby && (
            <span className="block mt-1 text-muted-foreground/90">
              No bond data for this postcode; showing average of nearby suburbs.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location: any postcode + suburb */}
        <div className="flex flex-wrap items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Postcode:</span>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="e.g. 2006"
            className="w-24 font-mono"
            value={postcodeInput}
            onChange={(e) => setPostcodeInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onBlur={applyPostcode}
            onKeyDown={(e) => e.key === "Enter" && applyPostcode()}
            disabled={locationLoading}
          />
          {displayedRentalData.locationLabel && (
            <span className="text-sm font-bold text-foreground">
              {displayedRentalData.locationLabel}
            </span>
          )}
          {locationLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Bedroom filter */}
        <div className="flex flex-wrap items-center gap-2">
          <BedDouble className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Number of bedrooms:</span>
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All bedrooms" />
            </SelectTrigger>
            <SelectContent>
              {BEDROOM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div>
          <h3 className="font-semibold mb-4">Average Weekly Rent by Type</h3>
          <div className="h-64 min-h-[200px] flex items-center justify-center rounded-md border border-dashed bg-muted/30">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="rent" fill="oklch(0.92 0.15 115)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center px-4">
                No rental data for this postcode and selection. Try another bedroom count or check that data exists for this area.
              </p>
            )}
          </div>
        </div>

        {/* Rent Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Apartment</p>
            </div>
            <p className="text-2xl font-bold">
              {displayedRent.apartment > 0 ? `$${displayedRent.apartment}` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">per week</p>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">House</p>
            </div>
            <p className="text-2xl font-bold">
              {displayedRent.house > 0 ? `$${displayedRent.house}` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">per week</p>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Townhouse</p>
            </div>
            <p className="text-2xl font-bold">
              {displayedRent.townhouse > 0 ? `$${displayedRent.townhouse}` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">per week</p>
          </div>
        </div>

        {/* Nearby Suburbs */}
        <div>
          <h3 className="font-semibold mb-3">Nearby Suburbs Comparison</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Average weekly rent by type for the selected bedroom count
          </p>
          <div className="space-y-2">
            {displayedRentalData.nearbySuburbs.map((suburb, index) => {
              const suburbRent =
                bedrooms === "all" || !suburb.byBedrooms?.[bedrooms]
                  ? suburb.medianWeeklyRent ?? {
                      apartment: suburb.medianRent,
                      house: suburb.medianRent,
                      townhouse: suburb.medianRent,
                    }
                  : suburb.byBedrooms[bedrooms]
              return (
                <div
                  key={index}
                  className="p-3 rounded-lg border space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-bold">{suburb.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm pl-6">
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">Apartment:</span>
                      <span className="font-semibold">
                        {suburbRent.apartment > 0 ? `$${suburbRent.apartment}` : "—"}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">House:</span>
                      <span className="font-semibold">
                        {suburbRent.house > 0 ? `$${suburbRent.house}` : "—"}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">Townhouse:</span>
                      <span className="font-semibold">
                        {suburbRent.townhouse > 0 ? `$${suburbRent.townhouse}` : "—"}
                      </span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
