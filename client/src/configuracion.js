import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '..', '.env') });

export const URL_IDP = process.env.IDP_BASE || 'http://127.0.0.1:4000';
export const URL_BASE_CLIENTE = process.env.BASE_URL || 'http://127.0.0.1:3000';
export const PUERTO = Number(new URL(URL_BASE_CLIENTE).port) || 3000;
export const NOMBRE_COOKIE = 'cliente.sid';

