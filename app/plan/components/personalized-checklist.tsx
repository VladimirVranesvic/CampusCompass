"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

interface ChecklistItem {
  task: string
  dueDate: string | null
  completed: boolean
}

interface ChecklistCategory {
  category: string
  items: ChecklistItem[]
}

interface PersonalizedChecklistProps {
  checklist: ChecklistCategory[]
  userData: any
}

export function PersonalizedChecklist({ checklist, userData }: PersonalizedChecklistProps) {
  const [items, setItems] = useState(checklist)

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...items]
    updated[categoryIndex].items[itemIndex].completed =
      !updated[categoryIndex].items[itemIndex].completed
    setItems(updated)
  }

  const completedCount = items.reduce(
    (acc, cat) => acc + cat.items.filter((item) => item.completed).length,
    0
  )
  const totalCount = items.reduce((acc, cat) => acc + cat.items.length, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Personalized Checklist</CardTitle>
            <CardDescription>
              Track your progress: {completedCount} of {totalCount} tasks completed
            </CardDescription>
          </div>
          <div className="text-2xl font-bold text-lime">
            {Math.round((completedCount / totalCount) * 100)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map((category, categoryIndex) => (
          <div key={category.category} className="space-y-3">
            <h3 className="font-semibold text-lg">{category.category}</h3>
            <div className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(categoryIndex, itemIndex)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      className={`text-sm font-medium cursor-pointer ${
                        item.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.task}
                    </label>
                    {item.dueDate && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due: {format(new Date(item.dueDate), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                  {item.completed && (
                    <CheckCircle2 className="h-5 w-5 text-lime" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
