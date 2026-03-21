"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, BarChart3, FileText, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AiWhitepaper } from "@/components/dashboard/ai-whitepaper"
import { ReportSidebar } from "@/components/dashboard/report-sidebar"

function formatTitle(query: string) {
  return query
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    + (query.toLowerCase().includes("market") ? "" : " Market")
}

function GeneratedReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get("q") || ""

  if (!q) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8 text-center">
        <p className="text-muted-foreground">No report query specified.</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    )
  }

  const title = formatTitle(q)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
        <ArrowLeft className="size-4" /> Back to Results
      </Button>

      {/* Report Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Market Research</Badge>
          <Badge className="bg-accent text-accent-foreground">Published</Badge>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-4 text-accent" />
            {new Date().toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="size-4 text-accent" />
            Forecast: 2024–2030
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="size-4 text-accent" />
            Comprehensive Report
          </span>
        </div>

        <div className="mt-5">
          <Button size="lg" className="gap-2">
            <Send className="size-4" />
            Request Full Report
          </Button>
        </div>
      </div>

      {/* Content + Sidebar grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div>
          <AiWhitepaper topic={q} mode="full" />
        </div>
        <ReportSidebar />
      </div>
    </div>
  )
}

export default function GeneratedReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      }
    >
      <GeneratedReportContent />
    </Suspense>
  )
}
