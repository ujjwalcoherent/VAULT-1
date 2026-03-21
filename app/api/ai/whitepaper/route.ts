import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

interface WhitepaperSection {
  title: string
  content: string
}

interface MarketSizePoint {
  year: string
  value: number
}

interface SegmentShare {
  name: string
  value: number
  fill: string
}

interface RegionalShare {
  name: string
  value: number
  fill: string
}

interface ImpactFactor {
  name: string
  impact: number
}

export interface ChartData {
  marketSize: MarketSizePoint[]
  segmentation: SegmentShare[]
  regional: RegionalShare[]
  drivers: ImpactFactor[]
  restraints: ImpactFactor[]
  cagr: number
  currency: string
}

export interface WhitepaperResponse {
  topic: string
  sections: WhitepaperSection[]
  chartData: ChartData | null
  isAiGenerated: boolean
}

const SEGMENT_COLORS = [
  "#0d9488",
  "#1e3a5f",
  "#0ba89c",
  "#38a5c6",
  "#3b52a5",
  "#0f4c75",
  "#5eead4",
  "#64748b",
]

const WHITEPAPER_SECTIONS = [
  {
    key: "executiveSummary",
    title: "Executive Summary",
    prompt: (topic: string) =>
      `Write an executive summary (150-200 words) for the "${topic}" market. Include global and regional market size estimates for 2024-2030, projected CAGR, and key highlights. Use realistic estimates. Format with HTML tags (<p>, <strong>, <ul>, <li>).`,
    maxTokens: 400,
  },
  {
    key: "marketOverview",
    title: "Market Overview & Definition",
    prompt: (topic: string) =>
      `Provide a market overview and product definition for the "${topic}" market in 100-150 words. Define what the product/service is, its applications, and why it matters. Format with HTML tags.`,
    maxTokens: 300,
  },
  {
    key: "marketSize",
    title: "Market Size & Growth Projections",
    prompt: (topic: string) =>
      `Provide market size and growth projections for the "${topic}" market. Include estimated market value for 2024 and projected value for 2030, growth rate (CAGR), and key factors driving the growth. Use realistic estimates. Format with HTML tags (<p>, <strong>, <ul>, <li>).`,
    maxTokens: 350,
  },
  {
    key: "growthFactors",
    title: "Growth Factors & Drivers",
    prompt: (topic: string) =>
      `List 5-6 major growth factors driving the "${topic}" market. Each factor should have a brief 1-2 sentence explanation. Format as an HTML bullet list (<ul><li><strong>Factor:</strong> explanation</li></ul>).`,
    maxTokens: 400,
  },
  {
    key: "segmentation",
    title: "Market Segmentation",
    prompt: (topic: string) =>
      `Describe the market segmentation for the "${topic}" market. Cover segmentation by type/product, application, end-user, and region. Mention which segments dominate and why. Format with HTML tags.`,
    maxTokens: 400,
  },
  {
    key: "regionalAnalysis",
    title: "Regional Analysis",
    prompt: (topic: string) =>
      `Analyze the "${topic}" market by region. Cover North America, Europe, Asia Pacific, Latin America, and Middle East & Africa. Mention which region dominates and which is growing fastest, with brief reasons. Format with HTML tags.`,
    maxTokens: 400,
  },
  {
    key: "keyPlayers",
    title: "Competitive Landscape & Key Players",
    prompt: (topic: string) =>
      `List 10-15 key companies/players in the "${topic}" market globally. Briefly mention 2-3 notable recent developments or strategies. Format as HTML with a bullet list for companies and a paragraph for developments.`,
    maxTokens: 350,
  },
  {
    key: "opportunities",
    title: "Key Opportunities",
    prompt: (topic: string) =>
      `List 4-5 key business opportunities in the "${topic}" market. Each should have a title and 1-2 sentence explanation. Format as an HTML bullet list (<ul><li><strong>Opportunity:</strong> explanation</li></ul>).`,
    maxTokens: 300,
  },
  {
    key: "challenges",
    title: "Challenges & Restraints",
    prompt: (topic: string) =>
      `List 4-5 major challenges or restraints facing the "${topic}" market. Each should have a brief explanation. Format as an HTML bullet list.`,
    maxTokens: 300,
  },
  {
    key: "swotAnalysis",
    title: "SWOT Analysis",
    prompt: (topic: string) =>
      `Provide a SWOT analysis for the "${topic}" market with 3 points each for Strengths, Weaknesses, Opportunities, and Threats. Format with HTML using <strong> for each category header and <ul><li> for points.`,
    maxTokens: 450,
  },
]

const SUMMARY_ONLY_SECTION = {
  key: "summary",
  title: "Report Summary",
  prompt: (topic: string) =>
    `Write a comprehensive summary (200-300 words) for a market research report on "${topic}". Include: market definition, current market size estimates, growth projections (CAGR), key drivers, major segments, dominant regions, and top players. Use professional market research language. Format with HTML tags (<p>, <strong>, <ul>, <li>).`,
  maxTokens: 600,
}

const CHART_DATA_PROMPT = (topic: string) =>
  `You are a market research data analyst. Generate realistic market data for the "${topic}" market as a JSON object. No markdown, no explanation — output ONLY valid JSON with this exact structure:
{
  "marketSize": [
    {"year": "2020", "value": <number in USD billions>},
    {"year": "2022", "value": <number>},
    {"year": "2024", "value": <number>},
    {"year": "2026", "value": <number>},
    {"year": "2028", "value": <number>},
    {"year": "2030", "value": <number>}
  ],
  "cagr": <number, e.g. 8.5>,
  "currency": "USD Billion",
  "segmentation": [
    {"name": "<segment 1>", "value": <percentage number>},
    {"name": "<segment 2>", "value": <percentage number>},
    {"name": "<segment 3>", "value": <percentage number>},
    {"name": "<segment 4>", "value": <percentage number>}
  ],
  "regional": [
    {"name": "North America", "value": <percentage number>},
    {"name": "Europe", "value": <percentage number>},
    {"name": "Asia Pacific", "value": <percentage number>},
    {"name": "Latin America", "value": <percentage number>},
    {"name": "MEA", "value": <percentage number>}
  ],
  "drivers": [
    {"name": "<driver 1 short label>", "impact": <number 60-95>},
    {"name": "<driver 2 short label>", "impact": <number 60-95>},
    {"name": "<driver 3 short label>", "impact": <number 60-95>},
    {"name": "<driver 4 short label>", "impact": <number 60-95>}
  ],
  "restraints": [
    {"name": "<restraint 1 short label>", "impact": <number 40-80>},
    {"name": "<restraint 2 short label>", "impact": <number 40-80>},
    {"name": "<restraint 3 short label>", "impact": <number 40-80>}
  ]
}
Segmentation percentages must sum to 100. Regional percentages must sum to 100. Use realistic estimates. Output ONLY the JSON.`

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  })

  const data = await res.json()

  if (data.error) {
    console.error("OpenAI API error:", data.error)
    throw new Error(data.error.message || "OpenAI API error")
  }

  return data.choices?.[0]?.message?.content || "<p>Unable to generate content.</p>"
}

function parseChartData(raw: string): ChartData | null {
  try {
    const jsonStr = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim()
    const data = JSON.parse(jsonStr)

    return {
      marketSize: (data.marketSize || []).map((p: { year: string; value: number }) => ({
        year: p.year,
        value: Number(p.value),
      })),
      cagr: Number(data.cagr) || 0,
      currency: data.currency || "USD Billion",
      segmentation: (data.segmentation || []).map((s: { name: string; value: number }, i: number) => ({
        name: s.name,
        value: Number(s.value),
        fill: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      })),
      regional: (data.regional || []).map((r: { name: string; value: number }, i: number) => ({
        name: r.name,
        value: Number(r.value),
        fill: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      })),
      drivers: (data.drivers || []).map((d: { name: string; impact: number }) => ({
        name: d.name,
        impact: Number(d.impact),
      })),
      restraints: (data.restraints || []).map((r: { name: string; impact: number }) => ({
        name: r.name,
        impact: Number(r.impact),
      })),
    }
  } catch (err) {
    console.error("Failed to parse chart data:", err)
    return null
  }
}

const SYSTEM_PROMPT =
  "You are a senior market research analyst at Coherent Market Insights, a leading global market research firm. Provide detailed, data-driven, professional insights. Use realistic market size estimates. Format all responses with HTML tags for proper web rendering. Do not use markdown formatting."

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { topic, mode } = body as { topic: string; mode?: "full" | "summary" }

  if (!topic || topic.trim().length < 2) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      topic,
      sections: [
        {
          title: "AI Generation Unavailable",
          content:
            "<p>AI-generated content will be available once the OpenAI API key is configured in environment variables.</p>",
        },
      ],
      chartData: null,
      isAiGenerated: false,
    })
  }

  try {
    if (mode === "summary") {
      const content = await callOpenAI(
        apiKey,
        SYSTEM_PROMPT,
        SUMMARY_ONLY_SECTION.prompt(topic),
        SUMMARY_ONLY_SECTION.maxTokens
      )

      return NextResponse.json({
        topic,
        sections: [{ title: SUMMARY_ONLY_SECTION.title, content }],
        chartData: null,
        isAiGenerated: true,
      })
    }

    const [sections, chartRaw] = await Promise.all([
      Promise.all(
        WHITEPAPER_SECTIONS.map(async (section) => {
          try {
            const content = await callOpenAI(
              apiKey,
              SYSTEM_PROMPT,
              section.prompt(topic),
              section.maxTokens
            )
            return { title: section.title, content }
          } catch (err) {
            console.error(`Failed to generate section "${section.title}":`, err)
            return {
              title: section.title,
              content: `<p>Unable to generate this section. Please try again later.</p>`,
            }
          }
        })
      ),
      callOpenAI(
        apiKey,
        "You are a market data analyst. Output ONLY valid JSON. No explanation, no markdown fences.",
        CHART_DATA_PROMPT(topic),
        800
      ).catch((err) => {
        console.error("Chart data generation failed:", err)
        return null
      }),
    ])

    const chartData = chartRaw ? parseChartData(chartRaw) : null

    return NextResponse.json({
      topic,
      sections,
      chartData,
      isAiGenerated: true,
    } satisfies WhitepaperResponse)
  } catch (error) {
    console.error("Whitepaper generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate whitepaper" },
      { status: 500 }
    )
  }
}
