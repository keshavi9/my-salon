import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customer } from '@/types'

// Seed customers — shown when backend is offline
const SEED: Customer[] = [
  { id: 'c1', name: 'Priya Shah',   phone: '9876543210', email: 'priya@email.com',  gender: 'female', totalVisits: 12, totalSpent: 8400,  loyaltyPoints: 840,  membershipTier: 'gold',     createdAt: '', updatedAt: '' },
  { id: 'c2', name: 'Ritu Mehta',   phone: '9123456780', email: 'ritu@email.com',   gender: 'female', totalVisits: 5,  totalSpent: 3200,  loyaltyPoints: 320,  membershipTier: 'silver',   createdAt: '', updatedAt: '' },
  { id: 'c3', name: 'Anjali Patel', phone: '9988776655', email: '',                 gender: 'female', totalVisits: 20, totalSpent: 15000, loyaltyPoints: 1500, membershipTier: 'platinum', createdAt: '', updatedAt: '' },
  { id: 'c4', name: 'Sneha Joshi',  phone: '9871234560', email: 'sneha@email.com',  gender: 'female', totalVisits: 3,  totalSpent: 1800,  loyaltyPoints: 180,  membershipTier: undefined,  createdAt: '', updatedAt: '' },
  { id: 'c5', name: 'Kavya Desai',  phone: '9765432100', email: 'kavya@email.com',  gender: 'female', totalVisits: 8,  totalSpent: 5600,  loyaltyPoints: 560,  membershipTier: 'silver',   createdAt: '', updatedAt: '' },
]

interface CustomerState {
  customers: Customer[]
  addCustomer: (c: Customer) => void
  removeCustomer: (id: string) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: SEED,
      addCustomer: (c) => {
        // prevent duplicate phone
        if (get().customers.some(x => x.phone === c.phone)) return
        set(state => ({ customers: [c, ...state.customers] }))
      },
      removeCustomer: (id) =>
        set(state => ({ customers: state.customers.filter(c => c.id !== id) })),
      updateCustomer: (id, updates) =>
        set(state => ({ customers: state.customers.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c) })),
    }),
    { name: 'salon-customers' }
  )
)
