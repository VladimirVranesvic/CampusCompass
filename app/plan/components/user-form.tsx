"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react"

const userSchema = z.object({
  // Basic Info
  postcode: z.string().regex(/^\d{4}$/, "Invalid postcode (must be 4 digits)"),
  age: z.string().min(1, "Age is required"),
  
  // Education
  currentYear: z.string().min(1, "Please select your current year"),
  targetUniversities: z.array(z.string()).min(1, "Select at least one university"),
  preferredFields: z.array(z.string()).optional(),
  
  // Living Situation
  livingSituation: z.string().min(1, "Please select living situation"),
  householdIncome: z.string().optional(),
  
  // Preferences
  commuteMaxTime: z.string().optional(),
  budgetMax: z.string().optional(),
})

type UserData = z.infer<typeof userSchema>

const universities = [
  "University of Sydney",
  "UNSW Sydney",
  "University of Technology Sydney",
  "Macquarie University",
  "Western Sydney University",
  "University of Wollongong",
  "University of Newcastle",
  "Charles Sturt University",
  "Southern Cross University",
  "University of New England",
]

const studyFields = [
  "Engineering",
  "Science",
  "Business",
  "Arts & Humanities",
  "Medicine",
  "Law",
  "Education",
  "IT & Computing",
  "Health Sciences",
  "Creative Arts",
]

interface UserFormProps {
  onSubmit: (data: UserData) => void
  loading: boolean
}

export function UserForm({ onSubmit, loading }: UserFormProps) {
  const [step, setStep] = useState(1)
  const totalSteps = 4
  
  const form = useForm<UserData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      targetUniversities: [],
      preferredFields: [],
    },
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form
  const watchedUniversities = watch("targetUniversities") || []
  const watchedFields = watch("preferredFields") || []

  const toggleUniversity = (uni: string) => {
    const current = watchedUniversities
    if (current.includes(uni)) {
      setValue("targetUniversities", current.filter((u) => u !== uni))
    } else {
      setValue("targetUniversities", [...current, uni])
    }
  }

  const toggleField = (field: string) => {
    const current = watchedFields
    if (current.includes(field)) {
      setValue("preferredFields", current.filter((f) => f !== field))
    } else {
      setValue("preferredFields", [...current, field])
    }
  }

  const onNext = async () => {
    let isValid = false
    
    if (step === 1) {
      isValid = await form.trigger(["postcode", "age"])
    } else if (step === 2) {
      isValid = await form.trigger(["currentYear", "targetUniversities"])
    } else if (step === 3) {
      isValid = await form.trigger(["livingSituation"])
    } else if (step === 4) {
      isValid = await form.trigger()
    }

    if (isValid) {
      if (step === totalSteps) {
        handleSubmit(onSubmit)()
      } else {
        setStep(step + 1)
      }
    }
  }

  const onBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Create Your Personalized Plan
          </h1>
          <p className="mt-4 text-muted-foreground">
            Answer a few questions to get customized checklists, timelines, and recommendations.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  {...register("postcode")}
                  placeholder="2000"
                  maxLength={4}
                  className="mt-2"
                />
                {errors.postcode && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.postcode.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  {...register("age")}
                  placeholder="18"
                  min={16}
                  max={25}
                  className="mt-2"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.age.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="currentYear">Current Year *</Label>
                <Select
                  onValueChange={(value) => setValue("currentYear", value)}
                  defaultValue={watch("currentYear")}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your current year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Year 11">Year 11</SelectItem>
                    <SelectItem value="Year 12">Year 12</SelectItem>
                    <SelectItem value="Gap Year">Post-school applicant</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currentYear && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.currentYear.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Target Universities * (Select at least one)</Label>
                <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {universities.map((uni) => (
                    <div key={uni} className="flex items-center space-x-2">
                      <Checkbox
                        id={uni}
                        checked={watchedUniversities.includes(uni)}
                        onCheckedChange={() => toggleUniversity(uni)}
                      />
                      <label
                        htmlFor={uni}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {uni}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.targetUniversities && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.targetUniversities.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Preferred Study Fields (Optional)</Label>
                <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {studyFields.map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={watchedFields.includes(field)}
                        onCheckedChange={() => toggleField(field)}
                      />
                      <label
                        htmlFor={field}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {field}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Living Situation */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="livingSituation">Living Situation *</Label>
                <Select
                  onValueChange={(value) => setValue("livingSituation", value)}
                  defaultValue={watch("livingSituation")}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your living situation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Living at home</SelectItem>
                    <SelectItem value="renting">Renting</SelectItem>
                    <SelectItem value="on-campus">On-campus accommodation</SelectItem>
                    <SelectItem value="unsure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
                {errors.livingSituation && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.livingSituation.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="householdIncome">Household Income (Optional)</Label>
                <Select
                  onValueChange={(value) => setValue("householdIncome", value)}
                  defaultValue={watch("householdIncome")}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-50k">Under $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
                    <SelectItem value="over-150k">Over $150,000</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="commuteMaxTime">Maximum Commute Time (Optional)</Label>
                <Select
                  onValueChange={(value) => setValue("commuteMaxTime", value)}
                  defaultValue={watch("commuteMaxTime")}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select maximum commute time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="no-limit">No limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budgetMax">Maximum Weekly Budget (Optional)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  {...register("budgetMax")}
                  placeholder="500"
                  className="mt-2"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  For rent and living expenses
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={step === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="bg-lime text-foreground hover:bg-lime-hover"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : step === totalSteps ? (
                "Generate Plan"
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
