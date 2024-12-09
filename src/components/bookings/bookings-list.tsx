"use client"

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CalendarIcon, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from "sonner"

const ITEMS_PER_PAGE = 10

type Booking = {
  booking_id: number
  gæste_id: number
  hotel_id: number
  værelse_id: number
  check_ind_dato: string
  check_ud_dato: string
  online_booking: number
  fdm_medlem: number
  booking_status: string
  total_pris: number
  gæst_navn?: string
  hotel_navn?: string
}

type Room = {
  værelse_id: number
  værelsestype: string
  pris: number
  hotel_id: number
}

function BookingCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  )
}

export default function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<Date>()
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalBookings, setTotalBookings] = useState(0)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings');
      const data = await response.json();
      const bookingsData = data.bookings || [];
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setTotalBookings(Array.isArray(bookingsData) ? bookingsData.length : 0);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      setTotalBookings(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procedure: 'sp_opdater_booking_status',
          params: {
            booking_id: bookingId,
            ny_status: newStatus
          }
        })
      })

      if (response.ok) {
        await fetchBookings()
        toast.success('Status blev opdateret')
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Der opstod en fejl ved opdatering af status')
    }
  }

  const handleEditBooking = async (booking: Booking) => {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procedure: 'sp_rediger_booking',
          params: {
            booking_id: booking.booking_id,
            værelse_id: booking.værelse_id,
            check_ind_dato: format(new Date(booking.check_ind_dato), 'yyyy-MM-dd'),
            check_ud_dato: format(new Date(booking.check_ud_dato), 'yyyy-MM-dd')
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update booking')
      }

      // Close dialog and refresh bookings
      setIsEditDialogOpen(false)
      await fetchBookings()
      toast.success('Booking blev opdateret')
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Der opstod en fejl ved opdatering af booking')
    }
  }

  const fetchAvailableRooms = async (hotelId: number, checkIn: string, checkOut: string) => {
    try {
      const response = await fetch(`/api/database?procedure=sp_find_ledige_værelser&hotel_id=${hotelId}&check_ind_dato=${checkIn}&check_ud_dato=${checkOut}`)
      const data = await response.json()
      return data.result || []
    } catch (error) {
      console.error('Error fetching rooms:', error)
      return []
    }
  }

  const handleEditDialogOpen = async (booking: Booking) => {
    setEditingBooking(booking)
    setIsEditDialogOpen(true)
    
    try {
      const checkInDate = format(new Date(booking.check_ind_dato), 'yyyy-MM-dd')
      const checkOutDate = format(new Date(booking.check_ud_dato), 'yyyy-MM-dd')
      
      const rooms = await fetchAvailableRooms(
        booking.hotel_id,
        checkInDate,
        checkOutDate
      )
      console.log('Available rooms:', rooms)
      setAvailableRooms(rooms)
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      setAvailableRooms([])
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.booking_id.toString().includes(searchTerm) ||
      (booking.gæst_navn?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (booking.hotel_navn?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter
    
    const matchesDate = !dateFilter || 
      (new Date(booking.check_ind_dato) <= dateFilter && new Date(booking.check_ud_dato) >= dateFilter)

    return matchesSearch && matchesStatus && matchesDate
  })

  const totalPages = Math.ceil(totalBookings / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="search">Søg</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Søg efter booking ID, gæst eller hotel..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="w-[200px]">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Vælg status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="Bekræftet">Bekræftet</SelectItem>
              <SelectItem value="Afventende">Afventende</SelectItem>
              <SelectItem value="Annulleret">Annulleret</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[200px]">
          <Label>Dato</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, 'PPP') : 'Vælg dato'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button 
          variant="outline" 
          className="px-3" 
          onClick={() => {
            setSearchTerm('')
            setStatusFilter('all')
            setDateFilter(undefined)
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Nulstil filtre
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </>
        ) : (
          filteredBookings.map((booking) => (
            <Card
              key={booking.booking_id}
              className="p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      Booking #{booking.booking_id}
                    </h3>
                    <Badge variant={
                      booking.booking_status === 'Bekræftet' ? 'default' :
                      booking.booking_status === 'Afventende' ? 'secondary' :
                      'destructive'
                    }>
                      {booking.booking_status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {booking.gæst_navn}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={booking.booking_status}
                    onValueChange={(value) => handleStatusChange(booking.booking_id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bekræftet">Bekræftet</SelectItem>
                      <SelectItem value="Afventende">Afventende</SelectItem>
                      <SelectItem value="Annulleret">Annulleret</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => handleEditDialogOpen(booking)}
                      >
                        Rediger
                      </Button>
                    </DialogTrigger>
                    {editingBooking && (
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Rediger Booking #{editingBooking.booking_id}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Check-ind Dato</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(new Date(editingBooking.check_ind_dato), 'PPP')}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={new Date(editingBooking.check_ind_dato)}
                                    onSelect={(date) => setEditingBooking(prev => ({
                                      ...prev!,
                                      check_ind_dato: date?.toISOString() || prev!.check_ind_dato
                                    }))}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="space-y-2">
                              <Label>Check-ud Dato</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(new Date(editingBooking.check_ud_dato), 'PPP')}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={new Date(editingBooking.check_ud_dato)}
                                    onSelect={(date) => setEditingBooking(prev => ({
                                      ...prev!,
                                      check_ud_dato: date?.toISOString() || prev!.check_ud_dato
                                    }))}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <Label>Vælg værelse</Label>
                            <Select
                              defaultValue={editingBooking.værelse_id.toString()}
                              onValueChange={(value) => {
                                console.log('Selected room:', value)
                                setEditingBooking(prev => prev ? {
                                  ...prev,
                                  værelse_id: parseInt(value)
                                } : null)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Vælg et værelse" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem 
                                  key={editingBooking.værelse_id} 
                                  value={editingBooking.værelse_id.toString()}
                                >
                                  Nuværende værelse ({editingBooking.værelse_id})
                                </SelectItem>
                                
                                {availableRooms.map((room) => (
                                  <SelectItem 
                                    key={room.værelse_id} 
                                    value={room.værelse_id.toString()}
                                  >
                                    Værelse {room.værelse_id} - {room.værelsestype} - {room.pris} kr.
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex justify-end gap-4 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditDialogOpen(false)
                                setEditingBooking(null)
                              }}
                            >
                              Annuller
                            </Button>
                            <Button
                              onClick={() => handleEditBooking(editingBooking)}
                            >
                              Gem ændringer
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Hotel</p>
                  <p>{booking.hotel_navn} - Værelse {booking.værelse_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Datoer</p>
                  <p>Check-ind: {format(new Date(booking.check_ind_dato), 'PPP')}</p>
                  <p>Check-ud: {format(new Date(booking.check_ud_dato), 'PPP')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Booking detaljer</p>
                  <p>Online booking: {booking.online_booking ? 'Ja' : 'Nej'}</p>
                  <p>FDM medlem: {booking.fdm_medlem ? 'Ja' : 'Nej'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Pris</p>
                  <p className="text-lg font-semibold">{booking.total_pris} kr.</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Viser {((currentPage - 1) * ITEMS_PER_PAGE) + 1} til {Math.min(currentPage * ITEMS_PER_PAGE, totalBookings)} af {totalBookings} bookinger
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 