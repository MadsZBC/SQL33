import { Suspense } from 'react'
import BookingsList from '@/components/bookings/bookings-list'
import { Skeleton } from '@/components/ui/skeleton'

export default function BookingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Booking Oversigt</h1>
      <Suspense fallback={<BookingsListSkeleton />}>
        <BookingsList />
      </Suspense>
    </div>
  )
}

function BookingsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
} 