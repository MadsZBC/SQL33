import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Create a connection pool using your environment variable names
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');

    if (!view) {
      return NextResponse.json(
        { error: 'View parameter is required' },
        { status: 400 }
      );
    }

    // Sanitize the view name to prevent SQL injection
    const sanitizedView = view.replace(/[^a-zA-Z0-9_æøåÆØÅ]/g, '');
    
    const [rows] = await pool.query(`SELECT * FROM ${sanitizedView}`);

    return NextResponse.json({ result: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { procedure, params } = body

    switch (procedure) {
      case 'sp_rediger_booking': {
        const {
          booking_id,
          værelse_id,
          check_ind_dato,
          check_ud_dato
        } = params

        if (!booking_id || !værelse_id || !check_ind_dato || !check_ud_dato) {
          return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          )
        }

        // First check if the room is available
        const [conflicts] = await pool.query(`
          SELECT COUNT(*) as count
          FROM bookinger
          WHERE værelse_id = ?
          AND booking_id != ?
          AND booking_status != 'Annulleret'
          AND (
            (check_ind_dato <= ? AND check_ud_dato >= ?)
            OR (check_ind_dato <= ? AND check_ud_dato >= ?)
            OR (check_ind_dato >= ? AND check_ud_dato <= ?)
          )
        `, [
          værelse_id,
          booking_id,
          check_ud_dato, check_ind_dato,
          check_ind_dato, check_ind_dato,
          check_ind_dato, check_ud_dato
        ])

        // @ts-expect-error - conflicts[0] type is not properly inferred
        if (conflicts[0].count > 0) {
          return NextResponse.json(
            { error: 'Værelset er ikke ledigt i den valgte periode' },
            { status: 400 }
          )
        }

        // Update the booking
        await pool.query(`
          UPDATE bookinger 
          SET 
            værelse_id = ?,
            check_ind_dato = ?,
            check_ud_dato = ?
          WHERE booking_id = ?
        `, [værelse_id, check_ind_dato, check_ud_dato, booking_id])

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown procedure' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
} 