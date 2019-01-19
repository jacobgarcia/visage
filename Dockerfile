FROM node:8-jessie

RUN mkdir /usr/share/app

WORKDIR /usr/share/app

COPY package*.json ./
RUN npm i

# Set after install
ENV NODE_ENV production

COPY . .

# Build app
RUN npm run build:prod

EXPOSE 8080

CMD ["npm", "run", "serve:docker"]
