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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

const userSchema = z.object({
  // Basic Info
  postcode: z.string().regex(/^\d{4}$/, "Invalid postcode (must be 4 digits)"),
  age: z.string().min(1, "Age is required"),
  australianCitizenOrPR: z.enum(["yes", "no"]).or(z.literal("")).refine((v) => v !== "", "Please select Yes or No"),
  applicantType: z.enum(["year-11", "year-12", "post-school"])
  .or(z.literal(""))
  .refine((v) => v !== "", "Please select applicant type"),
  consideredIndependent: z.enum(["yes", "no", "unsure"])
  .or(z.literal(""))
  .refine((v) => v !== "", "Please select Yes, No, or Unsure"),
  
  // Education
  highestEducation: z.string().min(1, "Please select your highest education level"),
  targetUniversities: z.array(z.string()).min(1, "Select at least one university"),
  preferredFields: z.array(z.string()).min(1, "Select at least one study field"),
  
  // Living Situation
  livingSituation: z.string().min(1, "Please select living situation"),
  rentalBudget: z.string().optional(),
  preferredLocationPostcode: z.string().optional().refine((v) => !v || /^\d{4}$/.test(v.trim()), "Must be 4 digits"),

  // Government subsidy eligibility (Step 4)
  householdIncome: z.string().min(1, "Please select income range"),
  personalIncomeFortnightly: z.string().optional(),
  significantAssets: z.string().optional(),
  significantAssetsValue: z.string().optional(),
  siblingsReceivingPayments: z.string().optional(),
  studyLoadFullTime: z.string().min(1, "Please select if studying full-time"),
  concessionalStudyLoad: z.string().optional(),
  isIndigenous: z.boolean().optional(),

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
  "Australian Catholic University",
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
      postcode: "",
      age: "",
      australianCitizenOrPR: "",
      applicantType: "",
      consideredIndependent: "",
      highestEducation: "",
      targetUniversities: [],
      preferredFields: [],
      livingSituation: "",
      rentalBudget: "",
      preferredLocationPostcode: "",
      householdIncome: "",
      personalIncomeFortnightly: "",
      significantAssets: "",
      significantAssetsValue: "",
      siblingsReceivingPayments: "",
      studyLoadFullTime: "",
      concessionalStudyLoad: "",
      isIndigenous: false,
      commuteMaxTime: "",
      budgetMax: "",
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
      isValid = await form.trigger(["postcode", "age", "australianCitizenOrPR", "applicantType", "consideredIndependent"])
    } else if (step === 2) {
      isValid = await form.trigger(["highestEducation", "targetUniversities", "preferredFields"])
    } else if (step === 3) {
      isValid = await form.trigger(["livingSituation"])
    } else if (step === 4) {
      isValid = await form.trigger(["householdIncome", "studyLoadFullTime"])
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

  const stepHeadings: { title: string; description: string }[] = [
    {
      title: "Basic Personal Information",
      description: "We use this to tailor local services, commute options, and age-based support like Youth Allowance.",
    },
    {
      title: "Your Course Preferences",
      description: "This helps us match you to course fees, application timelines, and faculty-specific information.",
    },
    {
      title: "Living Situation",
      description: "We use this to show relevant housing information and accommodation options.",
    },
    {
      title: "Government subsidy eligibility",
      description: "This helps us determine your eligibility for government subsidies and support.",
    },
  ]

  const currentHeading = stepHeadings[step - 1]

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
          <Progress value={(step / totalSteps) * 100} className="h-2 progress-lime" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step subheading */}
          <div className="pb-2 border-b">
            <h2 className="text-xl font-semibold tracking-tight">
              {currentHeading.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentHeading.description}
            </p>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">

              <div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="age" className="font-bold">Age *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      We use your age to show age-based support like Youth Allowance (typically 18–24) and other eligibility.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="age"
                  type="number"
                  {...register("age")}
                  placeholder="18"
                  min={16}
                  max={99}
                  className="mt-2 w-18"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.age.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="applicantType" className="font-bold">Applicant type *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      Whether you're in Year 11, Year 12, or applying after school affects timelines and options.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={watch("applicantType") ?? ""}
                  onValueChange={(value) => setValue("applicantType", value as "year-11" | "year-12" | "post-school")}
                >
                  <SelectTrigger id="applicantType" className="mt-2 w-full max-w-xs">
                    <SelectValue placeholder="Select applicant type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year-11">Year 11</SelectItem>
                    <SelectItem value="year-12">Year 12</SelectItem>
                    <SelectItem value="post-school">Post-school applicant</SelectItem>
                  </SelectContent>
                </Select>
                {errors.applicantType && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.applicantType.message}
                  </p>
                )}
              </div>
            
              <div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="postcode" className="font-bold">Current dwelling (Postcode) *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      Your postcode helps us show commute options and local rental estimates.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="postcode"
                  {...register("postcode")}
                  placeholder="2000"
                  maxLength={4}
                  className="mt-2 w-18"
                />
                {errors.postcode && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.postcode.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="australianCitizenOrPR" className="font-bold">Australian citizen? *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      Youth Allowance and most government support require Australian citizenship or permanent residency.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={watch("australianCitizenOrPR") ?? ""}
                  onValueChange={(value) => setValue("australianCitizenOrPR", value as "yes" | "no")}
                >
                  <SelectTrigger id="australianCitizenOrPR" className="mt-2 w-full max-w-xs">
                    <SelectValue placeholder="Yes or No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.australianCitizenOrPR && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.australianCitizenOrPR.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="consideredIndependent" className="font-bold">Are you considered independent? *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      E.g. 2+ years full-time work after school, parents deceased/separated with no support, have a dependent child, refugee status, etc.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="mt-1 text-sm text-muted-foreground mb-2">
                </p>
                <Select
                  value={watch("consideredIndependent") ?? ""}
                  onValueChange={(value) => setValue("consideredIndependent", value as "yes" | "no" | "unsure")}
                >
                  <SelectTrigger id="consideredIndependent" className="mt-2 w-full max-w-xs">
                    <SelectValue placeholder="Select Yes, No, or Unsure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unsure">Unsure</SelectItem>
                  </SelectContent>
                </Select>
                {errors.consideredIndependent && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.consideredIndependent.message}
                  </p>
                )}
              </div>
            </div>
          )}


          {/* Step 2: Education */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-1.5">
                <Label htmlFor="highestEducation" className="font-bold">Highest Education level *</Label>
                <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs min-w-0 w-max max-w-[280px]">
                      Your highest completed qualification helps us match you to courses, entry requirements, and fee information.
                    </TooltipContent>
                  </Tooltip>
                </div>
                  <Select
                    onValueChange={(value) => setValue("highestEducation", value)}
                    defaultValue={watch("highestEducation")}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your highest education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hsc">High School Certificate</SelectItem>
                      <SelectItem value="certificate-diploma">Certificate or Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor Degree</SelectItem>
                      <SelectItem value="graduate">Graduate Degree</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.highestEducation && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.highestEducation.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                  <Label htmlFor="Target Universities" className="font-bold">Target Universities * (Select at least one)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      We’ll tailor fees, commute options, and application timelines to the universities you select.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {universities.map((uni) => {
                    const isSelected = watchedUniversities.includes(uni)
                    const uniIndex = watchedUniversities.indexOf(uni)
                    const isPrimary = uniIndex === 0
                    return (
                      <div key={uni} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={uni}
                            checked={isSelected}
                            onCheckedChange={() => toggleUniversity(uni)}
                          />
                          <label
                            htmlFor={uni}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                          >
                            <span>{uni}</span>
                            {isPrimary && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-lime/20 text-[oklch(0.45_0.90_115)] font-medium">
                                1st
                              </span>
                            )}
                            {isSelected && !isPrimary && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                #{uniIndex + 1}
                              </span>
                            )}
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {errors.targetUniversities && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.targetUniversities.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <Label className="font-bold">Preferred Study Fields * (Select at least one)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      We use this for fee estimates and faculty-specific information. Your first selection is used as your primary preference.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground mt-1 mb-2">
                  Your first selection will be used as your primary preference for fee estimates.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {studyFields.map((field) => {
                    const index = watchedFields.indexOf(field)
                    const isSelected = index !== -1
                    const isPrimary = index === 0
                    return (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                          id={field}
                          checked={isSelected}
                          onCheckedChange={() => toggleField(field)}
                        />
                        <label
                          htmlFor={field}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                        >
                          <span>{field}</span>
                          {isPrimary && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-lime/20 text-[oklch(0.45_0.90_115)] font-medium">
                              1st
                            </span>
                          )}
                          {isSelected && !isPrimary && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              #{index + 1}
                            </span>
                          )}
                        </label>
                      </div>
                    )
                  })}
                </div>
                {errors.preferredFields && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.preferredFields.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Living Situation */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="livingSituation" className="font-bold">Living Situation *</Label>
                <Select
                  value={watch("livingSituation") ?? ""}
                  onValueChange={(value) => setValue("livingSituation", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your living situation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staying at home">Staying at home</SelectItem>
                    <SelectItem value="Renting/Moving out">Renting/Moving out</SelectItem>
                    <SelectItem value="On-campus accommodation">On-campus accommodation</SelectItem>
                    <SelectItem value="Remote/Regional area">Remote/Regional area</SelectItem>
                    <SelectItem value="Not sure yet">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
                {errors.livingSituation && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.livingSituation.message}
                  </p>
                )}
              </div>

              {/* IF Renting/Moving out: Preferred location + Rental budget */}
              {watch("livingSituation") === "Renting/Moving out" && (
                <>
                  <div>
                    <Label htmlFor="preferredLocationPostcode" className="font-bold">Preferred location (postcode)</Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Enter the postcode where you want to move. We will show rental estimates for this area.
                    </p>
                    <Input
                      id="preferredLocationPostcode"
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="e.g. 2006"
                      className="mt-2 w-24 font-mono"
                      {...register("preferredLocationPostcode")}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 4)
                        setValue("preferredLocationPostcode", v, { shouldValidate: true })
                      }}
                    />
                    {errors.preferredLocationPostcode && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.preferredLocationPostcode.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="rentalBudget" className="font-bold">Rental budget (weekly)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                            <Info className="size-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          Will be used to find closest suburbs to desired universities that are within the budget range.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="rentalBudget"
                      type="number"
                      {...register("rentalBudget")}
                      placeholder="350"
                      min={0}
                      className="mt-2 w-24"
                    />
                  </div>
                </>
              )}

              {/* IF On-campus accommodation: info */}
              {watch("livingSituation") === "On-campus accommodation" && (
                <div className="rounded-lg border border-lime/30 bg-lime/10 p-4">
                  <p className="text-sm text-foreground">
                    We will provide details on your primary university selections on-campus accommodation options and whether you fit the requirements.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Government subsidy eligibility */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Household Income (required) */}
              <div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="householdIncome" className="font-bold">Household Income *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <ul className="list-disc list-outside pl-5 space-y-1 text-left">
                        <li>Under $66,722 — Full eligibility</li>
                        <li>$66,723 – $80,000 — Partial reduction (20¢ per $ over $66,722, 50–90% of max rate)</li>
                        <li>$80,001 – $100,000 — Significant reduction</li>
                        <li>$100,001 – $150,000 — Usually zero for most dependent students; small amount possible if multiple children receive Youth Allowance</li>
                        <li>Over $150,000 — Almost always zero</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  onValueChange={(value) => setValue("householdIncome", value)}
                  value={watch("householdIncome") ?? ""}
                >
                  <SelectTrigger id="householdIncome" className="mt-2 w-full max-w-xs">
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-66722">Under $66,722</SelectItem>
                    <SelectItem value="66723-80k">$66,723 – $80,000</SelectItem>
                    <SelectItem value="80k-100k">$80,001 – $100,000</SelectItem>
                    <SelectItem value="100k-150k">$100,001 – $150,000</SelectItem>
                    <SelectItem value="over-150k">Over $150,000</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {errors.householdIncome && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.householdIncome.message}
                  </p>
                )}
              </div>

                            {/* Personal Income & Assets */}
                            <div className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                <h3 className="text-sm font-semibold">Personal Income & Assets</h3>

                <div>
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="personalIncomeFortnightly" className="font-bold">Approximate fortnightly personal income </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                          <Info className="size-4" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Used to assess your Youth Allowance personal income test. Over $539 fortnightly can reduce or stop payment.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    onValueChange={(value) => setValue("personalIncomeFortnightly", value)}
                    value={watch("personalIncomeFortnightly") ?? ""}
                  >
                    <SelectTrigger id="personalIncomeFortnightly" className="mt-2 w-full max-w-xs">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-190">Under $190</SelectItem>
                      <SelectItem value="190-539">$190 – $539</SelectItem>
                      <SelectItem value="over-539">Over $539</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="significantAssets" className="font-bold">Do you have significant assets?</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                          <Info className="size-4" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Assets over set limits can affect Youth Allowance. Includes savings, investments, and certain vehicle value.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    onValueChange={(value) => setValue("significantAssets", value)}
                    value={watch("significantAssets") ?? ""}
                  >
                    <SelectTrigger id="significantAssets" className="mt-2 w-full max-w-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {watch("significantAssets") === "yes" && (
                    <Input
                      id="significantAssetsValue"
                      {...register("significantAssetsValue")}
                      placeholder="Rough value (e.g. $5,000 savings)"
                      className="mt-2 w-full max-w-xs"
                    />
                  )}
                </div>
              </div>

              {/* Siblings receiving payments */}
              <div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="siblingsReceivingPayments" className="font-bold">Siblings receiving Youth Allowance, ABSTUDY or similar</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      Parental income taper is shared among siblings — reduces impact per person if multiple qualify.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  onValueChange={(value) => setValue("siblingsReceivingPayments", value)}
                  value={watch("siblingsReceivingPayments") ?? ""}
                >
                  <SelectTrigger id="siblingsReceivingPayments" className="mt-2 w-full max-w-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">None</SelectItem>
                    <SelectItem value="yes-1">One</SelectItem>
                    <SelectItem value="yes-2">Two</SelectItem>
                    <SelectItem value="yes-3plus">Three or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Study load */}
              <div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="studyLoadFullTime" className="font-bold">Will you be studying full-time? *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help text-muted-foreground hover:text-foreground" aria-label="More info">
                        <Info className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      Load must be 75%+. Youth Allowance requires full-time or concessional approved study.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  onValueChange={(value) => setValue("studyLoadFullTime", value)}
                  value={watch("studyLoadFullTime") ?? ""}
                >
                  <SelectTrigger id="studyLoadFullTime" className="mt-2 w-full max-w-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.studyLoadFullTime && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.studyLoadFullTime.message}
                  </p>
                )}
              </div>

              {watch("studyLoadFullTime") === "no" && (
                <div>
                  <Label htmlFor="concessionalStudyLoad" className="font-bold">Is it a concessional study load due to disability or illness?</Label>
                  <Select
                    onValueChange={(value) => setValue("concessionalStudyLoad", value)}
                    value={watch("concessionalStudyLoad") ?? ""}
                  >
                    <SelectTrigger id="concessionalStudyLoad" className="mt-2 w-full max-w-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Indigenous status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isIndigenous"
                  checked={watch("isIndigenous") ?? false}
                  onCheckedChange={(checked) =>
                    setValue("isIndigenous", checked === true)
                  }
                />
                <label
                  htmlFor="isIndigenous"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I am Aboriginal or Torres Strait Islander (for ABSTUDY eligibility)
                </label>
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
