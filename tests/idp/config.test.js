import test from 'node:test';
import assert from 'node:assert/strict';
import { URL_BASE, SECRETO_JWT, PUERTO } from '../../idp/config.js';

test('config exports básicos', () => {
  assert.equal(typeof URL_BASE, 'string');
  assert.ok(URL_BASE.length > 0);
  assert.equal(typeof SECRETO_JWT, 'string');
  assert.ok(SECRETO_JWT.length > 0);
  assert.equal(typeof PUERTO, 'number');
  assert.ok(PUERTO > 0);
});
