import test from 'node:test';
import assert from 'node:assert/strict';
import { crearTokenAcceso } from '../../idp/tokenService.js';
import { SECRETO_JWT } from '../../idp/config.js';
import { jwtVerify } from 'jose';

test('crearTokenAcceso produce un JWT válido y con claims esperados', async () => {
  const token = await crearTokenAcceso({ sub: 'u1', name: 'Demo', email: 'demo@lab.local', aud: 'demo-client', expiresIn: '1h' });
  assert.equal(typeof token, 'string');
  assert.ok(token.split('.').length === 3);

  // Verificar la firma y payload básico
  const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRETO_JWT));
  assert.equal(payload.sub, 'u1');
  assert.equal(payload.email, 'demo@lab.local');
  assert.equal(payload.aud, 'demo-client');
});
