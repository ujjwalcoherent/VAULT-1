"use client"

import { useState, useEffect } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrainCircuit, Loader2 } from "lucide-react"
import type { AIInsightSection } from "@/lib/types"

interface AIInsightsProps {
  query: string
}

export function AIInsights({ query }: AIInsightsProps) {
  const [sections, setSections] = useState<AIInsightSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        })
        if (!res.ok) throw new Error("Failed to fetch insights")
        const data = await res.json()
        setSections(data.sections || [])
      } catch {
        setError("Unable to generate insights. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (query) fetchInsights()
  }, [query])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">
              Fetching report summary for &ldquo;{query}&rdquo;...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl">
          <BrainCircuit className="size-5 text-accent" />
          Summary: {query}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {sections.map((section, idx) => (
            <AccordionItem key={idx} value={`section-${idx}`}>
              <AccordionTrigger className="text-sm font-medium">
                {section.title}
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
