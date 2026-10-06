FROM node:22.22.3

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD [ "npm", "start"]