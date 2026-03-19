"use client"

import { useState, useEffect, useRef, Suspense, lazy } from "react"
import { useRouter } from "next/navigation"
import { SectionHeader } from "@/components/section-header"
import { ReportCarousel } from "@/components/dashboard/report-carousel"
import { Button } from "@/components/ui/button"
import { categories } from "@/lib/data"
import {
  TrendingUp, Clock, Search, BarChart3, Globe, FileText,
  Shield, ArrowRight, X,
} from "lucide-react"

const HeroScene = lazy(() =>
  import("@/components/dashboard/hero-scene").then((m) => ({ default: m.HeroScene }))
)

interface ReportData {
  newsid: number
  keyword: string
  catid: number
  forcastyear: string
  createddate: string
  reportstatus: number | null
}

interface SearchSuggestion {
  newsid: number
  keyword: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [trendingReports, setTrendingReports] = useState<ReportData[]>([])
  const [upcomingReports, setUpcomingReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalReports, setTotalReports] = useState(0)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [reportsRes, statsRes] = await Promise.all([
          fetch("/api/reports/category"),
          fetch("/api/reports/stats"),
        ])
        if (reportsRes.ok) {
          const data = await reportsRes.json()
          setTrendingReports(data.trending || [])
          setUpcomingReports(data.upcoming || [])
        }
        if (statsRes.ok) {
          const stats = await statsRes.json()
          setTotalReports(stats.total || 9000)
        }
      } catch {
        setTrendingReports([])
        setUpcomingReports([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleSearch(value: string) {
    setSearchQuery(value)
    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    try {
      const catParam = selectedCategory !== "all" ? `&catId=${selectedCategory}` : ""
      const res = await fetch(`/api/reports/search?q=${encodeURIComponent(value)}${catParam}`)
      const data = await res.json()
      if (data.suggestions?.length > 0) {
        setSuggestions(data.suggestions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch {
      setSuggestions([])
    }
  }

  return (
    <div>
      {/* ===== FULL-PAGE HERO ===== */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden bg-gradient-to-br from-[#1a1410] via-[#2a1f14] to-[#1c1510]">
        {/* Three.js Canvas */}
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        {/* Main hero content */}
        <div className="relative z-10 flex flex-1 items-center">
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,1fr)] lg:gap-32">
              {/* LEFT: Text content */}
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
                  <span className="size-2 animate-pulse rounded-full bg-amber-400" />
                  {totalReports.toLocaleString()}+ Reports Available
                </div>

                <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Coherent{" "}
                  <br className="hidden sm:block" />
                  Insights{" "}
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                    Vault.
                  </span>
                </h1>

                <p className="mt-5 max-w-md text-base leading-relaxed text-stone-400 lg:text-lg">
                  Access comprehensive market research reports across 26+ industries.
                  Make data-driven decisions with insights from global markets.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-7 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-amber-500/40"
                    onClick={() => router.push("/dashboard/reports/trending")}
                  >
                    <Search className="size-4" />
                    Explore Reports
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 rounded-full border-stone-600 bg-white/5 px-7 text-sm text-stone-300 backdrop-blur-sm hover:bg-white/10 hover:text-white"
                    onClick={() => router.push("/dashboard/reports/recent")}
                  >
                    Latest Reports
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* RIGHT: Stats cards */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-2 gap-3">
                  <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-md transition-all hover:border-amber-500/30 hover:bg-white/[0.08]">
                    <BarChart3 className="mb-3 size-7 text-amber-400 transition-transform group-hover:scale-110" />
                    <p className="text-2xl font-bold text-white">{totalReports.toLocaleString()}+</p>
                    <p className="mt-0.5 text-xs text-stone-500">Research Reports</p>
                  </div>
                  <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-md transition-all hover:border-blue-500/30 hover:bg-white/[0.08]">
                    <Globe className="mb-3 size-7 text-blue-400 transition-transform group-hover:scale-110" />
                    <p className="text-2xl font-bold text-white">26+</p>
                    <p className="mt-0.5 text-xs text-stone-500">Industry Verticals</p>
                  </div>
                  <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-md transition-all hover:border-emerald-500/30 hover:bg-white/[0.08]">
                    <FileText className="mb-3 size-7 text-emerald-400 transition-transform group-hover:scale-110" />
                    <p className="text-2xl font-bold text-white">1,180+</p>
                    <p className="mt-0.5 text-xs text-stone-500">Full PDF Reports</p>
                  </div>
                  <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-md transition-all hover:border-purple-500/30 hover:bg-white/[0.08]">
                    <Shield className="mb-3 size-7 text-purple-400 transition-transform group-hover:scale-110" />
                    <p className="text-2xl font-bold text-white">150+</p>
                    <p className="mt-0.5 text-xs text-stone-500">Countries Covered</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex -space-x-2">
                      {[
                        { letter: "C", bg: "bg-amber-700" },
                        { letter: "H", bg: "bg-orange-800" },
                        { letter: "T", bg: "bg-yellow-800" },
                        { letter: "P", bg: "bg-amber-800" },
                      ].map(({ letter, bg }, i) => (
                        <div key={i} className={`flex size-7 items-center justify-center rounded-full border-2 border-[#1a1410] ${bg} text-[10px] font-bold text-white`}>
                          {letter}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-white">Trusted by Fortune 500</p>
                      <p className="text-[11px] text-stone-500">Chemical, Healthcare, Tech, Pharma & more</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar at the bottom of hero */}
        <div className="relative z-10 pb-4 pt-2">
          <div className="mx-auto max-w-7xl px-4 lg:px-8" ref={searchRef}>
            <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.08] p-2 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 w-full shrink-0 cursor-pointer rounded-xl border-0 bg-white/10 px-3 text-sm font-medium text-white outline-none sm:w-auto"
              >
                <option value="all" className="bg-[#2a1f14] text-white">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.catId} value={String(cat.catId)} className="bg-[#2a1f14] text-white">
                    {cat.catName}
                  </option>
                ))}
              </select>

              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search market research reports..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border-0 bg-transparent pl-11 pr-10 text-sm font-medium text-white placeholder:text-white/50 outline-none sm:bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false) }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                )}

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-xl border border-white/10 bg-[#2a1f14]/95 shadow-2xl backdrop-blur-xl">
                    {suggestions.map((s) => (
                      <button
                        key={s.newsid}
                        onClick={() => {
                          setShowSuggestions(false)
                          setSearchQuery("")
                          router.push(`/dashboard/reports/${s.newsid}`)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Search className="size-3.5 shrink-0 text-stone-500" />
                        <span className="truncate">{s.keyword}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                size="sm"
                className="h-10 w-full shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-600 sm:w-auto"
                onClick={() => {
                  if (searchQuery) {
                    const catParam = selectedCategory !== "all" ? `&catId=${selectedCategory}` : ""
                    router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}${catParam}`)
                  }
                }}
              >
                Search
              </Button>
            </div>
          </div>
        </div>

      </section>

      {/* ===== REPORTS SECTIONS ===== */}
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : (
          <>
            <section className="mb-14">
              <div className="mb-6 flex items-center gap-2">
                <TrendingUp className="size-5 text-accent" />
                <SectionHeader
                  title="Trending Reports"
                  description="Most recent published market research reports"
                  align="left"
                  className="max-w-none"
                />
              </div>
              <ReportCarousel reports={trendingReports} direction="right" />
            </section>

            <section className="mb-14">
              <div className="mb-6 flex items-center gap-2">
                <Clock className="size-5 text-accent" />
                <SectionHeader
                  title="Upcoming Reports"
                  description="Reports being prepared for publication"
                  align="left"
                  className="max-w-none"
                />
              </div>
              <ReportCarousel reports={upcomingReports} direction="left" />
            </section>
          </>
        )}
      </div>
    </div>
  )
}
