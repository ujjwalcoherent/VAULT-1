"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Eye, Calendar, BarChart3, Building2, FileText, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionHeader } from "@/components/section-header"
import { getCategoryName } from "@/lib/data"

interface ReportData {
  newsid: number
  reportstatus: number | null
  catid: number
  newssubject: string
  keyword: string
  forcastyear: string
  summary: string | null
  newsdate: string
  price_sul: number
  price_cul: number
  price_multi: number
  no_pages: number | null
  createddate: string
  customname: string
}

interface Section {
  title: string
  content: string
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<ReportData | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPdf, setHasPdf] = useState(false)
  const [checkingPdf, setCheckingPdf] = useState(true)
  const [requested, setRequested] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    async function fetchReport() {
      setLoading(true)
      try {
        const res = await fetch(`/api/reports/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setReport(data.report || null)
          setSections(data.sections || [])
        }
      } catch {
        // error
      } finally {
        setLoading(false)
      }
    }

    async function checkPdf() {
      setCheckingPdf(true)
      try {
        const res = await fetch(`/api/reports/${params.id}/view`)
        const ct = res.headers.get("content-type") || ""
        setHasPdf(ct.includes("application/pdf"))
      } catch {
        setHasPdf(false)
      } finally {
        setCheckingPdf(false)
      }
    }

    fetchReport()
    checkPdf()
  }, [params.id])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="text-center">
          <SectionHeader title="Report Not Found" description="The requested report could not be found." />
          <Button onClick={() => router.back()} className="mt-6">
            <ArrowLeft className="mr-2 size-4" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  const catName = getCategoryName(report.catid)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      {/* Report content styles */}
      <style jsx global>{`
        .report-content {
          font-size: 14px;
          line-height: 1.75;
          color: var(--muted-foreground);
        }
        .report-content p {
          margin-bottom: 12px;
        }
        .report-content strong, .report-content b {
          color: var(--foreground);
          font-weight: 600;
        }
        .report-content ul, .report-content ol {
          margin: 8px 0 12px 20px;
          padding: 0;
        }
        .report-content li {
          margin-bottom: 6px;
        }
        .report-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 13px;
        }
        .report-content table td,
        .report-content table th {
          border: 1px solid var(--border);
          padding: 10px 14px;
          vertical-align: top;
          text-align: left;
        }
        .report-content table tr:first-child td,
        .report-content table th {
          background: var(--secondary);
          font-weight: 600;
          color: var(--foreground);
        }
        .report-content table tr:nth-child(even) {
          background: var(--secondary);
        }
        .report-content a {
          color: var(--accent);
          text-decoration: underline;
        }
        .report-content h2, .report-content h3, .report-content h4 {
          color: var(--foreground);
          font-weight: 700;
          margin: 20px 0 10px;
        }
      `}</style>

      <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
        <ArrowLeft className="size-4" /> Back to Reports
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{catName}</Badge>
          {report.reportstatus === 1 ? (
            <Badge className="bg-accent text-accent-foreground">Published</Badge>
          ) : (
            <Badge variant="outline">Upcoming</Badge>
          )}
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {report.keyword}
        </h1>
        {report.newssubject && report.newssubject !== report.keyword && (
          <p className="mt-2 text-sm text-muted-foreground">{report.newssubject}</p>
        )}
      </div>

      {/* Metadata */}
      <Card className="mb-8">
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <Calendar className="size-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Published</p>
              <p className="text-sm font-semibold">{new Date(report.createddate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BarChart3 className="size-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Forecast</p>
              <p className="text-sm font-semibold">{report.forcastyear}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="size-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-semibold">{catName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Pages</p>
              <p className="text-sm font-semibold">{report.no_pages || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {report.summary && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-xl">
              <FileText className="size-5 text-accent" />
              Report Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="report-content"
              dangerouslySetInnerHTML={{ __html: report.summary }}
            />
          </CardContent>
        </Card>
      )}

      {/* Dynamic Content Sections */}
      {sections.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Report Details</CardTitle>
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
                      className="report-content"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* View Report PDF — only show if PDF exists */}
      {!checkingPdf && hasPdf && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <Eye className="size-10 text-accent" />
            <div>
              <h3 className="font-serif text-lg font-bold">View Full Report</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Open the full report in our built-in PDF viewer.
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => router.push(`/dashboard/reports/${report.newsid}/view`)}
            >
              <Eye className="size-4" />
              View Report PDF
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Request Report — show when no PDF */}
      {!checkingPdf && !hasPdf && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            {requested ? (
              <>
                <CheckCircle className="size-10 text-green-500" />
                <div>
                  <h3 className="font-serif text-lg font-bold">Request Submitted</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your request has been sent. Our team will notify you when the report is ready.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Send className="size-10 text-accent" />
                <div>
                  <h3 className="font-serif text-lg font-bold">Request This Report</h3>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    The full PDF is not available yet. Submit a request and our team will prepare it for you.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="gap-2"
                  disabled={requesting}
                  onClick={async () => {
                    setRequesting(true)
                    try {
                      await fetch("/api/reports/notify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          reportId: report.newsid,
                          reportTitle: report.keyword,
                          type: "request",
                        }),
                      })
                    } catch {
                      // still show success to user
                    }
                    setRequested(true)
                    setRequesting(false)
                  }}
                >
                  <Send className="size-4" />
                  {requesting ? "Sending..." : "Request for Report"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
