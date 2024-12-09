"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ReturnButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      className="absolute top-8 left-8 p-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-5 w-5 mr-2" />
      Return
    </Button>
  )
} 