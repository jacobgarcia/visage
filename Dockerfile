FROM node:8-jessie

ENV NODE_ENV production

RUN mkdir /usr/share/app

WORKDIR /usr/share/app

COPY package*.json ./
RUN npm i

COPY . .

RUN npm i
RUN npm run build:prod

EXPOSE 8080

CMD ["npm", "run", "start:docker"]
