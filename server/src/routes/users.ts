import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { verify } from 'hono/jwt'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()
const app = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev_only'

// Middleware to check admin role
const requireAdmin = async (c: any, next: any) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    
    if (user.role !== 'ADMIN') {
        return c.json({ error: 'Admin access required' }, 403)
    }
    
    c.set('userId', user.id)
    await next()
}

// Get all users (admin only)
app.get('/', requireAdmin, async (c) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    })
    return c.json(users)
})

// Get single user
app.get('/:id', requireAdmin, async (c) => {
    const id = Number(c.req.param('id'))
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    })
    if (!user) return c.json({ error: 'User not found' }, 404)
    return c.json(user)
})

// Create user (admin only)
app.post('/', requireAdmin, async (c) => {
    const body = await c.req.json()
    try {
        const hashedPassword = await hash(body.password, 10)
        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                role: body.role || 'VIEWER'
            },
            select: { id: true, name: true, email: true, role: true }
        })
        return c.json(user, 201)
    } catch (e) {
        return c.json({ error: 'Failed to create user' }, 400)
    }
})

// Update user role (admin only)
app.put('/:id', requireAdmin, async (c) => {
    const id = Number(c.req.param('id'))
    const body = await c.req.json()
    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                name: body.name,
                role: body.role
            },
            select: { id: true, name: true, email: true, role: true }
        })
        return c.json(user)
    } catch (e) {
        return c.json({ error: 'Failed to update user' }, 400)
    }
})

// Delete user (admin only)
app.delete('/:id', requireAdmin, async (c) => {
    const id = Number(c.req.param('id'))

    // Get current user ID from JWT
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.replace('Bearer ', '') || ''
    const payload = await verify(token, JWT_SECRET) as { id: number }

    if (id === payload.id) {
        return c.json({ error: 'Cannot delete your own account' }, 400)
    }

    try {
        await prisma.user.delete({ where: { id } })
        return c.json({ success: true })
    } catch (e) {
        return c.json({ error: 'Failed to delete user' }, 400)
    }
})

export default app
