import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { roleGuard } from '../middleware/auth'

const prisma = new PrismaClient()
const app = new Hono()

// Get all maintenance records
app.get('/', async (c) => {
    const records = await prisma.maintenanceRecord.findMany({
        include: { asset: true },
        orderBy: { date: 'desc' }
    })
    return c.json(records)
})

// Get single maintenance record
app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const record = await prisma.maintenanceRecord.findUnique({
        where: { id },
        include: { asset: true }
    })
    if (!record) return c.json({ error: 'Record not found' }, 404)
    return c.json(record)
})

// Create maintenance record
app.post('/', roleGuard(['ADMIN', 'TECHNICIAN']), async (c) => {
    const body = await c.req.json()
    const user = c.get('user')

    const record = await prisma.maintenanceRecord.create({
        data: {
            assetId: Number(body.assetId),
            workDescription: body.workDescription,
            performedBy: body.performedBy,
            date: new Date(body.date || Date.now()),
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
            priority: body.priority || 'MEDIUM',
            status: body.status || 'COMPLETED'
        }
    })

    if (user) {
        await prisma.asset.update({
            where: { id: Number(body.assetId) },
            data: { status: 'MAINTENANCE' }
        })
    }

    return c.json(record, 201)
})

// Update maintenance record
app.put('/:id', roleGuard(['ADMIN', 'TECHNICIAN']), async (c) => {
    const id = Number(c.req.param('id'))
    const body = await c.req.json()
    try {
        // Auto-set completion date if moving to COMPLETED
        let completionDate = undefined;
        if (body.status === 'COMPLETED') {
            // If we are just now marking it completed, set date.
            // But if body.completionDate is provided, use that.
            completionDate = body.completionDate ? new Date(body.completionDate) : new Date();
        }

        const record = await prisma.maintenanceRecord.update({
            where: { id },
            data: {
                workDescription: body.workDescription,
                performedBy: body.performedBy,
                date: body.date ? new Date(body.date) : undefined,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                status: body.status,
                priority: body.priority,
                completionDate
            }
        })
        return c.json(record)
    } catch (e) {
        return c.json({ error: 'Failed to update record' }, 400)
    }
})

// Delete maintenance record
app.delete('/:id', roleGuard(['ADMIN']), async (c) => {
    const id = Number(c.req.param('id'))
    try {
        await prisma.maintenanceRecord.delete({ where: { id } })
        return c.json({ success: true })
    } catch (e) {
        return c.json({ error: 'Failed to delete record' }, 400)
    }
})

export default app
