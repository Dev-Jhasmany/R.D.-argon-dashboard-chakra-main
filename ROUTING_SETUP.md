# Configuración de Routing - URLs Limpias sin Hash (#)

## Cambios Realizados

Se ha configurado la aplicación para usar **BrowserRouter** en lugar de **HashRouter**, eliminando el símbolo `#` de las URLs.

### URLs Anteriores (con Hash)
```
http://34.135.23.61:3001/#/customer/shop
http://34.135.23.61:3001/#/admin/dashboard
http://34.135.23.61:3001/#/auth/signin
```

### URLs Nuevas (sin Hash)
```
http://34.135.23.61:3001/customer/shop
http://34.135.23.61:3001/admin/dashboard
http://34.135.23.61:3001/auth/signin
```

---

## Archivos Modificados

### 1. **src/index.js**
- Cambiado `HashRouter` por `BrowserRouter`
- Importación actualizada de `react-router-dom`

### 2. **server.js** (Nuevo)
- Servidor Express para producción
- Maneja todas las rutas y devuelve `index.html`
- Permite que React Router maneje las rutas en el cliente

### 3. **package.json**
- Agregada dependencia: `express: ^4.18.2`
- Nuevo script: `start:prod` - Ejecuta el servidor Express
- Script `deploy` actualizado: construye y ejecuta en producción

### 4. **Dockerfile**
- Actualizado para construir la aplicación
- Ejecuta `npm run start:prod` usando el servidor Express

---

## Instalación y Uso

### Desarrollo (con react-scripts)
```bash
npm start
```
Esto ejecutará el servidor de desarrollo en `http://localhost:3001` con soporte completo para BrowserRouter.

### Producción (con Express)

#### Instalar Express
```bash
npm install --legacy-peer-deps
```

#### Construir y ejecutar
```bash
npm run build
npm run start:prod
```

#### O usar el script de deploy
```bash
npm run deploy
```

---

## Docker

### Desarrollo
```bash
docker-compose up
```

### Producción (reconstruir imagen)
```bash
docker-compose down
docker-compose build
docker-compose up
```

---

## Importante: Configuración del Servidor

Para que las URLs limpias funcionen correctamente en producción, el servidor **debe** redirigir todas las peticiones a `index.html`. Esto ya está configurado en:

1. **Servidor Express (`server.js`)**: Maneja todas las rutas con el comodín `/*`
2. **React Scripts (desarrollo)**: Ya tiene soporte nativo para BrowserRouter

### ¿Por qué es necesario?

Cuando un usuario visita `http://34.135.23.61:3001/customer/shop` directamente (o recarga la página):
- El navegador hace una petición HTTP GET a `/customer/shop`
- El servidor debe devolver el archivo `index.html` (no un error 404)
- React Router carga y renderiza el componente correcto basado en la ruta

---

## Verificación

1. **Desarrollo**: Ejecuta `npm start` y visita rutas como:
   - http://localhost:3001/customer/shop
   - http://localhost:3001/admin/dashboard

2. **Producción**: Ejecuta `npm run deploy` y verifica:
   - http://34.135.23.61:3001/customer/shop
   - Recarga la página (F5) - debe seguir funcionando

---

## Notas Adicionales

- El servidor Express escucha en todas las interfaces (`0.0.0.0`) para permitir acceso desde Google Cloud
- El puerto por defecto es `3001`, configurable con la variable de entorno `PORT`
- Las rutas del backend (puerto 3000) no se ven afectadas por este cambio
