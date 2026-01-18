import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { PrismaClient } from '@prisma/client'
import { sign, verify } from 'hono/jwt'
import { compare, hash } from 'bcryptjs'

const prisma = new PrismaClient()
const app = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev_only'

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'TECHNICIAN', 'VIEWER']).optional()
})

const ProfileUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional()
})

const PasswordChangeSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6)
})

app.post('/login', zValidator('json', LoginSchema), async (c) => {
    const { email, password } = c.req.valid('json')

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return c.json({ error: 'Invalid credentials' }, 401)

    const isValid = await compare(password, user.password)
    if (!isValid) return c.json({ error: 'Invalid credentials' }, 401)

    const token = await sign({
        id: user.id,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 // 8 hours
    }, JWT_SECRET)

    return c.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
})

app.post('/register', zValidator('json', RegisterSchema), async (c) => {
    try {
        const body = c.req.valid('json')

        // Check if user exists
        const exists = await prisma.user.findUnique({ where: { email: body.email } })
        if (exists) return c.json({ error: 'User already exists' }, 400)

        const hashedPassword = await hash(body.password, 10)

        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                role: body.role || 'VIEWER'
            }
        })

        return c.json({ message: 'User created successfully', id: user.id }, 201)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Registration failed' }, 500)
    }
})

// Get current user profile (requires auth)
app.get('/me', async (c) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)

    try {
        const token = authHeader.replace('Bearer ', '')
        const payload = await verify(token, JWT_SECRET) as { id: number }

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        })

        if (!user) return c.json({ error: 'User not found' }, 404)
        return c.json(user)
    } catch (e) {
        return c.json({ error: 'Invalid token' }, 401)
    }
})

// Update profile
app.put('/profile', zValidator('json', ProfileUpdateSchema), async (c) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)

    try {
        const token = authHeader.replace('Bearer ', '')
        const payload = await verify(token, JWT_SECRET) as { id: number }
        const body = c.req.valid('json')

        const user = await prisma.user.update({
            where: { id: payload.id },
            data: body,
            select: { id: true, name: true, email: true, role: true }
        })

        return c.json(user)
    } catch (e) {
        return c.json({ error: 'Update failed' }, 400)
    }
})

// Change password
app.put('/password', zValidator('json', PasswordChangeSchema), async (c) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)

    try {
        const token = authHeader.replace('Bearer ', '')
        const payload = await verify(token, JWT_SECRET) as { id: number }
        const { currentPassword, newPassword } = c.req.valid('json')

        const user = await prisma.user.findUnique({ where: { id: payload.id } })
        if (!user) return c.json({ error: 'User not found' }, 404)

        const isValid = await compare(currentPassword, user.password)
        if (!isValid) return c.json({ error: 'Current password is incorrect' }, 400)

        const hashedPassword = await hash(newPassword, 10)
        await prisma.user.update({
            where: { id: payload.id },
            data: { password: hashedPassword }
        })

        return c.json({ message: 'Password changed successfully' })
    } catch (e) {
        return c.json({ error: 'Password change failed' }, 400)
    }
})

export default app
