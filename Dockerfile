FROM node:18.15.0-alpine3.17 as builder

WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN npm install -g migrate-mongo --force
RUN npm install
# RUN npm run build

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
