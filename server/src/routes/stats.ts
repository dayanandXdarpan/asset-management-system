import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = new Hono()

app.get('/', async (c) => {
    const [totalAssets, activeAssets, maintenanceCount, locations] = await Promise.all([
        prisma.asset.count(),
        prisma.asset.count({ where: { status: 'OPERATIONAL' } }),
        prisma.maintenanceRecord.count(),
        prisma.location.count()
    ])

    return c.json({
        totalAssets,
        activeAssets,
        maintenanceCount,
        locations
    })
})

export default app
