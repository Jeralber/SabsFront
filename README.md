# SABS - Frontend (React + Vite + HeroUI)

Aplicación frontend del sistema SABS construida con React 18, Vite 5, TypeScript, Tailwind CSS 4 y HeroUI. Implementa autenticación basada en cookies/sesión, control de permisos/roles, rutas protegidas, reportes y notificaciones en tiempo real con Socket.IO.

## Tecnologías

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 4 + HeroUI
- TanStack React Query
- React Router DOM 6
- Axios
- Socket.IO Client
- Chart.js / react-chartjs-2
- ESLint + Prettier

## Requisitos previos

- Node.js 18 o superior
- npm (recomendado para este proyecto)

## Credenciales de inicio de sesión

Para acceder al sistema en ambiente de desarrollo, puedes usar las siguientes credenciales:

- Correo: admin@gmail.com
- Contraseña: LOUR1234

Nota: Por seguridad, actualiza o elimina estas credenciales para entornos de producción.

## Descarga e instalación

1) Clona el repositorio
```bash
git clone https://github.com/Jeralber/SabsFront.git
```

2) Entra a la carpeta del proyecto
```bash
cd SabsFront
```

3) Instala dependencias
```bash
npm install
```

Nota: Este repo incluye un `.npmrc` con `package-lock=true`, por lo que se recomienda usar npm. Si prefieres pnpm y tienes problemas con paquetes de HeroUI, puedes añadir a tu `.npmrc`:
```bash
public-hoist-pattern[]=*@heroui/*
```

## Configuración de entorno

Crea un archivo `.env` en la raíz del proyecto con la URL base de tu API:

```plaintext
VITE_API_URL=http://localhost:3000
```

- Esta URL se usa como base para todas las peticiones HTTP y también para el namespace de notificaciones (`/notifications`).
- La app utiliza cookies/sesión (`withCredentials: true`). Asegúrate de que tu backend:
  - Exponga endpoints: `/auth/login`, `/auth/me`, `/auth/logout`.
  - Tenga CORS configurado para permitir `credentials` y el origen del frontend.
  - Emita/valide sesión mediante cookies.

## Scripts disponibles

- Desarrollo (hot reload):
```bash
npm run dev
```

- Linter (con autofix):
```bash
npm run lint
```

- Build de producción:
```bash
npm run build
```

- Vista previa del build:
```bash
npm run preview
```

## Ejecución

1) Asegúrate de tener la API corriendo en la URL configurada en `VITE_API_URL`.
2) Arranca el frontend:
```bash
npm run dev
```
3) Abre el navegador en la URL que muestre Vite (por defecto suele ser http://localhost:5173).

## Autenticación, permisos y rutas protegidas

- La autenticación se maneja en el contexto de <mcfile name="AuthContext.tsx" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\src\context\AuthContext.tsx"></mcfile>, consultando el backend mediante <mcfile name="authService.ts" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\src\services\authService.ts"></mcfile>.
- Se consumen los endpoints:
  - POST `/auth/login` (envía `{ correo, contrasena }` al backend)
  - GET `/auth/me` (para recuperar la sesión)
  - POST `/auth/logout`
- Rutas protegidas:
  - <mcfile name="PrivateRoute.tsx" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\src\routes\PrivateRoute.tsx"></mcfile> bloquea el acceso si no hay sesión.
  - <mcfile name="ProtectedRoute.tsx" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\src\routes\ProtectedRoute.tsx"></mcfile> valida permisos por módulo o permisos específicos. Usuarios admin tienen acceso total.

## Notificaciones en tiempo real

- El cliente Socket.IO se conecta al namespace `/notifications` de tu backend usando la misma `VITE_API_URL`. Implementación en <mcfile name="socket-notifications.ts" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\src\lib\socket-notifications.ts"></mcfile>.
- Requiere que el backend exponga ese namespace y configure CORS/credenciales.

## Estilos y UI

- Tailwind 4 y HeroUI están configurados en:
  - <mcfile name="tailwind.config.js" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\tailwind.config.js"></mcfile>
  - <mcfile name="vite.config.ts" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\vite.config.ts"></mcfile>
  - Tema oscuro controlado por <mcfile name="ThemeContext.tsx" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\src\context\ThemeContext.tsx"></mcfile>.

## Estructura del proyecto (resumen)

- src/
  - App.tsx: Rutas principales y proveedores globales (React Query, Toast, Layout).
  - pages/: Páginas (Áreas, Centros, Materiales, Personas, Reportes, etc.).
  - components/: UI reutilizable (atoms, molecules, organisms).
  - context/: Contextos globales (Auth, Theme).
  - hooks/: Hooks (CRUD, permisos, módulos de dominio).
  - services/: Acceso a API por recurso (axios).
  - lib/: Integraciones (axios configurado, socket).
  - layout/: Navbar, Sidebar, Layout principal.
  - routes/: Rutas protegidas (PrivateRoute, ProtectedRoute).
  - types/: Tipos/DTOs por entidad.
  - styles/: CSS global.

## Configuración de Axios

- Axios está centralizado en <mcfile name="axios.tsx" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\src\lib\axios.tsx"></mcfile> con:
  - `baseURL: import.meta.env.VITE_API_URL`
  - `withCredentials: true`
- Asegúrate que `VITE_API_URL` apunte a tu backend y que éste permita cookies con CORS.

## Despliegue

- SPA compatible con Vercel (reescrituras) configurado en <mcfile name="vercel.json" path="c:\Users\JORO\Documents\Proyectos\Api de Angela\FullStack\Front-Sabs\vercel.json"></mcfile>.
- Pasos generales:
  1) Configura la variable de entorno `VITE_API_URL` en tu plataforma de despliegue.
  2) Ejecuta el build:
```bash
npm run build
```
  3) Sirve el contenido de `dist/` (Vercel/Netlify/NGINX).

## Solución de problemas

- 401/403 tras login:
  - Verifica que `VITE_API_URL` es correcto.
  - Revisa CORS del backend (origen del frontend + `credentials` habilitados).
  - Endpoints `/auth/login`, `/auth/me`, `/auth/logout` disponibles.
- La UI no aplica estilos de HeroUI/Tailwind:
  - Revisa que `tailwind.config.js` contenga los paths de `src` y el plugin de HeroUI.
  - Asegúrate de importar `src/styles/globals.css` en `src/main.tsx`.
- Socket de notificaciones no conecta:
  - Comprueba que el backend exponga `/<notifications>` y CORS para websockets.
  - Valida que `VITE_API_URL` no tenga barra final extra (el cliente ya la maneja).
- Error de versiones:
  - Usa Node 18+ y reinstala dependencias:
```bash
npm install
```

## Licencia

Este proyecto está licenciado bajo MIT. Revisa el archivo LICENSE en la raíz del repositorio.