FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Construir la aplicación para producción (comentado para desarrollo)
# RUN npm run build

EXPOSE 3001

# Modo desarrollo
CMD ["npm", "start"]
