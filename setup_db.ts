import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL!, {
    ssl: false // Disable SSL for now as per user likely setup
});

async function main() {
    try {
        console.log('Connecting to database...');

        await sql`
            CREATE TABLE IF NOT EXISTS token_validations (
                id SERIAL PRIMARY KEY,
                token_number TEXT UNIQUE NOT NULL,
                register_date TIMESTAMP DEFAULT NOW(),
                status_active BOOLEAN DEFAULT TRUE
            );
        `;

        console.log('Table "token_validations" ensured.');

        // Insert a dummy token for testing if not exists
        await sql`
            INSERT INTO token_validations (token_number, status_active)
            VALUES ('1111-2222-3333-4444', true)
            ON CONFLICT (token_number) DO NOTHING;
        `;

        console.log('Test token "1111-2222-3333-4444" ensured.');

    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await sql.end();
        process.exit();
    }
}

main();
