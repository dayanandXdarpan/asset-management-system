import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const errorHandler = async (err: Error, c: Context) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`)
    console.error(err.stack)

    if (err instanceof HTTPException) {
        return err.getResponse()
    }

    // Prisma or Zod errors could be handled specifically here

    return c.json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    }, 500)
}

export const loggerMiddleware = async (c: Context, next: Next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    console.log(`[${c.req.method}] ${c.req.path} - ${c.res.status} - ${ms}ms`)
}
