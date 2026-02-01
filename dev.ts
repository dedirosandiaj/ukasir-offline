import { serve } from '@hono/node-server'
import { app } from './api/index'

console.log('Server is running on port 3000')

serve({
    fetch: app.fetch,
    port: 3000
})
