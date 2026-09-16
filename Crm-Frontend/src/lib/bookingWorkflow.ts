import type { BookingType, PaymentStatus, AttendanceStatus, PaymentModel } from '@/types'

export class BookingWorkflowEngine {
  private bookingType: BookingType
  private paymentStatus: PaymentStatus
  private attendanceStatus: AttendanceStatus
  private paymentModel: PaymentModel

  constructor(
    bookingType: BookingType,
    paymentModel: PaymentModel,
    paymentStatus: PaymentStatus = 'Unpaid',
    attendanceStatus: AttendanceStatus = 'Booked'
  ) {
    this.bookingType = bookingType
    this.paymentModel = paymentModel
    this.paymentStatus = paymentStatus
    this.attendanceStatus = attendanceStatus

    this.validateInitialState()
  }

  private validateInitialState() {
    // Pre-Paid bookings must start with Paid status
    if (this.paymentModel === 'Pre-Paid' && this.paymentStatus === 'Unpaid') {
      throw new Error('Pre-Paid bookings must have Paid payment status')
    }

    // Walk-In bookings start at Checked_In
    if (this.bookingType === 'Walk_In' && this.attendanceStatus === 'Booked') {
      this.attendanceStatus = 'Checked_In'
    }
  }

  // CORE RULE: Cannot complete unless paid
  canTransitionToCompleted(): boolean {
    return this.paymentStatus === 'Paid' && this.attendanceStatus === 'In_Service'
  }

  // Check if checkout is required
  requiresCheckout(): boolean {
    return this.attendanceStatus === 'In_Service' && this.paymentStatus === 'Unpaid'
  }

  // Transition attendance status
  transitionAttendance(newStatus: AttendanceStatus): { success: boolean; error?: string } {
    const validTransitions: Record<AttendanceStatus, AttendanceStatus[]> = {
      Booked: ['Checked_In'],
      Checked_In: ['In_Service'],
      In_Service: ['Completed'],
      Completed: []
    }

    // Check if transition is valid
    if (!validTransitions[this.attendanceStatus].includes(newStatus)) {
      return {
        success: false,
        error: `Invalid transition: ${this.attendanceStatus} → ${newStatus}`
      }
    }

    // ENFORCE CORE RULE: Cannot complete unless paid
    if (newStatus === 'Completed' && this.paymentStatus !== 'Paid') {
      return {
        success: false,
        error: 'Cannot complete booking: Payment status must be Paid'
      }
    }

    this.attendanceStatus = newStatus
    return { success: true }
  }

  // Update payment status
  updatePaymentStatus(newStatus: PaymentStatus): void {
    this.paymentStatus = newStatus
  }

  // Get current state
  getState() {
    return {
      bookingType: this.bookingType,
      paymentStatus: this.paymentStatus,
      attendanceStatus: this.attendanceStatus,
      paymentModel: this.paymentModel,
      canComplete: this.canTransitionToCompleted(),
      requiresCheckout: this.requiresCheckout()
    }
  }

  // Auto-transition based on workflow rules
  autoTransition(): { action: string; message: string } | null {
    // If service ends and unpaid, trigger checkout
    if (this.requiresCheckout()) {
      return {
        action: 'TRIGGER_CHECKOUT',
        message: 'Service completed but unpaid. Checkout required.'
      }
    }

    // If paid and in service, allow completion
    if (this.canTransitionToCompleted()) {
      return {
        action: 'ALLOW_COMPLETE',
        message: 'Ready to mark as completed.'
      }
    }

    return null
  }

  // Get next available actions
  getAvailableActions(): string[] {
    const actions: string[] = []

    if (this.attendanceStatus === 'Booked') {
      actions.push('Check In')
    }

    if (this.attendanceStatus === 'Checked_In') {
      actions.push('Start Service')
    }

    if (this.attendanceStatus === 'In_Service') {
      if (this.paymentStatus === 'Unpaid') {
        actions.push('Process Payment')
      }
      if (this.paymentStatus === 'Paid') {
        actions.push('Complete Service')
      }
    }

    return actions
  }

  // Create workflow for Scheduled booking
  static createScheduled(paymentModel: PaymentModel): BookingWorkflowEngine {
    const paymentStatus = paymentModel === 'Pre-Paid' ? 'Paid' : 'Unpaid'
    return new BookingWorkflowEngine('Scheduled', paymentModel, paymentStatus, 'Booked')
  }

  // Create workflow for Walk-In booking
  static createWalkIn(paymentModel: PaymentModel): BookingWorkflowEngine {
    const paymentStatus = paymentModel === 'Pre-Paid' ? 'Paid' : 'Unpaid'
    return new BookingWorkflowEngine('Walk_In', paymentModel, paymentStatus, 'Checked_In')
  }
}

// Helper function to get status badge styling
export function getStatusBadge(status: AttendanceStatus | PaymentStatus) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    // Attendance statuses
    Booked: { bg: 'bg-info-bg dark:bg-info-bg', text: 'text-info-text dark:text-info-text', border: 'border-info-border dark:border-info-border' },
    Checked_In: { bg: 'bg-accent-light dark:bg-accent-light', text: 'text-accent-dark dark:text-accent-light', border: 'border-accent-light dark:border-accent-light' },
    In_Service: { bg: 'bg-warning-bg dark:bg-warning-bg', text: 'text-warning-text dark:text-warning-text', border: 'border-warning-border dark:border-warning-border' },
    Completed: { bg: 'bg-success-bg dark:bg-success-bg', text: 'text-success-text dark:text-success-text', border: 'border-success-border dark:border-success-border' },
    
    // Payment statuses
    Unpaid: { bg: 'bg-danger-bg dark:bg-danger-bg', text: 'text-danger-text dark:text-danger-text', border: 'border-danger-border dark:border-danger-border' },
    Paid: { bg: 'bg-success-bg dark:bg-success-bg', text: 'text-success-text dark:text-success-text', border: 'border-success-border dark:border-success-border' }
  }

  return styles[status] || styles.Booked
}
