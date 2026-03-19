import { NextResponse } from "next/server"
import { setSession } from "@/lib/auth"
import { query } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Hash password with MD5 (matching PHP implementation)
    const hashedPassword = crypto.createHash("md5").update(password).digest("hex")

    // Try database query first
    const result = await query(
      'SELECT userid, "Name", email, "Role" FROM "SubScribc_Users_new" WHERE email = $1 AND upass = $2',
      [email, hashedPassword]
    )

    if (result.rows.length > 0) {
      const user = result.rows[0]
      await setSession({
        uid: user.userid,
        name: user.Name,
        email: user.email,
        urole: user.Role,
      })
      return NextResponse.json({ success: true })
    }

    // Fallback mock login for development (remove when DB is connected)
    if (!process.env.DATABASE_URL) {
      if (email === "demo@insightvault.com" && password === "demo123") {
        await setSession({
          uid: 1,
          name: "Demo User",
          email: "demo@insightvault.com",
          urole: "subscriber",
        })
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
