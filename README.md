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
