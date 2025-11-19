// Simple in-memory storage for demo purposes.
// Encapsulated as a module to keep single responsibility and enable future replacement.

const USERS = [{ id: 'u1', email: 'demo@lab.local', password: 'demo', name: 'Demo' }];

const codes = new Map();

export function buscarUsuarioPorEmail(email) {
  return USERS.find(u => u.email === email) || null;
}

export function guardarCodigo(codigo, payload) {
  codes.set(codigo, { ...payload, creadoEn: Date.now() });
}

export function consumirCodigo(codigo) {
  const valor = codes.get(codigo) || null;
  if (valor) codes.delete(codigo);
  return valor;
}

export function limpiarCodigosExpirados(maxAgeMs = 5 * 60 * 1000) {
  const ahora = Date.now();
  for (const [k, v] of codes) {
    if (ahora - v.creadoEn > maxAgeMs) codes.delete(k);
  }
}
