import express from 'express';
import session from 'express-session';
import rutas from './src/rutas.js';
import { PUERTO, URL_BASE_CLIENTE, NOMBRE_COOKIE } from './src/configuracion.js';

const app = express();

app.use(session({
  name: NOMBRE_COOKIE,
  secret: 'client-session-dev',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 30 * 60 * 1000 }
}));

app.use('/', rutas);

app.listen(PUERTO, () => console.log(`Cliente en ${URL_BASE_CLIENTE}`));

