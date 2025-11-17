FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Construir la aplicación para producción
RUN npm run build

EXPOSE 3001

# Usar el servidor Express para servir la aplicación con soporte para BrowserRouter
CMD ["npm", "run", "start:prod"]
