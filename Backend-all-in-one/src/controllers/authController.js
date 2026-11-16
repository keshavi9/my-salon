const jwt = require('jsonwebtoken')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // role is intentionally excluded — callers cannot self-assign a role
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

exports.register = asyncHandler(async (req, res) => {
  // Self-registration is disabled by default in production.
  // Set ALLOW_REGISTRATION=true in .env to enable it (e.g. during onboarding).
  // Admins should create staff accounts via a protected admin route instead.
  if (process.env.ALLOW_REGISTRATION !== 'true') {
    res.status(403)
    throw new Error('Self-registration is disabled. Contact your administrator.')
  }

  const { name, email, password } = registerSchema.parse(req.body)
  
  const exists = await User.findOne({ where: { email } })
  if (exists) {
    res.status(400)
    throw new Error('Email already registered')
  }

  // Role is always forced to 'stylist' for self-registered accounts.
  // Admins promote users via a protected admin route.
  const user = await User.create({ name, email, password, role: 'stylist' })
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
})

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body)
  const user = await User.findOne({ where: { email } })
  if (!user) {
    // Return a generic success to prevent email enumeration
    return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })
  }

  // Generate a random hex token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  
  // Token expires in 15 minutes
  const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)

  await user.update({ resetPasswordToken, resetPasswordExpires })

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, please ignore this email. The link will expire in 15 minutes.</p>
        `,
      })
    } catch (error) {
      console.error('Email send failed:', error.message)
      await user.update({ resetPasswordToken: null, resetPasswordExpires: null })
      res.status(500)
      throw new Error('Email could not be sent')
    }
  } else {
    // Fallback for development if nodemailer isn't configured
    console.log(`[DEV ONLY] Password reset link for ${user.email}: ${resetUrl}`)
  }

  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = resetPasswordSchema.parse(req.body)
  
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { [require('sequelize').Op.gt]: new Date() },
    },
  })

  if (!user) {
    res.status(400)
    throw new Error('Invalid or expired password reset token')
  }

  // Set new password (the beforeSave hook handles hashing)
  await user.update({
    password,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  })

  res.json({ success: true, message: 'Password has been successfully reset' })
})


const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)

  const user = await User.findByPk(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const isMatch = await user.matchPassword(currentPassword)
  if (!isMatch) {
    res.status(401)
    throw new Error('Current password is incorrect')
  }

  await user.update({ password: newPassword })

  res.json({ success: true, message: 'Password changed successfully' })
})