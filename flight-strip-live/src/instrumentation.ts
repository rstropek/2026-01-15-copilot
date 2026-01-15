import { drizzle } from 'drizzle-orm/libsql';

export async function register() {
    const db = drizzle(process.env.DB_FILE_NAME!);
}
