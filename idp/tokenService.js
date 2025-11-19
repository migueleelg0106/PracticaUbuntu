import { SignJWT } from 'jose';
import { SECRETO_JWT, URL_BASE } from './config.js';

const claveSecreta = new TextEncoder().encode(SECRETO_JWT);

/**
 * Crear un token de acceso firmado (JWT) para el usuario.
 * Devuelve el JWT serializado en compact.
 */
export async function crearTokenAcceso({ sub, name, email, aud = 'demo-client', expiresIn = '10m' }) {
  const jwt = await new SignJWT({ sub, name, email, iss: URL_BASE, aud })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(claveSecreta);

  return jwt;
}
