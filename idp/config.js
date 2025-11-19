import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env relative to this file so starting from other cwd works reliably
dotenv.config({ path: resolve(__dirname, '.env') });

export const URL_BASE = process.env.BASE_URL || 'http://127.0.0.1:4000';
export const SECRETO_JWT = process.env.JWT_SECRET || 'dev-secret';
export const PUERTO = Number(new URL(URL_BASE).port) || 4000;
