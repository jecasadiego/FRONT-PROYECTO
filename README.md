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

## Deploy en GitHub Pages

El proyecto queda preparado para publicarse en GitHub Pages usando GitHub Actions.

- URL esperada: `https://jecasadiego.github.io/FRONT-PROYECTO/`
- API de produccion: `https://api-proyecto-2-jb7u.onrender.com/api/v1`
- El frontend usa `HashRouter` para evitar errores de rutas al recargar en GitHub Pages.

Pasos:

1. En GitHub, entra al repositorio `FRONT-PROYECTO`.
2. Ve a `Settings > Pages`.
3. En `Build and deployment`, selecciona `Source: GitHub Actions`.
4. Haz push a `main`.
5. Espera a que el workflow publique el contenido.

El workflow vive en `.github/workflows/deploy-pages.yml`.

## Modulos implementados

- Resumen general del sistema
- CRUD de generos
- CRUD de directores
- CRUD de productoras
- CRUD de tipos
- CRUD y filtros de peliculas/series
