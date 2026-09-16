const jwt = require('jsonwebtoken')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager', 'receptionist', 'stylist']).optional(),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = registerSchema.parse(req.body)
  
  const exists = await User.findOne({ where: { email } })
  if (exists) {
    res.status(400)
    throw new Error('Email already registered')
  }

  const user = await User.create({ name, email, password, role })
  const token = signToken(user.id, user.role)
  
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
  })
})

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)
  
  const user = await User.findOne({ where: { email } })
  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }
  if (!user.isActive) {
    res.status(401)
    throw new Error('Account has been disabled. Please contact support.')
  }
  
  const token = signToken(user.id, user.role)
  res.json({
    success: true,
    message: 'Login successful',
    data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
  })
})

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } })
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  res.json({ success: true, data: user })
})
