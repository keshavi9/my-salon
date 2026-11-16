import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'pay-later'
export type BookingStatus = 'pending' | 'checked-in' | 'in-service' | 'completed' | 'cancelled'
export type BookingType = 'walkin' | 'appointment'

export interface BookingEntry {
  id: string
  type: BookingType
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerGender?: 'male' | 'female' | 'other'
  services: { id: string; name: string; price: number; duration: number; quantity: number; staffId?: string; staffName?: string; staffIds?: string[] }[]
  totalAmount: number
  discountCode?: string
  discountAmount: number
  taxAmount: number
  finalAmount: number
  totalDuration: number
  paymentMethod: PaymentMethod
  paymentStatus: 'unpaid' | 'paid'
  status: BookingStatus
  date?: string
  time?: string
  notes?: string
  branchId: string
  createdAt: string
}

interface BookingState {
  bookings: BookingEntry[]
  addBooking: (booking: BookingEntry) => void
  updateBooking: (id: string, updates: Partial<BookingEntry>) => void
  removeBooking: (id: string) => void
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      addBooking: (booking) =>
        set((state) => ({ bookings: [booking, ...state.bookings] })),
      updateBooking: (id, updates) =>
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      removeBooking: (id) =>
        set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) })),
    }),
    { name: 'salon-bookings' }
  )
)
