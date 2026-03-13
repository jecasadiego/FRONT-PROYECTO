# Front Proyecto

Aplicacion web en React para administrar los modulos `Genero`, `Director`, `Productora`, `Tipo` y `Media`

## Requisitos

- Node.js 22 o superior
- La API corriendo en `http://localhost:3000`

## Configuracion

1. Crear un archivo `.env` basado en `.env.example`.
2. Verificar que `VITE_API_BASE_URL` apunte a `http://localhost:3000/api/v1`.

## Comandos

```bash
npm install
npm run dev
```

Para generar la version de produccion:

```bash
npm run build
```

## Modulos implementados

- Resumen general del sistema
- CRUD de generos
- CRUD de directores
- CRUD de productoras
- CRUD de tipos
- CRUD y filtros de peliculas/series
