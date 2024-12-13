import Link from "next/link";
import { 
  FileText, 
  Database, 
  CalendarDays, 
  LayoutDashboard,
  BarChart3,
  Hotel // Added for project overview
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="grid min-h-screen place-items-center p-8">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold">Hotel Database System</h1>
        <nav className="flex flex-wrap gap-4 justify-center">
          <Link href="/documentation">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Technical Documentation
            </Button>
          </Link>
          <Link href="/schema">
            <Button variant="outline" className="gap-2">
              <Database className="h-4 w-4" />
              Database Schema
            </Button>
          </Link>
          <Link href="/project-overview">
            <Button variant="outline" className="gap-2">
              <Hotel className="h-4 w-4" />
              Project Overview
            </Button>
          </Link>
          <Link href="/bookings">
            <Button variant="outline" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Bookinger
            </Button>
          </Link>
          <Link href="/diagrams">
            <Button variant="outline" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Database Diagrams
            </Button>
          </Link>
          <Link href="/statistics">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </Button>
          </Link>
        </nav>
      </main>
    </div>
  );
}
