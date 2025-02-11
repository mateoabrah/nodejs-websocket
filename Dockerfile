# Usar la imagen oficial de Node.js
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar los archivos del proyecto al contenedor
COPY . .

# Instalar las dependencias
RUN npm install

# Exponer el puerto en el que correrá la app
EXPOSE 8082

# Comando por defecto para correr la app
CMD ["node", "server.js"]

