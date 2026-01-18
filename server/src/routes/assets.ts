import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { roleGuard } from '../middleware/auth'

const prisma = new PrismaClient()
const app = new Hono()

import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const AssetSchema = z.object({
    name: z.string().min(2),
    type: z.string().min(2),
    locationId: z.number(),
    status: z.enum(['OPERATIONAL', 'DOWNTIME', 'MAINTENANCE']).optional(),
    installationDate: z.string().optional(),
    image: z.string().optional()
})

app.get('/', async (c) => {
    const page = Number(c.req.query('page')) || 1
    const limit = Number(c.req.query('limit')) || 10
    const skip = (page - 1) * limit
    const search = c.req.query('search') || ''

    const where = search ? {
        OR: [
            { name: { contains: search } },
            { type: { contains: search } }
        ]
    } : {}

    const [data, total] = await Promise.all([
        prisma.asset.findMany({
            where,
            skip,
            take: limit,
            include: { location: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.asset.count({ where })
    ])

    return c.json({
        data,
        meta: {
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }
    })
})

// GET single asset by ID
app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const asset = await prisma.asset.findUnique({
        where: { id },
        include: {
            location: true,
            maintenance: {
                orderBy: { date: 'desc' }
            }
        }
    })
    if (!asset) return c.json({ error: 'Asset not found' }, 404)
    return c.json(asset)
})

app.post('/', roleGuard(['ADMIN']), async (c) => {
    try {
        const body = await c.req.json()
        const validData = AssetSchema.parse(body)
        const user = c.get('user')

        const asset = await prisma.asset.create({
            data: {
                name: validData.name,
                type: validData.type,
                locationId: Number(validData.locationId),
                installationDate: validData.installationDate ? new Date(validData.installationDate) : new Date(),
                status: validData.status || 'OPERATIONAL',
                image: validData.image
            }
        })

        // Audit
        if (user) {
            await prisma.auditLog.create({
                data: {
                    action: 'CREATE',
                    entity: 'Asset',
                    entityId: asset.id,
                    details: `Registered asset: ${asset.name} (${asset.type})`,
                    userId: user.id
                }
            })
        }

        return c.json(asset, 201)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Failed to create asset', details: e }, 400)
    }
})

// Update status
app.patch('/:id/status', roleGuard(['ADMIN', 'TECHNICIAN']), async (c) => {
    const id = Number(c.req.param('id'))
    const { status } = await c.req.json()
    const asset = await prisma.asset.update({
        where: { id },
        data: { status }
    })
    return c.json(asset)
})

app.delete('/:id', roleGuard(['ADMIN']), async (c) => {
    const id = Number(c.req.param('id'))
    try {
        await prisma.maintenanceRecord.deleteMany({ where: { assetId: id } })
        await prisma.asset.delete({ where: { id } })
        return c.json({ success: true })
    } catch (e) {
        return c.json({ error: 'Failed to delete asset' }, 400)
    }
})

app.put('/:id', roleGuard(['ADMIN']), async (c) => {
    const id = Number(c.req.param('id'))
    const body = await c.req.json()
    try {
        const asset = await prisma.asset.update({
            where: { id },
            data: {
                name: body.name,
                type: body.type,
                locationId: Number(body.locationId),
                status: body.status,
                vendorId: body.vendorId ? Number(body.vendorId) : null,
                image: body.image
            }
        })
        return c.json(asset)
    } catch (e) {
        return c.json({ error: 'Failed to update asset' }, 400)
    }
})

export default app
