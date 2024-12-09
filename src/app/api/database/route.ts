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
  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  if (view === 'v_bookinger') {
    try {
      const [bookings] = await pool.query(
        `SELECT * FROM v_bookinger ORDER BY booking_id DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      )

      const [totalResult] = await pool.query(
        'SELECT COUNT(*) as total FROM v_bookinger'
      )
      const total = totalResult[0].total

      return NextResponse.json({
        result: {
          bookings,
          total
        }
      })
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  }

  try {
    await pool.getConnection().then(conn => {
      console.log('Database connected successfully')
      conn.release()
    })

    const procedure = searchParams.get('procedure')

    if (procedure) {
      switch (procedure) {
        case 'sp_opret_booking':
          const gæsteId = searchParams.get('gæste_id')
          const hotelId = searchParams.get('hotel_id')
          const værelseId = searchParams.get('værelse_id')
          const checkIndDato = searchParams.get('check_ind_dato')
          const checkUdDato = searchParams.get('check_ud_dato')
          const onlineBooking = searchParams.get('online_booking') === 'true'
          const fdmMedlem = searchParams.get('fdm_medlem') === 'true'

          if (!gæsteId || !hotelId || !værelseId || !checkIndDato || !checkUdDato) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 })
          }

          const bookingQuery = `CALL sp_opret_booking(?, ?, ?, ?, ?, ?, ?)`
          const [bookingRows] = await pool.query(bookingQuery, [
            parseInt(gæsteId),
            parseInt(hotelId),
            parseInt(værelseId),
            checkIndDato,
            checkUdDato,
            onlineBooking,
            fdmMedlem
          ])
          return Response.json({ result: bookingRows[0] })

        case 'sp_find_ledige_værelser':
          const findHotelId = searchParams.get('hotel_id')
          const findCheckIndDato = searchParams.get('check_ind_dato')
          const findCheckUdDato = searchParams.get('check_ud_dato')

          if (!findHotelId || !findCheckIndDato || !findCheckUdDato) {
            return Response.json({ error: 'Missing required parameters for finding available rooms' }, { status: 400 })
          }

          const findQuery = `CALL sp_find_ledige_værelser(?, ?, ?)`
          const [findRows] = await pool.query(findQuery, [
            parseInt(findHotelId),
            findCheckIndDato,
            findCheckUdDato
          ])
          return Response.json({ result: findRows[0] })

        default:
          return Response.json({ error: 'Invalid procedure' }, { status: 400 })
      }
    }

    if (view) {
      let query = ''
      switch (view) {
        case 'v_gæster':
          query = 'SELECT * FROM v_gæster'
          break
        case 'v_hoteller':
          query = 'SELECT * FROM v_hoteller'
          break
        case 'v_værelser':
          query = 'SELECT * FROM v_værelser'
          break
        default:
          const hotelId = searchParams.get('hotel_id')
          const hotelFilter = hotelId ? `WHERE hotel_id = ${parseInt(hotelId)}` : ''
          query = `SELECT * FROM ${view} ${hotelFilter}`
      }

      const [rows] = await pool.query(query)
      return Response.json({ result: rows })
    }

    return Response.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Database connection error:', error)
    return Response.json(
      { 
        error: 'Database connection error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any).code
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { procedure, params } = body

    switch (procedure) {
      case 'sp_opdater_booking_status':
        await pool.query('CALL sp_opdater_booking_status(?, ?)', [
          params.booking_id,
          params.ny_status
        ])
        break

      case 'sp_rediger_booking':
        await pool.query('CALL sp_rediger_booking(?, ?, ?, ?, ?, ?, ?, ?)', [
          params.booking_id,
          params.gæste_id,
          params.hotel_id,
          params.værelse_id,
          params.check_ind_dato,
          params.check_ud_dato,
          params.online_booking,
          params.fdm_medlem
        ])
        break

      default:
        return NextResponse.json(
          { error: 'Unknown procedure' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
} 