"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, MapPin, DollarSign } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RentEstimatorProps {
  rentalData: {
    postcode: string
    medianWeeklyRent: {
      apartment: number
      house: number
      share: number
    }
    nearbySuburbs: Array<{
      name: string
      distance: string
      medianRent: number
    }>
  }
  userData: any
}

export function RentEstimator({ rentalData, userData }: RentEstimatorProps) {
  const chartData = [
    { name: "Apartment", rent: rentalData.medianWeeklyRent.apartment },
    { name: "House", rent: rentalData.medianWeeklyRent.house },
    { name: "Share", rent: rentalData.medianWeeklyRent.share },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent & Living Cost Estimates</CardTitle>
        <CardDescription>
          Rental data for postcode {rentalData.postcode} and nearby areas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Median Rents */}
        <div>
          <h3 className="font-semibold mb-4">Median Weekly Rent by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="rent" fill="oklch(0.92 0.15 115)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rent Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Apartment</p>
            </div>
            <p className="text-2xl font-bold">${rentalData.medianWeeklyRent.apartment}</p>
            <p className="text-xs text-muted-foreground">per week</p>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">House</p>
            </div>
            <p className="text-2xl font-bold">${rentalData.medianWeeklyRent.house}</p>
            <p className="text-xs text-muted-foreground">per week</p>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Share House</p>
            </div>
            <p className="text-2xl font-bold">${rentalData.medianWeeklyRent.share}</p>
            <p className="text-xs text-muted-foreground">per week</p>
          </div>
        </div>

        {/* Nearby Suburbs */}
        <div>
          <h3 className="font-semibold mb-3">Nearby Suburbs Comparison</h3>
          <div className="space-y-2">
            {rentalData.nearbySuburbs.map((suburb, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{suburb.name}</p>
                    <p className="text-sm text-muted-foreground">{suburb.distance} away</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">${suburb.medianRent}/week</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
