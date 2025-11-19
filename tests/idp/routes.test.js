import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import rutas from '../../idp/routes.js';

// Se monta la app con session para probar flujo /login -> /authorize -> /token
function crearAppDePrueba() {
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(session({ secret: 'test-session', resave: false, saveUninitialized: false }));
  app.use('/', rutas);
  return app;
}

test('flujo OAuth: login, authorize, token', async (t) => {
  const app = crearAppDePrueba();
  const agente = request.agent(app);

  // 1) GET /login (formulario)
  let res = await agente.get('/login');
  assert.equal(res.status, 200);

  // 2) POST /login (credenciales demo)
  res = await agente.post('/login').type('form').send({ email: 'demo@lab.local', password: 'demo' });
  // Después del login se redirige a /me por defecto
  assert.ok([302, 303, 200].includes(res.status));

  // 3) GET /authorize -> redirige con code y state
  const redirectUri = 'http://127.0.0.1:3000/callback';
  res = await agente.get('/authorize').query({ client_id: 'demo', redirect_uri: redirectUri, state: 'xyz' });
  assert.equal(res.status, 302);
  assert.ok(res.headers.location);
  const loc = new URL(res.headers.location);
  const code = loc.searchParams.get('code');
  const state = loc.searchParams.get('state');
  assert.ok(code);
  assert.equal(state, 'xyz');

  // 4) POST /token with code
  res = await request(app).post('/token').type('form').send({ grant_type: 'authorization_code', code });
  assert.equal(res.status, 200);
  assert.ok(res.body.access_token);
});
