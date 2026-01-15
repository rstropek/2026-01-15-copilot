import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

drizzle(process.env.DB_FILE_NAME!);
