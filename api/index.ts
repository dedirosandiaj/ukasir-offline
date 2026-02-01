import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import postgres from 'postgres'
import 'dotenv/config'

const app = new Hono().basePath('/api')

const sql = postgres(process.env.DATABASE_URL!, {
    ssl: false,
    max: 1,
    connect_timeout: 10 // Fail fast (10s) if firewall/network issue
})

app.get('/', (c) => {
    return c.json({ message: 'Ukasir Offline API is running!' })
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
        return c.json({ success: false, message: 'Internal Server Error' }, 500)
    }
})

export const config = {
    runtime: 'nodejs'
}

export default handle(app)
export { app }
