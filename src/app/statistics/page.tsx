import { Metadata } from "next"
import StatisticsDashboard from "@/components/statistics-dashboard"
import ReturnButton from "@/components/return-button"

export const metadata: Metadata = {
  title: "Statistics - Hotel Database System",
  description: "Statistical analysis and trends for the hotel system",
}

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto py-8 px-8 relative">
        <ReturnButton />
        <h1 className="text-4xl font-bold mb-8 mt-16">Hotel Statistics</h1>
        <StatisticsDashboard />
      </div>
    </div>
  )
} 