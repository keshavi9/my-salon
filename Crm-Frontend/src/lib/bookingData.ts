export const SERVICES = [
  { id: '1', name: 'Signature Haircut',  category: 'Hair',       price: 500,  duration: 30, note: 'Consultation, cut, finish' },
  { id: '2', name: 'Global Hair Color',  category: 'Hair Color', price: 2000, duration: 90, note: 'Shade consultation included' },
  { id: '3', name: 'Express Manicure',   category: 'Nails',      price: 400,  duration: 45, note: 'Shape, buff, polish' },
  { id: '4', name: 'Classic Pedicure',   category: 'Nails',      price: 500,  duration: 45, note: 'Foot soak and polish' },
  { id: '5', name: 'Glow Facial',        category: 'Skin',       price: 800,  duration: 60, note: 'Cleanse, massage, mask' },
  { id: '6', name: 'Hair Spa',           category: 'Hair',       price: 1200, duration: 60, note: 'Deep conditioning treatment' },
  { id: '7', name: 'Full Body Waxing',   category: 'Waxing',     price: 1000, duration: 75, note: 'Full body wax session' },
  { id: '8', name: 'Bridal Makeup',      category: 'Makeup',     price: 5000, duration: 120, note: 'Full bridal look' },
]

export const STAFF = [
  { id: '1', name: 'Priya Kumar',  speciality: 'Senior Hair Stylist', availability: 'Available now' },
  { id: '2', name: 'Rahul Verma',  speciality: 'Color Specialist',    availability: 'Next chair open' },
  { id: '3', name: 'Sonal Patel',  speciality: 'Nail Artist',         availability: 'Available in 10 min' },
  { id: '4', name: 'Ritu Joshi',   speciality: 'Makeup Artist',       availability: 'Available now' },
]

export const UPI_ID = 'hairahmedabad@upi'
export const SALON_NAME = 'Hair Ahmedabad'

export interface CustomerRecord {
  id: string
  name: string
  phone: string
  email?: string
  gender?: string
  dob?: string
}

export const CUSTOMER_DB: CustomerRecord[] = [
  { id: 'c1', name: 'Priya Shah',   phone: '9876543210', email: 'priya@email.com',  gender: 'female', dob: '1995-04-12' },
  { id: 'c2', name: 'Ritu Mehta',   phone: '9123456780', email: 'ritu@email.com',   gender: 'female', dob: '1990-08-22' },
  { id: 'c3', name: 'Anjali Patel', phone: '9988776655', email: '',                 gender: 'female', dob: '1988-01-05' },
  { id: 'c4', name: 'Sneha Joshi',  phone: '9871234560', email: 'sneha@email.com',  gender: 'female', dob: '1998-11-30' },
  { id: 'c5', name: 'Kavya Desai',  phone: '9765432100', email: 'kavya@email.com',  gender: 'female', dob: '1993-07-18' },
]

export const PACKAGES = [
  { id: 'p1', name: 'Bridal Package',   price: 8000, description: 'Makeup + Hair + Facial' },
  { id: 'p2', name: 'Glow Package',     price: 2500, description: 'Facial + Manicure + Pedicure' },
  { id: 'p3', name: 'Hair Care Combo',  price: 1800, description: 'Haircut + Hair Spa' },
]

export const OFFERS = [
  { id: 'o1', code: 'SAVE10',  label: '10% Off',       discount: 10 },
  { id: 'o2', code: 'SALON20', label: '20% Off',       discount: 20 },
  { id: 'o3', code: 'FLAT15',  label: '15% Off',       discount: 15 },
]

export const PRODUCTS = [
  { id: 'pr1', name: 'Kerastase Shampoo',  category: 'Hair Care', price: 850,  note: '250ml — sulfate free' },
  { id: 'pr2', name: "L'Oréal Hair Mask",  category: 'Hair Care', price: 650,  note: '200ml — deep repair' },
  { id: 'pr3', name: 'OPI Nail Polish',    category: 'Nails',     price: 450,  note: '15ml — long lasting' },
  { id: 'pr4', name: 'Vitamin C Serum',    category: 'Skin Care', price: 1200, note: '30ml — brightening' },
  { id: 'pr5', name: 'Wax Strips (Pack)',  category: 'Waxing',    price: 300,  note: '20 strips — sensitive skin' },
]

export const PLANS = [
  { id: 'pl1', name: 'Silver Plan',   price: 2999, duration: 30,  discount: 10, benefits: ['10% off all services', '1 free haircut', 'Priority booking'] },
  { id: 'pl2', name: 'Gold Plan',     price: 5999, duration: 90,  discount: 20, benefits: ['20% off all services', '2 free haircuts', 'Free hair spa', 'Priority booking'] },
  { id: 'pl3', name: 'Platinum Plan', price: 9999, duration: 180, discount: 30, benefits: ['30% off all services', 'Unlimited haircuts', 'Monthly facial', 'Dedicated stylist'] },
]
