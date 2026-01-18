import { Hono } from 'hono'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { Buffer } from 'node:buffer'

const app = new Hono()

app.post('/', async (c) => {
    try {
        const body = await c.req.parseBody()
        const file = body['file']

        if (file && file instanceof File) {
            const fileName = `${Date.now()}-${file.name}`
            const path = join('./uploads', fileName)

            // Convert ArrayBuffer to Buffer
            const buffer = Buffer.from(await file.arrayBuffer())
            await writeFile(path, buffer)

            return c.json({ url: `/uploads/${fileName}` })
        }

        return c.json({ error: 'No file uploaded' }, 400)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Upload failed' }, 500)
    }
})

export default app
