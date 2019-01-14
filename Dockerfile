FROM node:8-jessie

ENV NODE_ENV production

RUN mkdir /usr/share/app
COPY . /usr/share/app
WORKDIR /usr/share/app

RUN yarn global add pm2
RUN yarn install
RUN yarn build:prod
CMD ["yarn", "start:docker"]

EXPOSE 8080
