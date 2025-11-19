export function renderizarPagina(titulo, cuerpoHtml, usuario) {
  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${titulo}</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body { background-color: #0f172a; color: #e2e8f0; }
        .navbar { background: #111827; }
        .card { background: #111827; border-color: #1f2937; }
        .muted { color: #94a3b8; }
        a { text-decoration: none; }
      </style>
    </head>
    <body>
      <nav class="navbar navbar-expand-md navbar-dark mb-4">
        <div class="container">
          <a class="navbar-brand" href="/">Demo SSO Client</a>
          <div class="ms-auto d-flex align-items-center gap-2">
            <a class="btn btn-sm btn-outline-light" href="/">Inicio</a>
            <a class="btn btn-sm btn-primary" href="/dashboard">Dashboard</a>
            ${usuario ? `
              <span class=\"d-none d-md-inline muted\">${(usuario.email ? usuario.email : usuario.name || 'Usuario')}</span>
              <a class=\"btn btn-sm btn-outline-danger\" href=\"/logout\">Cerrar sesión</a>
            ` : `
              <a class=\"btn btn-sm btn-success\" href=\"/login\">Login</a>
            `}
          </div>
        </div>
      </nav>
      <main class="container">${cuerpoHtml}</main>
    </body>
  </html>`;
}

