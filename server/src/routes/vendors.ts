import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { roleGuard } from '../middleware/auth'

const prisma = new PrismaClient()
const app = new Hono()

// Get all vendors
app.get('/', async (c) => {
    const vendors = await prisma.vendor.findMany({
        include: { _count: { select: { assets: true } } }
    })
    return c.json(vendors)
})

// Get single vendor
app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const vendor = await prisma.vendor.findUnique({
        where: { id },
        include: { assets: true }
    })
    if (!vendor) return c.json({ error: 'Vendor not found' }, 404)
    return c.json(vendor)
})

// Create vendor
app.post('/', roleGuard(['ADMIN']), async (c) => {
    const body = await c.req.json()
    const user = c.get('user')
    
    try {
        const vendor = await prisma.vendor.create({
            data: {
                name: body.name,
                contactPerson: body.contactPerson,
                email: body.email,
                phone: body.phone,
                address: body.address,
                website: body.website
            }
        })

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entity: 'Vendor',
                entityId: vendor.id,
                details: `Created vendor ${vendor.name}`,
                userId: user ? user.id : 1 // Fallback only if essential
            }
        })

        return c.json(vendor, 201)
    } catch (e) {
        return c.json({ error: 'Failed to create vendor' }, 400)
    }
})

// Update vendor
app.put('/:id', roleGuard(['ADMIN']), async (c) => {
    const id = Number(c.req.param('id'))
    const body = await c.req.json()
    try {
        const vendor = await prisma.vendor.update({
            where: { id },
            data: {
                name: body.name,
                contactPerson: body.contactPerson,
                email: body.email,
                phone: body.phone,
                address: body.address,
                website: body.website
            }
        })
        return c.json(vendor)
    } catch (e) {
        return c.json({ error: 'Failed to update vendor' }, 400)
    }
})

// Delete vendor
app.delete('/:id', roleGuard(['ADMIN']), async (c) => {
    const id = Number(c.req.param('id'))
    
    // Validate ID
    if (isNaN(id)) {
        return c.json({ error: 'Invalid vendor ID' }, 400);
    }

    try {
        // Check if vendor has assets
        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: { _count: { select: { assets: true } } }
        })
        
        if (!vendor) {
            return c.json({ error: 'Vendor not found' }, 404);
        }

        if (vendor._count.assets > 0) {
            return c.json({ error: 'Cannot delete vendor with associated assets. Reassign assets first.' }, 400)
        }
        
        await prisma.vendor.delete({ where: { id } })
        
        return c.json({ success: true })
    } catch (e) {
        console.error('Delete error:', e);
        return c.json({ error: 'Failed to delete vendor', details: String(e) }, 500) // Changed to 500 for server errors
    }
})

export default app
