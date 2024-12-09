import { Metadata } from "next"
import HotelDatabaseSchema from "@/components/hotel-database-schema"
import ReturnButton from "@/components/return-button"

export const metadata: Metadata = {
  title: "Database Schema - Hotel Database System",
  description: "Database schema and generator for the hotel system",
}

export default function Schema() {
  return (
    <div className="container mx-auto py-8 px-8 relative">
      <ReturnButton />
      <HotelDatabaseSchema />
    </div>
  )
} 