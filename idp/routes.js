import express from 'express';
import crypto from 'crypto';
import { buscarUsuarioPorEmail, guardarCodigo, consumirCodigo } from './storage.js';
import { crearTokenAcceso } from './tokenService.js';
import { URL_BASE } from './config.js';

const router = express.Router();

// Middleware para exigir sesión iniciada
function requireLoginPage(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function requireLoginApi(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'not_authenticated' });
  next();
}

// Página de inicio mínima del IdP
router.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`
      <h1>IdP</h1>
      <p>Sesión activa como <strong>${req.session.user.email}</strong></p>
      <p>
        <a href="/me">Ver perfil</a> ·
        <a href="/userinfo">/userinfo</a> ·
        <a href="/logout">Cerrar sesión</a>
      </p>
    `);
  } else {
    res.send(`
      <h1>IdP</h1>
      <p>No has iniciado sesión.</p>
      <p><a href="/login">Ir al login</a></p>
    `);
  }
});

// Login form (GET)
router.get('/login', (req, res) => {
  res.send(`
    <h1>IdP - Login</h1>
    <form method="post" action="/login">
      <input name="email" placeholder="email" value="demo@lab.local"/><br/>
      <input name="password" type="password" placeholder="password" value="demo"/><br/>
      <input type="hidden" name="returnTo" value="${req.query.returnTo || ''}"/>
      <button>Entrar</button>
    </form>
  `);
});

// Handle login (POST)
router.post('/login', (req, res) => {
  const { email, password, returnTo } = req.body;
  const user = buscarUsuarioPorEmail(email);
  if (!user || user.password !== password) return res.status(401).send('Credenciales inválidas');
  // Carga mínima en sesión
  req.session.user = { id: user.id, email: user.email, name: user.name };
  res.redirect(returnTo || '/me');
});

router.get('/me', requireLoginPage, (req, res) => {
  res.send(`<pre>${JSON.stringify(req.session.user, null, 2)}</pre>`);
});

// API de usuario (solo con sesión activa)
router.get('/userinfo', requireLoginApi, (req, res) => {
  res.json(req.session.user);
});

// Logout IdP: destruye la sesión y vuelve a login
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Authorization endpoint: issue a short-lived code and redirect back to client
router.get('/authorize', (req, res) => {
  const { client_id, redirect_uri, state } = req.query;
  if (!req.session.user) {
    const returnTo = `/authorize?client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state || '')}`;
    return res.redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const codigo = crypto.randomBytes(32).toString('hex');
  guardarCodigo(codigo, { user: req.session.user, client_id });
  console.log('[idp] emitiendo código para client:', client_id, 'user:', req.session.user?.email, 'state:', state);
  const url = new URL(redirect_uri);
  url.searchParams.set('code', codigo);
  if (state) url.searchParams.set('state', state);
  res.redirect(url.toString());
});

// Token endpoint: exchange code for token
router.post('/token', express.urlencoded({ extended: false }), async (req, res) => {
  const { code, grant_type } = req.body;
  if (grant_type !== 'authorization_code') return res.status(400).json({ error: 'unsupported_grant_type' });
  const data = consumirCodigo(code);
  if (!data) return res.status(400).json({ error: 'invalid_code' });

  const jwt = await crearTokenAcceso({ sub: data.user.id, name: data.user.name, email: data.user.email, aud: 'demo-client' });
  res.json({ access_token: jwt, token_type: 'Bearer', expires_in: 600 });
});

export default router;
