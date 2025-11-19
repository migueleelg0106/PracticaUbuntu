# SSO mini: IdP + Cliente (Node.js/Express)

Proyecto educativo que implementa un flujo SSO mínimo con:
- Un IdP (servidor de identidad) en `idp/` que emite códigos y tokens (JWT) firmados con HS256.
- Un Cliente (aplicación confiada) en `client/` que inicia sesión contra el IdP y consume el JWT para proteger vistas y una API.

No es para producción. Está pensado para aprender los conceptos básicos del flujo Authorization Code y SSO.

Consulta también la guía paso a paso: `sso-mini-desde-cero.md`.

## Requisitos
- Node.js 18+ (recomendado 20+). Se usa `node:test`, `fetch` y módulos ES.
- Puertos libres: 4000 (IdP) y 3000 (Cliente).

## Estructura
- `idp/` – Servidor IdP (Express):
  - `server.js` – arranque del servidor y sesión.
  - `routes.js` – endpoints: `/login`, `/authorize`, `/token`, `/userinfo`, `/me`, `/logout`.
  - `tokenService.js` – firma de JWT con `jose`.
  - `config.js` – variables y puerto desde `.env`.
  - `storage.js` – usuarios y códigos en memoria.
- `client/` – Cliente (Express):
  - `server.js` – arranque y sesión.
  - `src/rutas.js` – rutas: `/`, `/login`, `/callback`, `/dashboard`, `/me`, `/logout`, `/api/perfil`.
  - `src/configuracion.js`, `src/middlewares/*`, `src/servicios/*`, `src/vistas/*`.
- `tests/idp/` – pruebas unitarias e integración para el IdP.

## Configuración de entorno
- `idp/.env` (ejemplo incluido):
  - `BASE_URL=http://127.0.0.1:4000`
  - `JWT_SECRET=super-secreto-solo-lab`
- `client/.env` (ejemplo incluido):
  - `IDP_BASE=http://127.0.0.1:4000`
  - `BASE_URL=http://127.0.0.1:3000`

## Instalación
Instala dependencias en cada servicio (IdP y Cliente):

```bash
cd idp && npm install
cd ../client && npm install
```

Para ejecutar las pruebas del IdP desde la raíz del repo:

```bash
npm install
node --test
```

### Scripts en la raíz
- `npm run start:idp` → inicia solo el IdP
- `npm run start:client` → inicia solo el Cliente
- `npm start` → inicia IdP y Cliente en paralelo con `concurrently`

## Ejecución
En dos terminales separadas:

Terminal A (IdP):
```bash
cd idp
npm start
```
IdP en `http://127.0.0.1:4000`

Terminal B (Cliente):
```bash
cd client
npm start
```
Cliente en `http://127.0.0.1:3000`

Usuario de prueba del IdP: `demo@lab.local` / `demo`.

## Despliegue en Ubuntu Server (VM) y acceso externo
Sigue estos pasos para que la demo sea visible fuera de la VM.

1) Red de la VM
- Opción 1 (recomendada): Adaptador en modo Puente (Bridged) → la VM obtiene IP propia en tu red (ej. `192.168.x.y`).
- Opción 2: NAT con reglas de redirección de puertos (Port Forwarding):
  - Redirige host:3000 → vm:3000 y host:4000 → vm:4000.

2) Instalar Node.js 20+
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
node -v && npm -v
```

3) Obtener el proyecto y dependencias
```bash
sudo apt -y install git
git clone <URL_DEL_REPO>
cd sso
npm install
cd idp && npm install
cd ../client && npm install
```

4) Configurar `.env` con la IP de la VM
- Edita `idp/.env` y `client/.env` para usar la IP real de la VM (no `127.0.0.1`):
  - `idp/.env` → `BASE_URL=http://<IP_VM>:4000`
  - `client/.env` → `IDP_BASE=http://<IP_VM>:4000` y `BASE_URL=http://<IP_VM>:3000`

5) Abrir firewall (UFW)
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 4000/tcp
sudo ufw enable   # solo si aún no estaba activo
sudo ufw status
```

6) Lanzar los servicios
```bash
cd /ruta/al/repo/sso
npm start
```
- IdP escuchando en `http://<IP_VM>:4000`
- Cliente en `http://<IP_VM>:3000`

7) Probar desde fuera de la VM
- Navega desde tu equipo anfitrión a `http://<IP_VM>:3000` y sigue el flujo de login.

8) (Opcional) Ejecutar como servicios con PM2
```bash
sudo npm i -g pm2
cd /ruta/al/repo/sso
pm2 start idp/server.js --name sso-idp
pm2 start client/server.js --name sso-client
pm2 save
pm2 startup systemd    # sigue las instrucciones que imprime
```

Notas:
- Express escucha en todas las interfaces por defecto (`0.0.0.0`) cuando llamas `app.listen(puerto)`, por lo que no necesitas cambios de código para acceso externo.
- Si usas NAT sin reglas, no será accesible desde fuera. Usa Bridged o configura Port Forwarding.

## SSL con Caddy + DuckDNS
Objetivo: exponer `client` e `idp` con HTTPS usando Caddy como reverse proxy y un subdominio de DuckDNS.

1) Crear subdominios en DuckDNS
- Regístrate en https://www.duckdns.org y crea subdominios, por ejemplo:
  - `app-<tusiglas>.duckdns.org` para el Cliente
  - `idp-<tusiglas>.duckdns.org` para el IdP
- Guarda tu `token` de DuckDNS.

2) Actualizar IP pública en DuckDNS
- Crea un script de actualización (cada 5 min):
```bash
mkdir -p ~/duckdns
cat > ~/duckdns/duck.sh << 'EOF'
#!/usr/bin/env bash
DOMAINS="app-<tusiglas>,idp-<tusiglas>"   # sin .duckdns.org
TOKEN="<TU_TOKEN>"
echo url="https://www.duckdns.org/update?domains=${DOMAINS}&token=${TOKEN}&ip=" | curl -k -o ~/duckdns/duck.log -K -
EOF
chmod +x ~/duckdns/duck.sh
crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1" | crontab -
```

3) Abrir firewall y puertos para ACME
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

4) Instalar Caddy (Ubuntu)
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

5) Configurar Caddyfile
- Edita `/etc/caddy/Caddyfile` y apunta a los servicios locales:
```
app-<tusiglas>.duckdns.org {
    reverse_proxy 127.0.0.1:3000
}

idp-<tusiglas>.duckdns.org {
    reverse_proxy 127.0.0.1:4000
}
```
- Aplica cambios: `sudo systemctl reload caddy` (o `sudo systemctl restart caddy`).

6) Ajustar `.env` a HTTPS y dominios
- `client/.env`:
  - `IDP_BASE=https://idp-<tusiglas>.duckdns.org`
  - `BASE_URL=https://app-<tusiglas>.duckdns.org`
- `idp/.env`:
  - `BASE_URL=https://idp-<tusiglas>.duckdns.org`

7) Cookies seguras detrás de proxy (recomendado)
- En producción, usa `secure: true` en las cookies de sesión y activa `trust proxy` en Express:
  - Cliente (`client/server.js`): `app.set('trust proxy', 1)` y en la config de `session` poner `cookie.secure: true`.
  - IdP (`idp/server.js`): idem.
- Con Caddy terminando TLS, el tráfico entre Caddy y Node es local (HTTP) pero el cliente navega por HTTPS, por eso es necesario `trust proxy` para que Express marque cookies `secure` correctamente.

8) Verificación
- Abre `https://app-<tusiglas>.duckdns.org` y realiza el flujo de login (debe redirigir a `https://idp-<tusiglas>.duckdns.org/login`).
- Certificados deberían generarse automáticamente (Let’s Encrypt, desafío HTTP-01 en puerto 80).

## Flujo (resumen)
1) El cliente hace GET a `/login` → redirige a `IDP /authorize` con `client_id`, `redirect_uri` y `state` aleatorio guardado en sesión.
2) Si no hay sesión en el IdP, el usuario inicia sesión en `/login` (IdP).
3) El IdP emite un `code` corto y redirige a `redirect_uri` del cliente con `code` y `state`.
4) El cliente verifica `state`, intercambia el `code` por un `access_token` (JWT) en `IDP /token` y guarda el token en su sesión.
5) Vistas y API del cliente validan presencia de token en sesión (no se valida firma en el cliente en este ejemplo simplificado) y muestran info del usuario decodificando el JWT.

## Endpoints principales
- IdP (`idp/`):
  - `GET /login` (form), `POST /login`
  - `GET /authorize` → redirige a `redirect_uri` con `code` y opcional `state`
  - `POST /token` (x-www-form-urlencoded) → `{ access_token, token_type, expires_in }`
  - `GET /userinfo` (JSON) y `GET /me` (HTML)
  - `GET /logout`
- Cliente (`client/`):
  - `GET /` (home), `GET /login`, `GET /callback`
  - `GET /dashboard`, `GET /me`, `GET /logout`
  - `GET /api/perfil` (JSON, requiere sesión)

## Pruebas
Desde la raíz, ejecuta:

```bash
npm install
node --test
```

Incluye tests para:
- `config.js` (exports básicos)
- `storage.js` (usuarios y códigos en memoria)
- `tokenService.js` (firma y claims JWT con `jose`)
- `routes.js` (flujo `/login` → `/authorize` → `/token` usando `supertest`)

## Notas y seguridad (importante)
- Demo educativa: no usar en producción.
- Sin HTTPS, sin PKCE, usuarios y códigos en memoria, cookie `secure: false`, HS256 con secreto compartido.
- En producción usa OIDC real (p. ej. Keycloak), HTTPS, Authorization Code + PKCE, validación de tokens en backend, rotación de tokens, etc.

## Solución de problemas
- Puertos ocupados: cambia `BASE_URL` de cada `.env` o cierra procesos en 3000/4000.
- Node < 18: instala una versión reciente (se usa `fetch` y `node:test`).
- Errores de `state` en el cliente: borra cookies de `cliente.sid` y reintenta el login.
- No se ve desde fuera: verifica IP de la VM, modo de red (Bridged/port forwarding), `ufw status`, y que los procesos estén escuchando (`ss -tulpn | grep -E '3000|4000'`).
