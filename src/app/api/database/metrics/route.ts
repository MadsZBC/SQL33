import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { z } from 'zod'

const viewSchema = z.object({
  view: z.string().min(1)
})

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const viewName = searchParams.get('view')

    const result = viewSchema.safeParse({ view: viewName })
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid view parameter' },
        { status: 400 }
      )
    }

    // Sanitize the view name to prevent SQL injection
    const sanitizedView = result.data.view.replace(/[^a-zA-Z0-9_æøåÆØÅ]/g, '')
    
    const [rows] = await pool.query(`SELECT * FROM ${sanitizedView}`)

    return NextResponse.json({ result: rows })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics data' },
      { status: 500 }
    )
  }
} 