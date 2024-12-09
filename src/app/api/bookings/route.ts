import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export async function GET() {
  try {
    // Get all bookings with guest and hotel information
    const [bookings] = await pool.query(`
      SELECT 
        b.*,
        CONCAT(g.fornavn, ' ', g.efternavn) as gæst_navn,
        h.hotel_navn
      FROM bookinger b
      LEFT JOIN gæster g ON b.gæste_id = g.gæste_id
      LEFT JOIN hoteller h ON b.hotel_id = h.hotel_id
      ORDER BY b.booking_id DESC
    `)

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
} 