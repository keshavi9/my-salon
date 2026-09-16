require('dotenv').config()
const { connectDB } = require('./src/config/db')
const User = require('./src/models/User')

async function seed() {
  await connectDB()

  const exists = await User.findOne({ where: { email: 'admin@hairahmedabad.com' } })
  if (exists) {
    console.log('Admin user already exists')
    process.exit(0)
  }

  await User.create({
    name: 'Admin',
    email: 'admin@hairahmedabad.com',
    password: 'Admin@123',
    role: 'admin',
  })

  console.log('✅ Admin user created: admin@hairahmedabad.com / Admin@123')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
