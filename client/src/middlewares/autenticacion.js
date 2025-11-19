import { renderizarPagina } from '../vistas/plantilla.js';

export function exigirAutenticacionPagina(req, res, next) {
  if (!req.session.token_acceso) {
    res.status(401).set('Content-Type', 'text/html; charset=utf-8');
    return res.send(
      renderizarPagina(
        'No autenticado',
        `
        <div class="text-center">
          <h1 class="mb-3">No estás autenticado</h1>
          <p class="muted">Inicia sesión para acceder al contenido protegido.</p>
          <a class="btn btn-primary" href="/login">Iniciar sesión</a>
        </div>`
      )
    );
  }
  next();
}

export function exigirAutenticacionApi(req, res, next) {
  if (!req.session.token_acceso) return res.status(401).json({ error: 'no_autenticado' });
  next();
}

export function establecerNoCache(res) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
}

