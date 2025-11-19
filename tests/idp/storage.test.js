import test from 'node:test';
import assert from 'node:assert/strict';
import { buscarUsuarioPorEmail, guardarCodigo, consumirCodigo, limpiarCodigosExpirados } from '../../idp/storage.js';

test('buscarUsuarioPorEmail encuentra usuario demo', () => {
  const u = buscarUsuarioPorEmail('demo@lab.local');
  assert.ok(u);
  assert.equal(u.email, 'demo@lab.local');
});

test('buscarUsuarioPorEmail devuelve null para desconocido', () => {
  const u = buscarUsuarioPorEmail('noexiste@x');
  assert.equal(u, null);
});

test('guardarCodigo y consumirCodigo funcionan y consumen solo una vez', () => {
  const clave = 'codigo-test-1';
  guardarCodigo(clave, { user: { id: 'u1', email: 'demo@lab.local' }, client_id: 'demo' });
  const primera = consumirCodigo(clave);
  assert.ok(primera);
  assert.equal(primera.user.email, 'demo@lab.local');
  const segunda = consumirCodigo(clave);
  assert.equal(segunda, null);
});

test('limpiarCodigosExpirados borra códigos antiguos (maxAgeMs negativo)', () => {
  const clave = 'codigo-test-2';
  guardarCodigo(clave, { user: { id: 'u1' }, client_id: 'demo' });
  // Forzar limpieza con maxAgeMs negativo para eliminar todo
  limpiarCodigosExpirados(-1);
  const v = consumirCodigo(clave);
  assert.equal(v, null);
});
