FROM node:20-alpine

WORKDIR /app

# Instalar dependencias de compilación para paquetes nativos si se requieren
RUN apk add --no-cache libc6-compat

# Copiar archivos de definición de paquetes
COPY package.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "dev"]
