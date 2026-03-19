"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Search, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCategoryName } from "@/lib/data"
import { AIInsights } from "@/components/dashboard/ai-insights"

interface SearchResult {
  newsid: number
  keyword: string
  catid: number
  forcastyear: string
  createddate: string
  reportstatus: number | null
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get("q") || ""
  const catId = searchParams.get("catId") || ""

  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showAi, setShowAi] = useState(false)
  const limit = 20

  useEffect(() => {
    if (!q) return
    setLoading(true)
    setShowAi(false)
    const catParam = catId ? `&catId=${catId}` : ""
    fetch(`/api/reports/search/results?q=${encodeURIComponent(q)}${catParam}&page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.reports || [])
        setTotal(data.total || 0)
        // If no reports found, automatically show AI insights
        if ((data.total || 0) === 0) {
          setShowAi(true)
        }
      })
      .catch(() => {
        setResults([])
        setShowAi(true)
      })
      .finally(() => setLoading(false))
  }, [q, catId, page])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-6 gap-2">
        <ArrowLeft className="size-4" /> Back to Dashboard
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Search className="size-5 text-accent" />
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Search Results
          </h1>
        </div>
        {!showAi && (
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Searching..." : `${total} report${total !== 1 ? "s" : ""} found for "${q}"`}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      ) : showAi ? (
        /* No DB results — fallback to AI-generated insights */
        <AIInsights query={q} />
      ) : (
        <>
          <div className="space-y-3">
            {results.map((report, idx) => (
              <button
                key={report.newsid}
                onClick={() => router.push(`/dashboard/reports/${report.newsid}`)}
                className="flex w-full items-start gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-secondary"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent">
                  {(page - 1) * limit + idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium leading-snug text-foreground">
                    {report.keyword}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryName(report.catid)}
                    </Badge>
                    {report.reportstatus === 1 ? (
                      <Badge className="bg-accent/10 text-accent text-xs">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Upcoming</Badge>
                    )}
                    {report.forcastyear && (
                      <span className="text-xs text-muted-foreground">
                        Forecast: {report.forcastyear}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.createddate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1"
              >
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
