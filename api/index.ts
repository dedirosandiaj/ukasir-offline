import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import postgres from 'postgres'
import 'dotenv/config'

const app = new Hono().basePath('/api')

const sql = postgres(process.env.DATABASE_URL!, {
    ssl: { rejectUnauthorized: false }, // Enable SSL but allow self-signed certs (common for VPS)
    max: 1,
    connect_timeout: 2 // Fail extremely fast (2s)
})

app.get('/', (c) => {
    return c.json({ message: 'Ukasir Offline API is running!' })
})

app.get('/cek', async (c) => {
    try {
        // 1. Check Env Var
        const hasDbUrl = !!process.env.DATABASE_URL
        const dbUrlStart = process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'Not Set'

        // 2. Test Connection
        const startTime = Date.now()

        // Timeout wrapper since driver timeout might verify slowly
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Strict App Timeout (3s) - Firewall likely blocking')), 3000)
        )

        await Promise.race([
            sql`SELECT 1`,
            timeoutPromise
        ])

        const duration = Date.now() - startTime

        return c.json({
            status: 'ok',
            message: 'Database connection successful',
            env: {
                DATABASE_URL_SET: hasDbUrl,
                DATABASE_URL_PREVIEW: dbUrlStart
            },
            connection_time_ms: duration,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Diagnostic Error:', error)
        return c.json({
            status: 'error',
            message: 'Database connection failed',
            error_details: String(error),
            env: {
                DATABASE_URL_SET: !!process.env.DATABASE_URL
            }
        }, 500)
    }
})

app.post('/validate', async (c) => {
    try {
        const body = await c.req.json()
        const { token_number } = body

        if (!token_number) {
            return c.json({ success: false, message: 'Token number is required' }, 400)
        }

        // Checking the token in the database
        // Assuming the table name is 'token_validations' per the plan, ensuring columns match user request:
        // token_number, register_date, status_active
        const result = await sql`
      SELECT token_number, register_date, status_active 
      FROM token_validations 
      WHERE token_number = ${token_number}
      LIMIT 1
    `

        if (result.length === 0) {
            return c.json({ success: false, message: 'Token not found' }, 404)
        }

        const tokenData = result[0]

        if (!tokenData.status_active) {
            return c.json({ success: false, message: 'Token is not active', data: tokenData }, 403)
        }

        return c.json({
            success: true,
            message: 'Token is valid',
            data: {
                token_number: tokenData.token_number,
                register_date: tokenData.register_date,
                status_active: tokenData.status_active
            }
        })

    } catch (error) {
        console.error('Error validating token:', error)
        return c.json({
            success: false,
            message: 'Internal Server Error',
            debug_error: String(error) // Temporary for debugging
        }, 500)
    }
})

export const config = {
    runtime: 'nodejs'
}

export default handle(app)
export { app }
