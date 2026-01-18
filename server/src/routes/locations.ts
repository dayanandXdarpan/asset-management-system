import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { roleGuard } from '../middleware/auth'

const prisma = new PrismaClient()
const app = new Hono()

// Get all locations
app.get('/', async (c) => {
    const locations = await prisma.location.findMany({
        include: { _count: { select: { assets: true } } }
    })
    return c.json(locations)
})

// Get single location
app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const location = await prisma.location.findUnique({
        where: { id },
        include: { assets: true }
    })
    if (!location) return c.json({ error: 'Location not found' }, 404)
    return c.json(location)
})

// Create location
app.post('/', roleGuard(['ADMIN']), async (c) => {
    const body = await c.req.json()
    const location = await prisma.location.create({
        data: {
            siteName: body.siteName,
            region: body.region
        }
    })
    return c.json(location, 201)
})

// Update location
app.put('/:id', roleGuard(['ADMIN']), async (c) => {
    const id = Number(c.req.param('id'))
    const body = await c.req.json()
    try {
        const location = await prisma.location.update({
            where: { id },
            data: {
                siteName: body.siteName,
                region: body.region
            }
        })
        return c.json(location)
    } catch (e) {
        return c.json({ error: 'Failed to update location' }, 400)
    }
})

// Delete location
app.delete('/:id', roleGuard(['ADMIN']), async (c) => {
    const id = Number(c.req.param('id'))
    try {
        // Check if location has assets
        const location = await prisma.location.findUnique({
            where: { id },
            include: { _count: { select: { assets: true } } }
        })
        if (location && location._count.assets > 0) {
            return c.json({ error: 'Cannot delete location with existing assets' }, 400)
        }
        await prisma.location.delete({ where: { id } })
        return c.json({ success: true })
    } catch (e) {
        return c.json({ error: 'Failed to delete location' }, 400)
    }
})

export default app
