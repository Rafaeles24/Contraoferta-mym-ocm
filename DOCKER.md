# Ejecución con Docker

El proyecto contiene exactamente dos servicios:

- `frontend`: Next.js, publicado por defecto en `3000`.
- `backend`: NestJS, publicado por defecto en `3001`.

## 1. Variables del backend

El backend se configura en `backend/.env`. El archivo ya existe en este proyecto y Docker Compose lo carga únicamente al ejecutar el contenedor; `.dockerignore` evita copiarlo dentro de la imagen.

Si necesitas recrearlo desde cero, usa `backend/.env.example` como plantilla.

Para permitir el formulario desde otro dominio, IP o puerto, actualiza `CORS_ORIGINS` en `backend/.env`, separando varios orígenes con comas.

Ejemplo:

```env
CORS_ORIGINS=http://192.168.1.50:3000,https://contraoferta.midominio.com
```

## 2. URL pública del backend usada por Next.js

`NEXT_PUBLIC_BACKEND_API_URL` se incrusta durante el build del frontend. En local el valor predeterminado es:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001
```

Si vas a desplegar en un servidor, crea un archivo `.env` en la raíz a partir de `.env.example` y coloca una URL accesible desde el navegador del usuario. No uses `http://backend:3001` para esta variable, porque `backend` solo es resoluble dentro de la red de Docker.

Después de cambiar `NEXT_PUBLIC_BACKEND_API_URL`, reconstruye el frontend.

## 3. Construir y levantar

Desde la carpeta raíz `mymcontraoferta`:

```bash
docker compose up -d --build
```

Comprobar estado:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f
```

Solo backend:

```bash
docker compose logs -f backend
```

Solo frontend:

```bash
docker compose logs -f frontend
```

## 4. Acceso local

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/system/api`

## 5. Detener

```bash
docker compose down
```

Reconstrucción limpia:

```bash
docker compose build --no-cache
docker compose up -d
```
