import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getAvailablePdfKeywords } from "@/lib/s3"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const catId = searchParams.get("catId")
  const limit = Math.min(Number(searchParams.get("limit") || 12), 50)

  try {
    // Get available PDF keywords from S3
    let pdfKeywords: string[] = []
    try {
      const pdfSet = await getAvailablePdfKeywords()
      pdfKeywords = Array.from(pdfSet)
    } catch {
      // If S3 fails, fall back to normal query
    }

    let trendingRows: unknown[] = []

    if (pdfKeywords.length > 0) {
      // Pick random PDF keywords and query DB for matching reports
      // Shuffle and take a batch to query
      const shuffled = pdfKeywords.sort(() => Math.random() - 0.5)
      const batch = shuffled.slice(0, 200) // take 200 random keywords to query

      // Build parameterized query
      const placeholders = batch.map((_, i) => `$${i + 1}`).join(",")
      let sql = `SELECT newsid, keyword, catid, forcastyear, createddate, reportstatus
        FROM cmi_reports
        WHERE isactive = 1 AND reportstatus = 1 AND keyword IN (${placeholders})`
      const params: unknown[] = [...batch]

      if (catId) {
        sql += ` AND catid = $${batch.length + 1}`
        params.push(Number(catId))
      }

      sql += ` ORDER BY RANDOM() LIMIT ${limit}`

      const trendingRes = await query(sql, params)
      trendingRows = trendingRes.rows
    } else {
      // Fallback: no S3 data, show latest published
      let sql = `SELECT newsid, keyword, catid, forcastyear, createddate, reportstatus
        FROM cmi_reports WHERE isactive = 1 AND reportstatus = 1`
      const params: unknown[] = []
      if (catId) {
        sql += ` AND catid = $1`
        params.push(Number(catId))
      }
      sql += ` ORDER BY createddate DESC LIMIT ${limit}`
      const res = await query(sql, params)
      trendingRows = res.rows
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
    return NextResponse.json({ trending: [], upcoming: [] })
  }
}
