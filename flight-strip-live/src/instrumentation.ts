import { drizzle } from 'drizzle-orm/libsql';

export async function register() {
    drizzle(process.env.DB_FILE_NAME!);
}
