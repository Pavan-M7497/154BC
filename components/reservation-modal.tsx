'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from '@/components/location-context'
import { useAuth } from '@/components/auth/auth-context'
import { generateTimeSlots, formatPrice } from '@/lib/data'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { format, addDays, isToday } from 'date-fns'
import { X, Calendar, Clock, Users, MapPin, Phone, Mail, CheckCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const { selectedLocation, openLocationModal } = useLocation()
  const { user, userProfile } = useAuth()
  
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [guests, setGuests] = useState(2)
  const [name, setName] = useState(userProfile?.name || '')
  const [phone, setPhone] = useState(userProfile?.phone || '')
  const [email, setEmail] = useState(user?.email || '')
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Generate dates for the next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
  
  // Get time slots for selected date and location
  const timeSlots = selectedLocation ? generateTimeSlots(selectedLocation, selectedDate) : []

  const handleSubmit = async () => {
    if (!selectedLocation) return

    if (!user) {
      setError('Please sign in to make a reservation.')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      await addDoc(collection(db, 'reservations'), {
        userId: user.uid,
        locationId: selectedLocation.id,
        locationName: selectedLocation.name,
        name,
        phone,
        email,
        guests,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTime,
        specialRequests,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      setSuccess(true)
    } catch (err) {
      console.error('Error creating reservation:', err)
      setError('Failed to create reservation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedDate(new Date())
    setSelectedTime('')
    setGuests(2)
    setName(userProfile?.name || '')
    setPhone(userProfile?.phone || '')
    setEmail(user?.email || '')
    setSpecialRequests('')
    setSuccess(false)
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!selectedLocation && isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-coffee/60 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-cream rounded-2xl p-8 max-w-md text-center"
            onClick={e => e.stopPropagation()}
          >
            <MapPin className="w-12 h-12 text-caramel mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-coffee mb-2">Select a Location First</h3>
            <p className="text-mocha mb-6">Please choose your preferred location to make a reservation.</p>
            <button
              onClick={() => {
                handleClose()
                openLocationModal()
              }}
              className="bg-coffee text-cream px-6 py-3 rounded-lg font-medium hover:bg-espresso transition-colors"
            >
              Choose Location
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-coffee/60 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl bg-cream rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-coffee" />
            </button>

            {success ? (
              // Success State
              <div className="p-8 text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                </motion.div>
                <h2 className="font-serif text-3xl text-coffee mb-2">Reservation Confirmed!</h2>
                <p className="text-mocha text-lg mb-6">
                  We look forward to seeing you at {selectedLocation?.name}
                </p>
                <div className="bg-white rounded-xl p-6 max-w-sm mx-auto mb-8">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-caramel" />
                      <span className="text-coffee">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-caramel" />
                      <span className="text-coffee">{selectedTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-caramel" />
                      <span className="text-coffee">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-caramel" />
                      <span className="text-coffee">{selectedLocation?.name}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-mocha mb-6">
                  A confirmation email has been sent to {email}
                </p>
                <button
                  onClick={handleClose}
                  className="bg-coffee text-cream px-8 py-3 rounded-lg font-medium hover:bg-espresso transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center pt-10 pb-6 px-6 border-b border-foam">
                  <h2 className="font-serif text-3xl text-coffee mb-2">Reserve a Table</h2>
                  <p className="text-mocha flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedLocation?.name}
                  </p>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step >= s ? 'bg-coffee text-cream' : 'bg-foam text-mocha'
                        }`}>
                          {s}
                        </div>
                        {s < 3 && (
                          <div className={`w-12 h-0.5 ${step > s ? 'bg-coffee' : 'bg-foam'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  {/* Step 1: Date & Time */}
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Date Selection */}
                      <div>
                        <label className="block text-coffee font-medium mb-3">Select Date</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {availableDates.map((date) => (
                            <button
                              key={date.toISOString()}
                              onClick={() => {
                                setSelectedDate(date)
                                setSelectedTime('')
                              }}
                              className={`flex-shrink-0 px-4 py-3 rounded-lg border transition-colors ${
                                selectedDate.toDateString() === date.toDateString()
                                  ? 'bg-coffee text-cream border-coffee'
                                  : 'bg-white text-espresso border-foam hover:border-caramel'
                              }`}
                            >
                              <span className="block text-xs uppercase">
                                {isToday(date) ? 'Today' : format(date, 'EEE')}
                              </span>
                              <span className="block text-lg font-medium">{format(date, 'd')}</span>
                              <span className="block text-xs">{format(date, 'MMM')}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time Selection */}
                      <div>
                        <label className="block text-coffee font-medium mb-3">Select Time</label>
                        {timeSlots.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map((time) => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                                  selectedTime === time
                                    ? 'bg-coffee text-cream border-coffee'
                                    : 'bg-white text-espresso border-foam hover:border-caramel'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-mocha text-center py-4">
                            No available slots for this date. Please select another date.
                          </p>
                        )}
                      </div>

                      {/* Guests */}
                      <div>
                        <label className="block text-coffee font-medium mb-3">Number of Guests</label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="w-10 h-10 rounded-lg border border-foam bg-white hover:bg-oat-milk transition-colors flex items-center justify-center"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="text-2xl font-medium text-coffee w-8 text-center">{guests}</span>
                          <button
                            onClick={() => setGuests(Math.min(10, guests + 1))}
                            className="w-10 h-10 rounded-lg border border-foam bg-white hover:bg-oat-milk transition-colors flex items-center justify-center"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <span className="text-mocha text-sm">
                            {guests === 1 ? 'Guest' : 'Guests'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact Info */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-coffee font-medium mb-2">Your Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-foam bg-white text-coffee placeholder:text-mocha/50 focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel transition-colors"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-coffee font-medium mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mocha" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-foam bg-white text-coffee placeholder:text-mocha/50 focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel transition-colors"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-coffee font-medium mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mocha" />
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-foam bg-white text-coffee placeholder:text-mocha/50 focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel transition-colors"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-coffee font-medium mb-2">Special Requests (Optional)</label>
                        <textarea
                          value={specialRequests}
                          onChange={e => setSpecialRequests(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg border border-foam bg-white text-coffee placeholder:text-mocha/50 focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel transition-colors resize-none"
                          placeholder="Birthday celebration, highchair needed, dietary restrictions..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirmation */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl p-6">
                        <h3 className="font-serif text-xl text-coffee mb-4">Reservation Summary</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <MapPin className="w-5 h-5 text-caramel mt-0.5" />
                            <div>
                              <p className="text-coffee font-medium">{selectedLocation?.name}</p>
                              <p className="text-mocha text-sm">{selectedLocation?.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Calendar className="w-5 h-5 text-caramel" />
                            <p className="text-coffee">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Clock className="w-5 h-5 text-caramel" />
                            <p className="text-coffee">{selectedTime}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Users className="w-5 h-5 text-caramel" />
                            <p className="text-coffee">{guests} {guests === 1 ? 'Guest' : 'Guests'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6">
                        <h3 className="font-serif text-xl text-coffee mb-4">Contact Details</h3>
                        <div className="space-y-2">
                          <p className="text-coffee">{name}</p>
                          <p className="text-mocha">{phone}</p>
                          <p className="text-mocha">{email}</p>
                          {specialRequests && (
                            <p className="text-mocha text-sm mt-4 border-t border-foam pt-4">
                              <span className="font-medium text-coffee">Special Requests:</span><br />
                              {specialRequests}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    {step > 1 ? (
                      <button
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-3 text-espresso font-medium hover:text-coffee transition-colors"
                      >
                        Back
                      </button>
                    ) : (
                      <div />
                    )}
                    
                    {step < 3 ? (
                      <button
                        onClick={() => setStep(step + 1)}
                        disabled={step === 1 && !selectedTime}
                        className="bg-coffee text-cream px-8 py-3 rounded-lg font-medium hover:bg-espresso transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !name || !phone || !email}
                        className="bg-coffee text-cream px-8 py-3 rounded-lg font-medium hover:bg-espresso transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Confirm Reservation
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
