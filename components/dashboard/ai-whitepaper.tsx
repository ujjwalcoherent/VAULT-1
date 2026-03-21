"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, FileText } from "lucide-react"
import {
  MarketSizeChart,
  SegmentationChart,
  RegionalChart,
  ImpactAnalysisChart,
  type ChartData,
} from "@/components/dashboard/whitepaper-charts"

interface WhitepaperSection {
  title: string
  content: string
}

interface AiWhitepaperProps {
  topic: string
  mode?: "full" | "summary"
  onSummaryGenerated?: (html: string) => void
}

const SECTION_CHART_MAP: Record<string, string> = {
  "executive summary": "marketSize",
  "market size": "marketSize",
  "growth projections": "marketSize",
  "growth factors": "drivers",
  "drivers": "drivers",
  "market segmentation": "segmentation",
  "segmentation": "segmentation",
  "regional analysis": "regional",
  "regional": "regional",
  "challenges": "restraints",
  "restraints": "restraints",
}

function getChartType(sectionTitle: string): string | null {
  const lower = sectionTitle.toLowerCase()
  for (const [key, type] of Object.entries(SECTION_CHART_MAP)) {
    if (lower.includes(key)) return type
  }
  return null
}

export function AiWhitepaper({ topic, mode = "full", onSummaryGenerated }: AiWhitepaperProps) {
  const [sections, setSections] = useState<WhitepaperSection[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchWhitepaper = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/ai/whitepaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, mode }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to load report")
      }

      const data = await res.json()
      setSections(data.sections || [])
      setChartData(data.chartData || null)

      if (mode === "summary" && data.sections?.[0]?.content && onSummaryGenerated) {
        onSummaryGenerated(data.sections[0].content)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load report. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [topic, mode, onSummaryGenerated])

  useEffect(() => {
    if (topic) fetchWhitepaper()
  }, [topic, fetchWhitepaper])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertCircle className="mx-auto mb-3 size-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={fetchWhitepaper}>
            <RefreshCw className="size-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (mode === "summary" && sections.length > 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl">
            <FileText className="size-5 text-accent" />
            Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="report-content"
            dangerouslySetInnerHTML={{ __html: sections[0].content }}
          />
        </CardContent>
      </Card>
    )
  }

  const renderedCharts = new Set<string>()

  function renderChartForSection(sectionTitle: string) {
    if (!chartData) return null
    const chartType = getChartType(sectionTitle)
    if (!chartType || renderedCharts.has(chartType)) return null
    renderedCharts.add(chartType)

    switch (chartType) {
      case "marketSize":
        return <MarketSizeChart data={chartData.marketSize} currency={chartData.currency} cagr={chartData.cagr} />
      case "segmentation":
        return <SegmentationChart data={chartData.segmentation} />
      case "regional":
        return <RegionalChart data={chartData.regional} />
      case "drivers":
        return <ImpactAnalysisChart drivers={chartData.drivers} restraints={chartData.restraints} />
      case "restraints":
        if (renderedCharts.has("drivers")) return null
        return <ImpactAnalysisChart drivers={chartData.drivers} restraints={chartData.restraints} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent">
                {idx + 1}
              </span>
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none text-muted-foreground [&_li]:mb-1 [&_p]:mb-3 [&_strong]:text-foreground [&_ul]:ml-4"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
            {renderChartForSection(section.title)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
