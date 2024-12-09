"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface BookingTrend {
  booking_måned: string
  antal_bookinger: number
  samlet_omsætning: number
  gennemsnit_pris: number
  unikke_gæster: number
  online_bookinger: number
  gns_opholdslængde: number
}

interface SeasonalAnalysis {
  hotel_navn: string
  sæson: string
  antal_bookinger: number
  gns_pris: number
  total_omsætning: number
  sæson_fordeling_pct: number
}

interface CustomerSegment {
  kunde_segment: string
  antal_kunder: number
  antal_bookinger: number
  gns_ordreværdi: number
  total_omsætning: number
  booking_andel_pct: number
}

// Add these custom chart styles
const chartConfig = {
  grid: {
    strokeDasharray: "3 3",
    stroke: "rgba(255, 255, 255, 0.1)",
  },
  xAxis: {
    stroke: "rgba(255, 255, 255, 0.1)",
    tick: { fill: "#888", fontSize: 12 },
  },
  yAxis: {
    stroke: "rgba(255, 255, 255, 0.1)",
    tick: { fill: "#888", fontSize: 12 },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "#1a1a1a",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "6px",
    },
    labelStyle: { color: "#fff" },
  },
}

export default function StatisticsDashboard() {
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([])
  const [seasonalData, setSeasonalData] = useState<SeasonalAnalysis[]>([])
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsRes, seasonalRes, segmentsRes] = await Promise.all([
          fetch('/api/database?view=v_booking_trends'),
          fetch('/api/database?view=v_sæson_analyse'),
          fetch('/api/database?view=v_kunde_segmentering')
        ])

        const [trendsData, seasonalData, segmentsData] = await Promise.all([
          trendsRes.json(),
          seasonalRes.json(),
          segmentsRes.json()
        ])

        setBookingTrends(trendsData.result)
        setSeasonalData(seasonalData.result)
        setCustomerSegments(segmentsData.result)
      } catch (err) {
        setError('Failed to fetch statistics')
        console.error('Error fetching statistics:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <div>Loading statistics...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Tabs defaultValue="trends" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="trends">Booking Trends</TabsTrigger>
        <TabsTrigger value="seasonal">Seasonal Analysis</TabsTrigger>
        <TabsTrigger value="segments">Customer Segments</TabsTrigger>
      </TabsList>

      <TabsContent value="trends">
        <Card className="bg-[#121212] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">Booking Trends</CardTitle>
            <CardDescription className="text-gray-400">
              Monthly booking and revenue analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer>
                <LineChart 
                  data={bookingTrends} 
                  margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid {...chartConfig.grid} />
                  <XAxis 
                    dataKey="booking_måned" 
                    {...chartConfig.xAxis}
                  />
                  <YAxis 
                    yAxisId="left"
                    {...chartConfig.yAxis}
                    domain={[0, 'auto']}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    {...chartConfig.yAxis}
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                  />
                  <Tooltip {...chartConfig.tooltip} />
                  <Legend 
                    wrapperStyle={{ color: "#888" }}
                  />
                  <Line
                    yAxisId="left"
                    type="natural"
                    dataKey="antal_bookinger"
                    stroke="#8884d8"
                    name="Antal Bookinger"
                    dot={{ fill: "#8884d8", r: 4 }}
                    strokeWidth={2}
                    connectNulls
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="natural"
                    dataKey="samlet_omsætning"
                    stroke="#4ade80"
                    name="Omsætning (DKK)"
                    dot={{ fill: "#4ade80", r: 4 }}
                    strokeWidth={2}
                    connectNulls
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seasonal">
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Analysis</CardTitle>
            <CardDescription>Booking patterns across seasons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sæson" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="antal_bookinger" fill="#8884d8" name="Antal Bookinger" />
                  <Bar dataKey="total_omsætning" fill="#82ca9d" name="Total Omsætning" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="segments">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Analysis by customer type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegments}
                    dataKey="antal_bookinger"
                    nameKey="kunde_segment"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 