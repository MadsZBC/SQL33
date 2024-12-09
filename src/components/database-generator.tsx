"use client"

import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarData {
  guests: Guest[];
  hotels: Hotel[];
  rooms: Room[];
}

interface Guest {
  gæste_id: number;
  fornavn: string;
  efternavn: string;
}

interface Hotel {
  hotel_id: number;
  hotel_navn: string;
}

interface Room {
  værelse_id: number;
  hotel_id: number;
}

const procedures = {
  sp_opret_booking: 'Opret Booking',
  sp_opdater_booking_status: 'Opdater Booking Status',
  sp_find_ledige_værelser: 'Find Ledige Værelser',
  sp_rediger_booking: 'Rediger Booking'
} as const

export default function DatabaseGenerator() {
  const [activeTab, setActiveTab] = useState('procedures')
  const [selectedView, setSelectedView] = useState('v_hotel_månedlig_omsætning')
  const [selectedProcedure, setSelectedProcedure] = useState('sp_opret_booking')
  const [viewParams, setViewParams] = useState({
    hotel_id: '',
    start_dato: new Date(),
    slut_dato: new Date()
  })
  const [bookingData, setBookingData] = useState({
    gæste_id: '',
    hotel_id: '',
    værelse_id: '',
    check_ind_dato: new Date(),
    check_ud_dato: new Date(),
    online_booking: false,
    fdm_medlem: false
  })
  const [updateData, setUpdateData] = useState({
    booking_id: '',
    ny_status: 'Bekræftet'
  })
  const [sqlCommand, setSqlCommand] = useState('')
  const [result, setResult] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarData, setSidebarData] = useState<SidebarData>({
    guests: [],
    hotels: [],
    rooms: []
  });
  const [editBookingData, setEditBookingData] = useState({
    booking_id: '',
    gæste_id: '',
    hotel_id: '',
    værelse_id: '',
    check_ind_dato: new Date(),
    check_ud_dato: new Date(),
    online_booking: false,
    fdm_medlem: false
  })

  const handleInputChange = (field: string, value: string | boolean | Date) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdateChange = (field: string, value: string | boolean | Date) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleViewParamChange = (field: string, value: string | boolean | Date) => {
    setViewParams(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateSQL = () => {
    if (activeTab === 'procedures') {
      let sql = ''
      if (selectedProcedure === 'sp_opret_booking') {
        sql = `
CALL sp_opret_booking(
  ${parseInt(bookingData.gæste_id) || 0},
  ${parseInt(bookingData.hotel_id) || 0},
  ${parseInt(bookingData.værelse_id) || 0},
  '${format(bookingData.check_ind_dato, 'yyyy-MM-dd')}',
  '${format(bookingData.check_ud_dato, 'yyyy-MM-dd')}',
  ${bookingData.online_booking ? 1 : 0},
  ${bookingData.fdm_medlem ? 1 : 0}
);`
      } else if (selectedProcedure === 'sp_opdater_booking_status') {
        sql = `
CALL sp_opdater_booking_status(
  ${parseInt(updateData.booking_id) || 0},
  '${updateData.ny_status}'
);`
      } else if (selectedProcedure === 'sp_find_ledige_værelser') {
        sql = `
CALL sp_find_ledige_værelser(
  ${parseInt(viewParams.hotel_id) || 0},
  '${format(viewParams.start_dato, 'yyyy-MM-dd')}',
  '${format(viewParams.slut_dato, 'yyyy-MM-dd')}'
);`
      } else if (selectedProcedure === 'sp_rediger_booking') {
        sql = `
CALL sp_rediger_booking(
  ${parseInt(editBookingData.booking_id) || 0},
  ${parseInt(editBookingData.gæste_id) || 0},
  ${parseInt(editBookingData.hotel_id) || 0},
  ${parseInt(editBookingData.værelse_id) || 0},
  '${format(editBookingData.check_ind_dato, 'yyyy-MM-dd')}',
  '${format(editBookingData.check_ud_dato, 'yyyy-MM-dd')}',
  ${editBookingData.online_booking ? 1 : 0},
  ${editBookingData.fdm_medlem ? 1 : 0}
);`
      }
      setSqlCommand(sql)
    } else if (activeTab === 'views') {
      let sql = ''
      const hotelFilter = viewParams.hotel_id ? 
        `WHERE hotel_id = ${parseInt(viewParams.hotel_id)}` : ''
      
      switch (selectedView) {
        case 'v_hotel_månedlig_omsætning':
          sql = `SELECT * FROM v_hotel_månedlig_omsætning ${hotelFilter};`
          break
        case 'v_populære_værelser':
          sql = `SELECT * FROM v_populære_værelser ${hotelFilter};`
          break
        case 'v_cykel_statistik':
          sql = `SELECT * FROM v_cykel_statistik;`
          break
        case 'v_konference_oversigt':
          sql = `SELECT * FROM v_konference_oversigt ${hotelFilter};`
          break
        case 'v_hotel_personale_oversigt':
          sql = `SELECT * FROM v_hotel_personale_oversigt ${hotelFilter};`
          break
      }
      setSqlCommand(sql)
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = '/api/database'
      
      if (activeTab === 'procedures') {
        const params = new URLSearchParams()
        params.append('procedure', selectedProcedure)
        
        switch (selectedProcedure) {
          case 'sp_opret_booking':
            params.append('gæste_id', bookingData.gæste_id)
            params.append('hotel_id', bookingData.hotel_id)
            params.append('værelse_id', bookingData.værelse_id)
            params.append('check_ind_dato', format(bookingData.check_ind_dato, 'yyyy-MM-dd'))
            params.append('check_ud_dato', format(bookingData.check_ud_dato, 'yyyy-MM-dd'))
            params.append('online_booking', bookingData.online_booking.toString())
            params.append('fdm_medlem', bookingData.fdm_medlem.toString())
            break
            
          case 'sp_find_ledige_værelser':
            params.append('hotel_id', viewParams.hotel_id)
            params.append('check_ind_dato', format(viewParams.start_dato, 'yyyy-MM-dd'))
            params.append('check_ud_dato', format(viewParams.slut_dato, 'yyyy-MM-dd'))
            break
        }
        
        url = `${url}?${params.toString()}`
      } else {
        url = `/api/database?view=${selectedView}`
        if (viewParams.hotel_id) {
          url += `&hotel_id=${viewParams.hotel_id}`
        }
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data')
      }

      if (data.result) {
        setResult(Array.isArray(data.result) ? data.result : [data.result])
      } else {
        setResult([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSidebarData = async () => {
    try {
      const [guestsRes, hotelsRes, roomsRes] = await Promise.all([
        fetch('/api/database?view=v_gæster'),
        fetch('/api/database?view=v_hoteller'),
        fetch('/api/database?view=v_værelser')
      ]);
      
      const guests = await guestsRes.json();
      const hotels = await hotelsRes.json();
      const rooms = await roomsRes.json();
      
      setSidebarData({
        guests: guests.result || [],
        hotels: hotels.result || [],
        rooms: rooms.result || []
      });
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    }
  };

  useEffect(() => {
    fetchSidebarData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6">
        <div className="flex gap-4">
          <div className="w-72">
            <h3 className="font-medium mb-4">Reference IDs</h3>
            <Tabs defaultValue="guests" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="guests">Gæster</TabsTrigger>
                <TabsTrigger value="hotels">Hoteller</TabsTrigger>
                <TabsTrigger value="rooms">Værelser</TabsTrigger>
              </TabsList>

              <TabsContent value="guests" className="max-h-[600px] overflow-y-auto pr-2">
                <div className="space-y-2">
                  {sidebarData.guests.slice(0, 10).map((guest: Guest) => (
                    <div 
                      key={`guest-${guest.gæste_id}`} 
                      className="flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm">
                          <span className="text-blue-500">ID: {guest.gæste_id}</span>
                        </div>
                        <div className="text-sm text-gray-200">
                          {`${guest.fornavn} ${guest.efternavn}`}
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-green-500">Aktiv</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Gæst Status: Aktiv</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hotels" className="max-h-[600px] overflow-y-auto pr-2">
                <div className="space-y-2">
                  {sidebarData.hotels.slice(0, 10).map((hotel: Hotel) => (
                    <div 
                      key={`hotel-${hotel.hotel_id}`} 
                      className="flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm">
                          <span className="text-blue-500">ID: {hotel.hotel_id}</span>
                        </div>
                        <div className="text-sm text-gray-200">
                          {hotel.hotel_navn}
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-gray-500">S</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Hotel Status: Standard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="max-h-[600px] overflow-y-auto pr-2">
                <div className="space-y-2">
                  {sidebarData.rooms.slice(0, 10).map((room: Room) => (
                    <div 
                      key={`room-${room.hotel_id}-${room.værelse_id}`} 
                      className="flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm">
                          <span className="text-blue-500">ID: {room.værelse_id}</span>
                        </div>
                        <div className="text-sm text-gray-200">
                          {`Hotel ID: ${room.hotel_id}`}
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-blue-500">D</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Værelse Type: Dobbelt</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex-1">
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="procedures">Procedures</TabsTrigger>
                  <TabsTrigger value="views">Views</TabsTrigger>
                </TabsList>

                <TabsContent value="procedures">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Procedure</Label>
                      <Select 
                        value={selectedProcedure} 
                        onValueChange={setSelectedProcedure}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vælg procedure" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(procedures).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedProcedure === 'sp_opret_booking' && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="gæste_id">Gæste ID</Label>
                          <Input 
                            id="gæste_id"
                            value={bookingData.gæste_id}
                            onChange={(e) => handleInputChange('gæste_id', e.target.value)}
                            placeholder="1"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="hotel_id">Hotel ID</Label>
                          <Input 
                            id="hotel_id"
                            value={bookingData.hotel_id}
                            onChange={(e) => handleInputChange('hotel_id', e.target.value)}
                            placeholder="2"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="værelse_id">Værelse ID</Label>
                          <Input 
                            id="værelse_id"
                            value={bookingData.værelse_id}
                            onChange={(e) => handleInputChange('værelse_id', e.target.value)}
                            placeholder="101"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Check-ind Dato</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(bookingData.check_ind_dato, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={bookingData.check_ind_dato}
                                onSelect={(date) => handleInputChange('check_ind_dato', date || new Date())}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grid gap-2">
                          <Label>Check-ud Dato</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(bookingData.check_ud_dato, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={bookingData.check_ud_dato}
                                onSelect={(date) => handleInputChange('check_ud_dato', date || new Date())}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grid gap-2">
                          <Label>Online Booking</Label>
                          <Select 
                            value={bookingData.online_booking.toString()} 
                            onValueChange={(value) => handleInputChange('online_booking', value === 'true')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Vælg ja/nej" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Ja</SelectItem>
                              <SelectItem value="false">Nej</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>FDM Medlem</Label>
                          <Select 
                            value={bookingData.fdm_medlem.toString()}
                            onValueChange={(value) => handleInputChange('fdm_medlem', value === 'true')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Vælg ja/nej" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Ja</SelectItem>
                              <SelectItem value="false">Nej</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {selectedProcedure === 'sp_opdater_booking_status' && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="booking_id">Booking ID</Label>
                          <Input 
                            id="booking_id"
                            value={updateData.booking_id}
                            onChange={(e) => handleUpdateChange('booking_id', e.target.value)}
                            placeholder="1"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Ny Status</Label>
                          <Select 
                            value={updateData.ny_status}
                            onValueChange={(value) => handleUpdateChange('ny_status', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Vælg status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Bekræftet">Bekræftet</SelectItem>
                              <SelectItem value="Afventende">Afventende</SelectItem>
                              <SelectItem value="Annulleret">Annulleret</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {selectedProcedure === 'sp_find_ledige_værelser' && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="hotel_id">Hotel ID</Label>
                          <Input 
                            id="hotel_id"
                            value={viewParams.hotel_id}
                            onChange={(e) => handleViewParamChange('hotel_id', e.target.value)}
                            placeholder="1"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Start Dato</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(viewParams.start_dato, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={viewParams.start_dato}
                                onSelect={(date) => handleViewParamChange('start_dato', date || new Date())}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grid gap-2">
                          <Label>Slut Dato</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(viewParams.slut_dato, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={viewParams.slut_dato}
                                onSelect={(date) => handleViewParamChange('slut_dato', date || new Date())}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </>
                    )}

                    {selectedProcedure === 'sp_rediger_booking' && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="booking_id">Booking ID</Label>
                          <div className="flex gap-2">
                            <Input 
                              id="booking_id"
                              value={editBookingData.booking_id}
                              onChange={(e) => setEditBookingData(prev => ({
                                ...prev,
                                booking_id: e.target.value
                              }))}
                              placeholder="1"
                            />
                            <Button 
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/database?view=v_bookinger&booking_id=${editBookingData.booking_id}`);
                                  const data = await response.json();
                                  if (data.result?.[0]) {
                                    const booking = data.result[0];
                                    setEditBookingData({
                                      ...editBookingData,
                                      gæste_id: booking.gæste_id.toString(),
                                      hotel_id: booking.hotel_id.toString(),
                                      værelse_id: booking.værelse_id.toString(),
                                      check_ind_dato: new Date(booking.check_ind_dato),
                                      check_ud_dato: new Date(booking.check_ud_dato),
                                      online_booking: booking.online_booking === 1,
                                      fdm_medlem: booking.fdm_medlem === 1
                                    });
                                  }
                                } catch (error) {
                                  console.error('Error fetching booking:', error);
                                }
                              }}
                            >
                              Hent Booking
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="gæste_id">Gæste ID</Label>
                          <Input 
                            id="gæste_id"
                            value={editBookingData.gæste_id}
                            onChange={(e) => setEditBookingData(prev => ({
                              ...prev,
                              gæste_id: e.target.value
                            }))}
                            placeholder="1"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="hotel_id">Hotel ID</Label>
                          <Input 
                            id="hotel_id"
                            value={editBookingData.hotel_id}
                            onChange={(e) => setEditBookingData(prev => ({
                              ...prev,
                              hotel_id: e.target.value
                            }))}
                            placeholder="1"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="værelse_id">Værelse ID</Label>
                          <Input 
                            id="værelse_id"
                            value={editBookingData.værelse_id}
                            onChange={(e) => setEditBookingData(prev => ({
                              ...prev,
                              værelse_id: e.target.value
                            }))}
                            placeholder="101"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Check-ind Dato</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(editBookingData.check_ind_dato, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={editBookingData.check_ind_dato}
                                onSelect={(date) => setEditBookingData(prev => ({
                                  ...prev,
                                  check_ind_dato: date || new Date()
                                }))}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grid gap-2">
                          <Label>Check-ud Dato</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(editBookingData.check_ud_dato, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={editBookingData.check_ud_dato}
                                onSelect={(date) => setEditBookingData(prev => ({
                                  ...prev,
                                  check_ud_dato: date || new Date()
                                }))}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grid gap-2">
                          <Label>Online Booking</Label>
                          <Select 
                            value={editBookingData.online_booking.toString()}
                            onValueChange={(value) => setEditBookingData(prev => ({
                              ...prev,
                              online_booking: value === 'true'
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Vælg ja/nej" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Ja</SelectItem>
                              <SelectItem value="false">Nej</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>FDM Medlem</Label>
                          <Select 
                            value={editBookingData.fdm_medlem.toString()}
                            onValueChange={(value) => setEditBookingData(prev => ({
                              ...prev,
                              fdm_medlem: value === 'true'
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Vælg ja/nej" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Ja</SelectItem>
                              <SelectItem value="false">Nej</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* Add more input fields for other procedures here */}
                  </div>

                  {activeTab === 'procedures' && (
                    <div className="flex gap-2">
                      <Button onClick={generateSQL}>Generer SQL</Button>
                      <Button onClick={fetchData} disabled={isLoading}>
                        {isLoading ? 'Sender...' : 'Send'}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="views">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>View</Label>
                      <Select 
                        value={selectedView} 
                        onValueChange={setSelectedView}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vælg view" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="v_hotel_månedlig_omsætning">Hotel Månedlig Omsætning</SelectItem>
                          <SelectItem value="v_populære_værelser">Populære Værelser</SelectItem>
                          <SelectItem value="v_cykel_statistik">Cykel Statistik</SelectItem>
                          <SelectItem value="v_konference_oversigt">Konference Oversigt</SelectItem>
                          <SelectItem value="v_hotel_personale_oversigt">Hotel Personale Oversigt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hotel_id">Hotel ID (valgfrit)</Label>
                      <Input 
                        id="hotel_id"
                        value={viewParams.hotel_id}
                        onChange={(e) => handleViewParamChange('hotel_id', e.target.value)}
                        placeholder="1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={generateSQL}>Generer SQL</Button>
                      <Button onClick={fetchData} disabled={isLoading}>
                        {isLoading ? 'Sender...' : 'Send'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {sqlCommand && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold">SQL Kommando:</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    <code>{sqlCommand}</code>
                  </pre>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Resultat:</h3>
          <div className="max-h-[calc(100vh-200px)] flex flex-col">
            <div className="relative overflow-x-auto">
              <div className="overflow-y-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(result[0] || {}).map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky top-0 bg-gray-50 z-10 border-b"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.map((row: Record<string, unknown>, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {Object.values(row).map((value: unknown, j: number) => (
                          <td key={j} className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                            {String(value ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

