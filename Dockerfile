FROM node:18.15.0-alpine3.17 as builder

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN npm install
# RUN npm run build

COPY . .

EXPOSE 3000
EXPOSE 27017

CMD ["npm", "start"]
