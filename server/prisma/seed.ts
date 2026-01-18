import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')
    
    // 1. Clean up
    await prisma.maintenanceRecord.deleteMany()
    await prisma.asset.deleteMany()
    await prisma.location.deleteMany()
    await prisma.vendor.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.user.deleteMany()

    console.log('✓ Cleaned up database')

    // 2. Create Users
    const password = await hash('password123', 10)
    const admin = await prisma.user.create({
        data: {
            email: 'admin@test.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    })

    const tech = await prisma.user.create({
        data: {
            email: 'tech@test.com',
            name: 'John Technician',
            password,
            role: 'TECHNICIAN',
        },
    })
    console.log('Users created')

    // 3. Create Locations
    const locations = await Promise.all([
        prisma.location.create({ data: { siteName: 'Vidyut Bhawan', region: 'Patna' } }),
        prisma.location.create({ data: { siteName: 'Grid Substation Vaishali', region: 'Patna' } }),
        prisma.location.create({ data: { siteName: 'Divisional Office', region: 'Muzaffarpur' } }),
        prisma.location.create({ data: { siteName: 'Transmission Circle', region: 'Gaya' } }),
        prisma.location.create({ data: { siteName: 'Zonal Office', region: 'Bhagalpur' } }),
    ])
    console.log('Locations created')

    // 4. Create Vendors
    const vendors = await Promise.all([
        prisma.vendor.create({
            data: {
                name: 'Dell Enterprise',
                contactPerson: 'Mike Ross',
                email: 'support@dell.com',
                phone: '+1-555-0199',
                website: 'https://dell.com'
            }
        }),
        prisma.vendor.create({
            data: {
                name: 'Cisco Systems',
                contactPerson: 'Sarah Connor',
                email: 'sales@cisco.com',
                phone: '+1-555-0123',
                website: 'https://cisco.com'
            }
        }),
        prisma.vendor.create({
            data: {
                name: 'Office Depot',
                contactPerson: 'Jim Halpert',
                email: 'b2b@officedepot.com',
                phone: '+1-555-0987',
                website: 'https://officedepot.com'
            }
        })
    ])
    console.log('Vendors created')

    // 5. Create Assets
    const assets = []
    const assetTypes = ['Laptop', 'Server', 'Switch', 'Monitor', 'Printer']
    const statuses = ['OPERATIONAL', 'OPERATIONAL', 'OPERATIONAL', 'MAINTENANCE', 'DOWNTIME']

    for (let i = 1; i <= 20; i++) {
        const type = assetTypes[Math.floor(Math.random() * assetTypes.length)]
        const vendor = vendors[Math.floor(Math.random() * vendors.length)]
        const location = locations[Math.floor(Math.random() * locations.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]

        const asset = await prisma.asset.create({
            data: {
                name: `${type} ${1000 + i}`,
                type,
                status,
                installationDate: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 365))), // Random date within last year
                locationId: location.id,
                vendorId: vendor.id,
                image: `https://source.unsplash.com/random/800x600/?technology,${type}`
            }
        })
        assets.push(asset)
    }
    console.log('Assets created')

    // 6. Create Maintenance Records
    for (let i = 0; i < 15; i++) {
        const asset = assets[Math.floor(Math.random() * assets.length)]
        await prisma.maintenanceRecord.create({
            data: {
                assetId: asset.id,
                workDescription: 'Routine checkup and firmware update',
                performedBy: 'John Technician',
                date: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 180))) // Random date within last 6 months
            }
        })
    }
    console.log('Maintenance records created')

    // 7. Create Audit Logs
    await prisma.auditLog.create({
        data: {
            action: 'CREATE',
            entity: 'Vendor',
            entityId: vendors[0].id,
            details: `Created vendor ${vendors[0].name}`,
            userId: admin.id
        }
    })
    await prisma.auditLog.create({
        data: {
            action: 'UPDATE',
            entity: 'User',
            entityId: tech.id,
            details: 'Updated role to TECHNICIAN',
            userId: admin.id
        }
    })
    console.log('Audit logs created')

    console.log('✅ Database seeded successfully!')
    console.log('📧 Admin: admin@test.com / password123')
    console.log('📧 Tech: tech@test.com / password123')
}

main()
    .then(async () => {
        await prisma.$disconnect()
        process.exit(0)
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
