FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Remove source files after build
RUN rm -rf src

EXPOSE 5004

CMD ["npm", "start"]