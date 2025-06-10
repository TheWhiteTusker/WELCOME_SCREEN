import { Pool } from "pg";

const pool = new Pool(
    {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASS,
        port: Number(process.env.DB_PORT),
    }
);

async function ensureOTPTable() {
    try {
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'password_reset_otps'
            );
        `);

        if (!tableExists.rows[0].exists) {
            await pool.query(`
                CREATE TABLE password_reset_otps (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    otp VARCHAR(6) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                    used BOOLEAN DEFAULT FALSE
                );
            `);
            console.log('OTP table created successfully');
        } else {
            const columnExists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'password_reset_otps' 
                    AND column_name = 'used'
                );
            `);

            if (!columnExists.rows[0].exists) {
                await pool.query(`
                    ALTER TABLE password_reset_otps 
                    ADD COLUMN used BOOLEAN DEFAULT FALSE;
                `);
                console.log('Added used column to OTP table');
            }
        }
    } catch (err) {
        console.error('Error ensuring OTP table:', err);
        throw err;
    }
}

ensureOTPTable().catch(err => {
    console.error('Failed to ensure OTP table exists:', err);
    process.exit(1);
});

export default pool;
