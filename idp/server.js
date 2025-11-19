import express from 'express';
import session from 'express-session';
import rutas from './routes.js';
import { PUERTO, URL_BASE } from './config.js';

const app = express();

// Middleware básico
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: 'idp.sid',
  secret: 'idp-session-dev',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 30 * 60 * 1000 }
}));

// Montar rutas modulares
app.use('/', rutas);

app.listen(PUERTO, () => console.log(`IdP en ${URL_BASE}`));
