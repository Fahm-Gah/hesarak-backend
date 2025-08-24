import React, { useState } from 'react'
import Image from 'next/image'
import { Bus, MapPin, Clock, Users } from 'lucide-react'
import { ImageViewer } from './ImageViewer'

interface Terminal {
  id: string
  name: string
  province: string
  address?: string
}

interface BusType {
  id: string
  name: string
  capacity: number
  amenities: { amenity: string }[]
}

interface Bus {
  id: string
  number: string
  images: Array<{
    id: string
    url: string
    filename: string
    alt: string
    width: number
    height: number
  }>
  type: BusType
}

interface Stop {
  terminal: Terminal
  time: string
  isDestination: boolean
}

interface TripDetails {
  id: string
  tripName: string
  price: number
  departureTime: string
  arrivalTime: string | null
  duration: string | null
  searchDate: string
  originalDate: string
  from: Terminal
  to: Terminal | null
  bus: Bus
  stops: Stop[]
  seatAvailability: {
    totalSeats: number
    availableSeats: number
    bookedSeats: number
  }
  userJourney?: {
    boardingTerminal: Terminal
    boardingTime: string
    destinationTerminal: Terminal | null
    arrivalTime: string | null
    duration: string | null
  }
  originalTrip?: {
    from: Terminal
    departureTime: string
    isUserBoardingAtMainTerminal: boolean
  }
}

interface TripInfoProps {
  tripDetails: TripDetails
  className?: string
}

export const TripInfo = ({ tripDetails, className = '' }: TripInfoProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const formatTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes} ${period}`
  }

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index)
    setIsImageViewerOpen(true)
  }

  const closeImageViewer = () => {
    setIsImageViewerOpen(false)
  }

  return (
    <div className={`space-y-6 pb-4 ${className}`}>
      {/* Trip Details */}
      <div className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 rounded-3xl shadow-xl border border-orange-200/50 p-8 backdrop-blur-sm">
        {/* Trip Route Timeline - Compact Mobile-First Design */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-center">
            {/* Departure */}
            <div className="flex-shrink-0">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
                {formatTo12Hour(tripDetails.departureTime)}
              </div>
            </div>

            {/* Journey Line with Duration */}
            <div className="flex-1 px-2 md:px-4 flex items-center">
              <div className="flex-1 border-t-2 border-dashed border-orange-300"></div>
              <div className="px-2 md:px-3 bg-white rounded-full shadow-sm border border-orange-200">
                <div className="flex items-center gap-1">
                  <Bus className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                  <span className="text-xs md:text-sm font-medium text-orange-600 whitespace-nowrap">
                    {tripDetails.duration || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-orange-300"></div>
            </div>

            {/* Arrival */}
            <div className="flex-shrink-0">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
                {tripDetails.arrivalTime ? formatTo12Hour(tripDetails.arrivalTime) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Bus Gallery */}
        {tripDetails.bus.images && tripDetails.bus.images.length > 0 && (
          <div className="mb-8">
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100">
                {tripDetails.bus.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative flex-none w-64 md:w-72 aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                    onClick={() => openImageViewer(index)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `Bus ${tripDetails.bus.number} - Image ${index + 1}`}
                      width={image.width}
                      height={image.height}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
                      {index + 1} / {tripDetails.bus.images.length}
                    </div>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-orange-600 text-xs px-2 py-1 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Click to View Full Size
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Premium Amenities */}
        {tripDetails.bus.type.amenities && tripDetails.bus.type.amenities.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-3">
              {tripDetails.bus.type.amenities.map((amenityObj, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 text-orange-700 text-sm px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {amenityObj.amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Route Details */}
      {tripDetails.stops && tripDetails.stops.length > 0 && (
        <div className="bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-3xl shadow-xl border border-orange-200/50 p-8 backdrop-blur-sm">
          <div className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
            Complete Journey Route
          </div>

          <div className="relative pl-2">
            {/* Vertical Timeline Line */}
            <div className="absolute left-8 top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-400 via-orange-400 to-red-400 rounded-full opacity-60"></div>

            <div className="space-y-5">
              {/* Show original trip departure if user is not boarding there */}
              {tripDetails.originalTrip &&
                !tripDetails.originalTrip.isUserBoardingAtMainTerminal && (
                  <div className="relative flex items-start gap-5 opacity-60">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 border-2 border-white">
                        <MapPin className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm transition-all duration-300 min-h-[80px]">
                      <div className="flex flex-row items-center justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-600">
                            {tripDetails.originalTrip.from.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Trip starts here (you're not boarding here)
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-gray-500">
                          {formatTo12Hour(tripDetails.originalTrip.departureTime)}
                        </div>
                      </div>
                      {tripDetails.originalTrip.from.address && (
                        <div className="text-sm text-gray-500 bg-gray-100/80 rounded-xl px-4 py-3 mt-4 border border-gray-200/30">
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>
                              {tripDetails.originalTrip.from.address},{' '}
                              {tripDetails.originalTrip.from.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* User's Boarding Terminal */}
              <div className="relative flex items-start gap-5">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300 border-2 border-white">
                    <MapPin className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                </div>
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/60 shadow-sm hover:shadow-md transition-all duration-300 min-h-[80px]">
                  <div className="flex flex-row items-center justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-green-800">{tripDetails.from.name}</h4>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        🎯 Your boarding point
                      </p>
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                      {formatTo12Hour(tripDetails.departureTime)}
                    </div>
                  </div>
                  {tripDetails.from.address && (
                    <div className="text-sm text-gray-600 bg-green-50/80 rounded-xl px-4 py-3 mt-4 border border-green-200/30">
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>
                          {tripDetails.from.address}, {tripDetails.from.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Intermediate Stops (only between user's boarding and destination) */}
              {tripDetails.stops
                .filter((stop) => {
                  const userBoardingId = tripDetails.from?.id
                  const userDestinationId = tripDetails.to?.id

                  // Find the indices of user's boarding and destination
                  const userBoardingIndex = tripDetails.stops.findIndex(
                    (s) => s.terminal.id === userBoardingId,
                  )
                  const userDestinationIndex = tripDetails.stops.findIndex(
                    (s) => s.terminal.id === userDestinationId,
                  )
                  const currentStopIndex = tripDetails.stops.findIndex(
                    (s) => s.terminal.id === stop.terminal.id,
                  )

                  // Show stops that are between user's boarding point and destination
                  // If user boards at main terminal (not in stops), show stops before destination
                  if (userBoardingIndex === -1) {
                    return userDestinationIndex >= 0
                      ? currentStopIndex < userDestinationIndex
                      : !stop.isDestination
                  }

                  // If user has specific boarding and destination points
                  if (userBoardingIndex >= 0 && userDestinationIndex >= 0) {
                    return (
                      currentStopIndex > userBoardingIndex &&
                      currentStopIndex < userDestinationIndex
                    )
                  }

                  // If user boards at intermediate stop but destination is final stop
                  if (userBoardingIndex >= 0 && userDestinationIndex === -1) {
                    return currentStopIndex > userBoardingIndex && !stop.isDestination
                  }

                  return false
                })
                .map((stop, index) => (
                  <div key={index} className="relative flex items-start gap-5">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300 border-2 border-white">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm border border-orange-200"></div>
                      </div>
                    </div>
                    <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-300 min-h-[80px]">
                      <div className="flex flex-row items-center justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-orange-800">
                            {stop.terminal.name}
                          </h4>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                          {formatTo12Hour(stop.time)}
                        </div>
                      </div>
                      {stop.terminal.address && (
                        <div className="text-sm text-gray-600 bg-orange-50/80 rounded-xl px-4 py-3 mt-4 border border-orange-200/30">
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>
                              {stop.terminal.address}, {stop.terminal.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {/* User's Destination Terminal */}
              {tripDetails.to && (
                <div className="relative flex items-start gap-5">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300 border-2 border-white">
                      <MapPin className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>
                  </div>
                  <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200/60 shadow-sm hover:shadow-md transition-all duration-300 min-h-[80px]">
                    <div className="flex flex-row items-center justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-red-800">{tripDetails.to.name}</h4>
                        <p className="text-sm text-red-600 font-medium mt-1">🏁 Your destination</p>
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                        {tripDetails.arrivalTime ? formatTo12Hour(tripDetails.arrivalTime) : 'N/A'}
                      </div>
                    </div>
                    {tripDetails.to.address && (
                      <div className="text-sm text-gray-600 bg-red-50/80 rounded-xl px-4 py-3 mt-4 border border-red-200/30">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>
                            {tripDetails.to.address}, {tripDetails.to.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show remaining stops after user's destination if any */}
              {tripDetails.stops
                .filter((stop) => {
                  // Show stops that are after the user's destination
                  const userDestinationId = tripDetails.to?.id
                  const userDestinationIndex = tripDetails.stops.findIndex(
                    (s) => s.terminal.id === userDestinationId,
                  )
                  const currentStopIndex = tripDetails.stops.findIndex(
                    (s) => s.terminal.id === stop.terminal.id,
                  )
                  return userDestinationIndex >= 0 && currentStopIndex > userDestinationIndex
                })
                .map((stop, index) => (
                  <div key={index} className="relative flex items-start gap-5 opacity-60">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 border-2 border-white">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm border border-gray-200"></div>
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm transition-all duration-300 min-h-[80px]">
                      <div className="flex flex-row items-center justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-600">{stop.terminal.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Trip continues (after your destination)
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-gray-500">
                          {formatTo12Hour(stop.time)}
                        </div>
                      </div>
                      {stop.terminal.address && (
                        <div className="text-sm text-gray-500 bg-gray-100/80 rounded-xl px-4 py-3 mt-4 border border-gray-200/30">
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>
                              {stop.terminal.address}, {stop.terminal.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        images={tripDetails.bus.images}
        initialIndex={selectedImageIndex}
        isOpen={isImageViewerOpen}
        onClose={closeImageViewer}
        busNumber={tripDetails.bus.number}
      />
    </div>
  )
}
