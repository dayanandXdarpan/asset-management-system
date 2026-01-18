import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const auditRoutes = new Hono()

// Get all audit logs
auditRoutes.get('/', async (c) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return c.json(logs)
    } catch (e) {
        return c.json({ error: 'Failed to fetch audit logs' }, 500)
    }
})

// Create an audit log (Internal use mostly, but exposed for now)
auditRoutes.post('/', async (c) => {
    try {
        const body = await c.req.json()
        const log = await prisma.auditLog.create({
            data: {
                action: body.action,
                entity: body.entity,
                entityId: body.entityId,
                details: body.details,
                userId: body.userId
            }
        })
        return c.json(log)
    } catch (e) {
        return c.json({ error: 'Failed to create audit log' }, 500)
    }
})

export default auditRoutes
