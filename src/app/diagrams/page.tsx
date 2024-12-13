import { Suspense } from "react"
import { Metadata } from "next"
import DatabaseDiagrams from "@/components/database-diagrams"
import { Skeleton } from "@/components/ui/skeleton"
import ReturnButton from "@/components/return-button"

export const metadata: Metadata = {
  title: "Database Diagrams - Hotel Database System",
  description: "ERD and other database diagrams for the hotel system",
}

export const dynamic = 'force-dynamic'
export const revalidate = 30 // revalidate every 30 seconds

export default function DiagramsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-16 relative">
        <ReturnButton />
      </div>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Database Diagrams</h1>
        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
          <DatabaseDiagrams />
        </Suspense>
      </div>
    </div>
  )
} 