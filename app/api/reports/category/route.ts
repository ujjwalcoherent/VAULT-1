import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { readdirSync } from "fs"
import { join } from "path"

/** Get keywords of locally available PDFs */
function getLocalPdfKeywords(): string[] {
  try {
    const dir = join(process.cwd(), "public", "pdffiles")
    const files = readdirSync(dir)
    return files
      .filter((f) => f.endsWith(".pdf"))
      .map((f) => f.replace(".pdf", ""))
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const catId = searchParams.get("catId")
  const limit = Math.min(Number(searchParams.get("limit") || 12), 50)

  try {
    const pdfKeywords = getLocalPdfKeywords()

    let trendingRows: unknown[] = []

    if (pdfKeywords.length > 0) {
      // Only show reports that have local PDFs available
      const placeholders = pdfKeywords.map((_, i) => `$${i + 1}`).join(",")
      let sql = `SELECT newsid, keyword, catid, forcastyear, createddate, reportstatus
        FROM cmi_reports
        WHERE isactive = 1 AND reportstatus = 1 AND keyword IN (${placeholders})`
      const params: unknown[] = [...pdfKeywords]

      if (catId) {
        sql += ` AND catid = $${pdfKeywords.length + 1}`
        params.push(Number(catId))
      }

      sql += ` ORDER BY RANDOM() LIMIT ${limit}`

      const trendingRes = await query(sql, params)
      trendingRows = trendingRes.rows
    }

    // Upcoming = reportstatus 0
    let upcomingSql = `SELECT newsid, keyword, catid, forcastyear, createddate, reportstatus
      FROM cmi_reports WHERE isactive = 1 AND reportstatus = 0`
    const upcomingParams: unknown[] = []
    if (catId) {
      upcomingSql += ` AND catid = $1`
      upcomingParams.push(Number(catId))
    }
    upcomingSql += ` ORDER BY createddate DESC LIMIT ${limit}`

    const upcomingRes = await query(upcomingSql, upcomingParams)

    // To Be Published = upcoming reports with different random selection (10 reports)
    let toBePublishedSql = `SELECT newsid, keyword, catid, forcastyear, createddate, reportstatus
      FROM cmi_reports WHERE isactive = 1 AND reportstatus = 0`
    const toBePublishedParams: unknown[] = []
    if (catId) {
      toBePublishedSql += ` AND catid = $1`
      toBePublishedParams.push(Number(catId))
    }
    toBePublishedSql += ` ORDER BY RANDOM() LIMIT 10`

    const toBePublishedRes = await query(toBePublishedSql, toBePublishedParams)

    return NextResponse.json({
      trending: trendingRows,
      upcoming: upcomingRes.rows,
      toBePublished: toBePublishedRes.rows,
    })
  } catch (error) {
    console.error("Category reports error:", error)
    return NextResponse.json({ trending: [], upcoming: [], toBePublished: [] })
  }
}
