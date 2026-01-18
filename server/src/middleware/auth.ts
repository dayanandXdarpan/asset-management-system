import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev_only'

// Standard JWT Authentication
export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.split(' ')[1]
    try {
        const payload = await verify(token, JWT_SECRET)
        c.set('user', payload)
        await next()
    } catch (e) {
        return c.json({ error: 'Invalid token' }, 401)
    }
})

// Role Based Access Control
export const roleGuard = (allowedRoles: string[]) => createMiddleware(async (c, next) => {
    const user = c.get('user')
    if (!user || !allowedRoles.includes(user.role as string)) {
        return c.json({ error: 'Forbidden: Insufficient permissions' }, 403)
    }
    await next()
})
