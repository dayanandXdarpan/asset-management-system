const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')
  try {
    const password = await hash('password123', 10)
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        name: 'Test Admin',
        password,
        role: 'ADMIN',
      },
    })
    
    console.log('Test User Created:', user)
  } catch (e) {
    console.error('Error during seeding:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
