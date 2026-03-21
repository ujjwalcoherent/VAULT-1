"use client"

import { useRef, useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, PieChart as PieChartIcon, Globe, BarChart3, AlertTriangle } from "lucide-react"

interface MarketSizePoint {
  year: string
  value: number
}

interface SegmentShare {
  name: string
  value: number
  fill?: string
}

interface ImpactFactor {
  name: string
  impact: number
}

export interface ChartData {
  marketSize: MarketSizePoint[]
  segmentation: SegmentShare[]
  regional: SegmentShare[]
  drivers: ImpactFactor[]
  restraints: ImpactFactor[]
  cagr: number
  currency: string
}

const TEAL   = "#0d9488"
const NAVY   = "#1e3a5f"
const INDIGO = "#3b52a5"
const BRIGHT = "#0ba89c"
const SKY    = "#38a5c6"
const DEEP   = "#0f4c75"
const LIGHT  = "#5eead4"
const SLATE  = "#64748b"

const PIE_PALETTE   = [TEAL, NAVY, BRIGHT, SKY, INDIGO, DEEP, LIGHT, SLATE]
const BAR_GRADIENT  = [LIGHT, BRIGHT, TEAL, SKY, INDIGO, NAVY]

const GRID_LIGHT  = "#d1d5db"
const AXIS_LIGHT  = "#6b7280"

const TOOLTIP_STYLE = { backgroundColor: "#fff", border: `1px solid ${GRID_LIGHT}`, borderRadius: 8, fontSize: 12 }

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook — triggers animation on scroll into view */
/* ------------------------------------------------------------------ */

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}

/* ------------------------------------------------------------------ */
/*  Animated counter for the CAGR badge                               */
/* ------------------------------------------------------------------ */

function AnimatedNumber({ value, suffix = "", duration = 1200 }: { value: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Number((eased * value).toFixed(1)))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <span ref={ref}>{display}{suffix}</span>
}

/* ------------------------------------------------------------------ */
/*  Pie label                                                          */
/* ------------------------------------------------------------------ */

function CustomPieLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number
}) {
  if (percent < 0.06) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/* ------------------------------------------------------------------ */
/*  Market Size — animated bar chart                                   */
/* ------------------------------------------------------------------ */

export function MarketSizeChart({ data, currency, cagr }: { data: MarketSizePoint[]; currency: string; cagr: number }) {
  const { ref, visible } = useInView()
  if (!data || data.length === 0) return null

  const animatedData = visible ? data : data.map((d) => ({ ...d, value: 0 }))

  return (
    <Card ref={ref} className="mt-4 border-accent/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-5 text-accent" />
          Market Size Projection ({currency})
          {cagr > 0 && (
            <span className="ml-auto rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
              CAGR: {visible ? <AnimatedNumber value={cagr} suffix="%" /> : "0%"}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={animatedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_LIGHT} />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: AXIS_LIGHT }} stroke={GRID_LIGHT} />
            <YAxis tick={{ fontSize: 12, fill: AXIS_LIGHT }} stroke={GRID_LIGHT} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`$${value.toFixed(1)}B`, "Market Size"]} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60} animationDuration={1400} animationEasing="ease-out" isAnimationActive={visible}>
              {data.map((_, i) => (
                <Cell key={`ms-${i}`} fill={BAR_GRADIENT[i % BAR_GRADIENT.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Segmentation — animated pie chart                                  */
/* ------------------------------------------------------------------ */

export function SegmentationChart({ data }: { data: SegmentShare[] }) {
  const { ref, visible } = useInView()
  if (!data || data.length === 0) return null

  return (
    <Card ref={ref} className="mt-4 border-accent/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChartIcon className="size-5 text-accent" />
          Market Segmentation Share
        </CardTitle>
      </CardHeader>
      <CardContent className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={visible ? CustomPieLabel : undefined}
              outerRadius={110}
              dataKey="value"
              animationDuration={1200}
              animationBegin={200}
              animationEasing="ease-out"
              isAnimationActive={visible}
            >
              {data.map((_, i) => (
                <Cell key={`seg-${i}`} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, "Share"]} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              formatter={(value) => <span style={{ color: AXIS_LIGHT }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Regional — animated pie chart                                      */
/* ------------------------------------------------------------------ */

export function RegionalChart({ data }: { data: SegmentShare[] }) {
  const { ref, visible } = useInView()
  if (!data || data.length === 0) return null

  return (
    <Card ref={ref} className="mt-4 border-accent/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="size-5 text-accent" />
          Regional Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={visible ? CustomPieLabel : undefined}
              outerRadius={110}
              dataKey="value"
              animationDuration={1200}
              animationBegin={400}
              animationEasing="ease-out"
              isAnimationActive={visible}
            >
              {data.map((_, i) => (
                <Cell key={`reg-${i}`} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, "Share"]} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              formatter={(value) => <span style={{ color: AXIS_LIGHT }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Impact Analysis — animated horizontal bars                         */
/* ------------------------------------------------------------------ */

export function ImpactAnalysisChart({ drivers, restraints }: { drivers: ImpactFactor[]; restraints: ImpactFactor[] }) {
  const { ref, visible } = useInView()
  if ((!drivers || drivers.length === 0) && (!restraints || restraints.length === 0)) return null

  return (
    <Card ref={ref} className="mt-4 border-accent/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="size-5 text-accent" />
          Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <div className="grid gap-6 md:grid-cols-2">
          {drivers && drivers.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRIGHT }}>
                <TrendingUp className="size-4" /> Growth Drivers
              </h4>
              <ResponsiveContainer width="100%" height={drivers.length * 50 + 20}>
                <BarChart data={drivers} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_LIGHT} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: AXIS_LIGHT }} stroke={GRID_LIGHT} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: AXIS_LIGHT }} stroke={GRID_LIGHT} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value}/100`, "Impact"]} />
                  <Bar dataKey="impact" fill={BRIGHT} radius={[0, 4, 4, 0]} maxBarSize={24} animationDuration={1200} animationEasing="ease-out" isAnimationActive={visible} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {restraints && restraints.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold" style={{ color: NAVY }}>
                <AlertTriangle className="size-4" /> Restraints
              </h4>
              <ResponsiveContainer width="100%" height={restraints.length * 50 + 20}>
                <BarChart data={restraints} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_LIGHT} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: AXIS_LIGHT }} stroke={GRID_LIGHT} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: AXIS_LIGHT }} stroke={GRID_LIGHT} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value}/100`, "Impact"]} />
                  <Bar dataKey="impact" fill={NAVY} radius={[0, 4, 4, 0]} maxBarSize={24} animationDuration={1200} animationBegin={300} animationEasing="ease-out" isAnimationActive={visible} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
