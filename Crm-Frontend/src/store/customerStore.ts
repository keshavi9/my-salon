import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customer } from '@/types'

interface CustomerState {
  customers: Customer[]
  addCustomer: (c: Customer) => void
  removeCustomer: (id: string) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],
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
