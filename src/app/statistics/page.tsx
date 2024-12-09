import { Suspense } from "react"
import { Metadata } from "next"
import StatisticsDashboard from "@/components/statistics-dashboard"
import ReturnButton from "@/components/return-button"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Statistics - Hotel Database System",
  description: "Statistical analysis and trends for the hotel system",
}

function StatisticsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto py-8 px-8 relative">
        <ReturnButton />
        <h1 className="text-4xl font-bold mb-8 mt-16">Hotel Statistics</h1>
        <Suspense fallback={<StatisticsLoading />}>
          <StatisticsDashboard />
        </Suspense>
      </div>
    </div>
  )
} 