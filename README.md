# Plataforma de autenticacion y gestion

Proyecto full stack con `frontend` y `backend` separados.

## Backend

- `Express` para API REST
- `SQLite` como base de datos local
- DTOs para entrada y salida
- Repositorios para acceso a datos

Estructura principal:

- `backend/src/database`
- `backend/src/dtos`
- `backend/src/repositories`
- `backend/src/services`
- `backend/src/routes`
- `backend/src/middleware`

## Modulos

- Login
- Registro
- Recuperacion y restablecimiento de contrasena
- CRUD de usuarios
- CRUD de clientes
- CRUD de proveedores

## Ejecutar

```bash
npm run dev:backend
```

En otra terminal:

```bash
npm run dev:frontend
```

## URLs

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:3000`

## Notas

- La recuperacion de contrasena genera un token de restablecimiento y lo muestra en la respuesta para entorno local.
- La base de datos se crea automaticamente en `backend/data/app.sqlite`.
- El usuario inicial es `admin@local.dev / Admin1234`.

## UX y UI

- El frontend fue reorganizado con mejor jerarquia visual, feedback global persistente y panel administrativo con resumen operativo.
- La sesion activa se muestra en el encabezado del dashboard para reducir perdida de contexto.
- Cada modulo mantiene formulario independiente, estados vacios mas claros y listados paginados con informacion mas legible.
- Los formularios usan etiquetas visibles, `autocomplete`, validaciones basicas y estados de carga en acciones criticas.

## Seguridad

- El token de autenticacion expira automaticamente segun `AUTH_TOKEN_TTL_MS`.
- La sesion del frontend se mantiene solo en memoria; no se persiste en `localStorage` ni `sessionStorage`.
- El backend aplica `security headers`, CORS restringido por origen permitido y `rate limit` basico sobre `/api/auth`.
- Las respuestas de autenticacion usan `Cache-Control: no-store` para evitar cacheo accidental.
- El cuerpo JSON del backend se limita a `10kb` para reducir superficie de abuso.

## Troubleshooting

- Si aparece `ENOENT: no such file or directory, open '.../backend/src/data/database.json'`, entonces no se esta ejecutando este backend actual, sino una version anterior basada en JSON.
- La version vigente usa `SQLite` y debe iniciar mostrando en consola la linea `Base SQLite activa: .../backend/data/app.sqlite`.
- Para evitar ese conflicto, deten cualquier proceso viejo y vuelve a iniciar solo con:

```bash
npm run dev:backend
```
