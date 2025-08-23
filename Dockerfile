# Etapa base
FROM node:20.18.1-alpine3.19

# Crear directorio de trabajo
WORKDIR /app/

# Copiar archivos
COPY package*.json .

RUN npm install

# Copiar el resto del código fuente
COPY . .

# Ejecutar la app en modo desarrollo
CMD ["npm","run","dev" , "--", "--host"]

#ENV
ENV VITE_API_URL='http://localhost:3000'
