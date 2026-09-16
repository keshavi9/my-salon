'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LifeBuoy, Send, Upload, X, HelpCircle, BookOpen } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const CATEGORIES = [
  { value: 'billing', label: 'Billing & Payments', description: 'Issues with payments, invoices, or subscriptions' },
  { value: 'technical', label: 'Technical Issue', description: 'Software bugs, errors, or system problems' },
  { value: 'feature', label: 'Feature Request', description: 'Suggest new features or improvements' },
  { value: 'bug', label: 'Bug Report', description: 'Report software bugs or unexpected behavior' },
  { value: 'question', label: 'General Question', description: 'Ask questions about features or usage' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', description: 'Minor issue, no immediate impact' },
  { value: 'medium', label: 'Medium', description: 'Moderate issue, affects some features' },
  { value: 'high', label: 'High', description: 'Major issue, affects important features' },
  { value: 'critical', label: 'Critical', description: 'System down or critical functionality broken' },
]

export default function NewTicketPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    email: 'admin@hairahmedabad.com',
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await api.post('/support/tickets', {
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        adminEmail: formData.email,
      })
      router.push('/support')
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to create ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments([...attachments, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-full space-y-6 pb-6 text-text-primary dark:bg-transparent dark:text-text-primary">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-accent-dark">
            <LifeBuoy size={12} />
            New Support Ticket
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] dark:text-text-primary">Create Support Ticket</h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary">Submit your query to our developer team</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-2xl border border-border bg-background-secondary p-6 shadow-sm dark:border-border dark:bg-background-secondary/[0.04]">
              <h2 className="mb-4 text-lg font-bold text-text-primary dark:text-text-primary">Ticket Details</h2>
              
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-secondary dark:text-text-secondary">
                    Subject <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm transition focus:border-accent-dark focus:outline-none dark:border-border dark:bg-background-secondary/[0.04]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-secondary dark:text-text-secondary">
                    Category <span className="text-danger">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {CATEGORIES.map(cat => (
                      <label
                        key={cat.value}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                          formData.category === cat.value
                            ? 'border-accent-dark bg-accent-dark/5'
                            : 'border-border bg-background-secondary hover:border-accent-dark/50 dark:border-border dark:bg-background-secondary/[0.04]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={formData.category === cat.value}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="sr-only"
                          required
                        />
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                            formData.category === cat.value ? 'border-accent-dark' : 'border-border'
                          }`}>
                            {formData.category === cat.value && (
                              <div className="h-2.5 w-2.5 rounded-full bg-accent-dark" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary dark:text-text-primary">{cat.label}</div>
                            <div className="mt-0.5 text-xs text-text-secondary dark:text-text-secondary">{cat.description}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-secondary dark:text-text-secondary">
                    Priority <span className="text-danger">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm transition focus:border-accent-dark focus:outline-none dark:border-border dark:bg-background-secondary/[0.04]"
                    required
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label} - {priority.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-secondary dark:text-text-secondary">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about your issue..."
                    rows={8}
                    className="w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm transition focus:border-accent-dark focus:outline-none dark:border-border dark:bg-background-secondary/[0.04]"
                  />
                  <p className="mt-2 text-xs text-text-secondary dark:text-text-secondary">
                     Tip: Include steps to reproduce, error messages, and screenshots if applicable
                  </p>
                </div>

                {/* Attachments */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-secondary dark:text-text-secondary">
                    Attachments
                  </label>
                  <div className="rounded-xl border-2 border-dashed border-border bg-background p-6 text-center dark:border-border dark:bg-background-secondary/[0.02]">
                    <Upload size={32} className="mx-auto mb-2 text-text-secondary" />
                    <label className="cursor-pointer text-sm font-semibold text-accent-dark hover:text-accent">
                      Click to upload
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="sr-only"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </label>
                    <p className="mt-1 text-xs text-text-secondary">PNG, JPG, PDF up to 10MB</p>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 rounded-lg border border-border bg-background-secondary p-3 dark:border-border dark:bg-background-secondary/[0.04]">
                          <div className="flex-1 truncate text-sm">{file.name}</div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-danger hover:text-danger-text"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {submitError && (
                <p className="rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger-text dark:border-red-900/40 dark:bg-danger-bg dark:text-danger-text">
                  {submitError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-dark to-accent px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl border border-border bg-background-secondary px-6 py-3 font-semibold text-text-secondary transition hover:bg-background dark:border-border dark:bg-background-secondary/[0.04] dark:text-text-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Guidance Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Quick Help */}
            <div className="rounded-2xl border border-border bg-background-secondary p-5 shadow-sm dark:border-border dark:bg-background-secondary/[0.04]">
              <div className="mb-4 flex items-center gap-2">
                <HelpCircle size={20} className="text-accent-dark" />
                <h3 className="font-bold text-text-primary dark:text-text-primary">Quick Help</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-accent-dark/5 p-3">
                  <div className="mb-1 font-semibold text-text-primary dark:text-text-primary"> Email Notification</div>
                  <p className="text-xs text-text-secondary dark:text-text-secondary">
                    Your ticket will be sent to our developer team via email at dev-team@hairahmedabad.com
                  </p>
                </div>
                
                <div className="rounded-lg bg-[var(--success)]/5 p-3">
                  <div className="mb-1 font-semibold text-text-primary dark:text-text-primary">️ Response Time</div>
                  <p className="text-xs text-text-secondary dark:text-text-secondary">
                    Critical: Within 2 hours<br />
                    High: Within 24 hours<br />
                    Medium/Low: Within 2-3 days
                  </p>
                </div>

                <div className="rounded-lg bg-[var(--danger)]/5 p-3">
                  <div className="mb-1 font-semibold text-text-primary dark:text-text-primary"> Updates</div>
                  <p className="text-xs text-text-secondary dark:text-text-secondary">
                    You'll receive email notifications for all ticket updates and responses
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-border bg-background-secondary p-5 shadow-sm dark:border-border dark:bg-background-secondary/[0.04]">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-[var(--warning)]" />
                <h3 className="font-bold text-text-primary dark:text-text-primary">Best Practices</h3>
              </div>
              
              <ul className="space-y-2 text-xs text-text-secondary dark:text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent-dark">✓</span>
                  <span>Be specific and detailed in your description</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent-dark">✓</span>
                  <span>Include error messages or screenshots</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent-dark">✓</span>
                  <span>Mention steps to reproduce the issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent-dark">✓</span>
                  <span>Choose appropriate priority level</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-accent-dark/20 bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent-light)] p-5">
              <div className="mb-2 font-bold text-text-primary dark:text-text-primary">Need urgent help?</div>
              <p className="mb-3 text-xs text-text-secondary dark:text-text-secondary">
                For critical issues, contact our support team directly:
              </p>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-accent-dark"> dev-team@hairahmedabad.com</div>
                <div className="font-semibold text-accent-dark"> +91 98765 43210</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
