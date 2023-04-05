FROM node:18.15.0-alpine3.17 as builder

WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/app/dist ./dist

COPY .env .

EXPOSE 4000

CMD ["npm", "start"]
