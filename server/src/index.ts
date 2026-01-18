import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import assetRoutes from './routes/assets'
import locationRoutes from './routes/locations'
import maintenance from './routes/maintenance'
import stats from './routes/stats'
import upload from './routes/upload'
import users from './routes/users'
import vendorRoutes from './routes/vendors'
import auditRoutes from './routes/audit'
import { serveStatic } from '@hono/node-server/serve-static'

import auth from './routes/auth'
import { authMiddleware } from './middleware/auth'

import { errorHandler, loggerMiddleware } from './middleware/error'

const app = new Hono()

app.use('*', loggerMiddleware)
app.use('/*', cors({
    origin: ['http://localhost:5173', 'https://asset-monitor.netlify.app', 'https://asset-management-system-z92r.onrender.com'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']
}))
app.use('/uploads/*', serveStatic({ root: './' }))

app.onError(errorHandler)

// Public Routes
app.route('/auth', auth)

// Protected Routes
app.use('/api/*', authMiddleware)
app.route('/api/assets', assetRoutes)
app.route('/api/locations', locationRoutes)
app.route('/api/maintenance', maintenance)
app.route('/api/stats', stats)
app.route('/api/upload', upload)
app.route('/api/users', users)
app.route('/api/vendors', vendorRoutes)
app.route('/api/audit-logs', auditRoutes)

app.get('/', (c) => {
    return c.text('Asset Management API is running!')
})

const port = Number(process.env.PORT) || 3000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
