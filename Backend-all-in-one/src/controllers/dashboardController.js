const Customer = require('../models/Customer')
const Booking = require('../models/Booking')
const Service = require('../models/Service')
const Staff = require('../models/Staff')
const asyncHandler = require('express-async-handler')

exports.getDashboardData = asyncHandler(async (req, res) => {
  // A simplified aggregation for the dashboard.
  const [totalCustomers, totalBookings, totalServices, totalStaff] = await Promise.all([
    Customer.count(),
    Booking.count(),
    Service.count(),
    Staff.count({ where: { isActive: true } })
  ])

  // Mocking timeline and other complex data for now to maintain UI aesthetics
  // In a real production app, this would be computed by querying today's bookings.
  const data = {
    metrics: [
      { label: 'Total Revenue', value: '₹45,200', helper: '+12% from yesterday' },
      { label: 'Appointments', value: totalBookings.toString(), helper: '5 pending confirmation' },
      { label: 'New Clients', value: totalCustomers.toString(), helper: '+3 this week' },
      { label: 'Services', value: totalServices.toString(), helper: 'Active catalog' },
    ],
    timeline: [
      { time: '10:00 AM', client: 'Aisha Khan', service: 'Hair Spa', stylist: 'Priya', amount: '₹1200', status: 'Done' },
      { time: '11:30 AM', client: 'Rahul Desai', service: 'Hair Cut', stylist: 'Amit', amount: '₹300', status: 'Active' },
      { time: '01:00 PM', client: 'Sneha Patel', service: 'Bridal Makeup', stylist: 'Neha', amount: '₹5000', status: 'Next' },
      { time: '03:00 PM', client: 'Kiran Rao', service: 'Facial', stylist: 'Priya', amount: '₹800', status: 'Booked' },
    ],
    staff: [
      { name: 'Priya', role: 'Senior Stylist', state: 'Active', load: 80, next: '1:00 PM' },
      { name: 'Amit', role: 'Barber', state: 'Active', load: 45, next: '11:30 AM' },
      { name: 'Neha', role: 'Makeup Artist', state: 'Break', load: 20, next: '1:00 PM' },
    ],
    weeklyPerformance: [
      { day: 'Mon', revenue: 12000, bookings: 14, height: 60, isToday: false },
      { day: 'Tue', revenue: 15500, bookings: 18, height: 80, isToday: false },
      { day: 'Wed', revenue: 9000, bookings: 10, height: 45, isToday: false },
      { day: 'Thu', revenue: 18000, bookings: 22, height: 95, isToday: false },
      { day: 'Fri', revenue: 22000, bookings: 28, height: 110, isToday: false },
      { day: 'Sat', revenue: 28000, bookings: 35, height: 140, isToday: true },
      { day: 'Sun', revenue: 0, bookings: 0, height: 10, isToday: false },
    ],
    topProducts: [
      { name: 'Moroccan Argan Oil', sales: 42, stock: 15, revenue: '₹42,000', trend: '+15%' },
      { name: 'Loreal Color Protect', sales: 28, stock: 8, revenue: '₹14,000', trend: '+5%' },
      { name: 'Olaplex No.3', sales: 15, stock: 2, revenue: '₹22,500', trend: '+22%' },
    ],
    reviews: [
      { client: 'Anjali Sharma', service: 'Hair Color', rating: 5, time: '2 hours ago', comment: 'Absolutely loved the highlights! Priya is magical.' },
      { client: 'Rajiv Mehta', service: 'Hair Cut', rating: 4, time: '5 hours ago', comment: 'Good cut, but had to wait 10 mins.' },
    ],
    notifications: [
      { type: 'booking', message: 'New booking: Sneha Patel for Bridal Makeup at 1:00 PM', time: '5 mins ago' },
      { type: 'inventory', message: 'Low stock alert: Olaplex No.3 (Only 2 left)', time: '1 hour ago' },
      { type: 'review', message: 'Anjali Sharma left a 5-star review', time: '2 hours ago' },
    ],
    services: [
      { name: 'Haircuts & Styling', value: 45 },
      { name: 'Coloring', value: 25 },
      { name: 'Skin & Facial', value: 20 },
      { name: 'Nails & Body', value: 10 },
    ],
  }

  res.json({ success: true, data })
})
