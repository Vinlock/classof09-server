FROM node:latest as build

ENV NODE_ENV=production

WORKDIR /var/app

COPY ./app/ /var/app/app/
COPY ./package.json /var/app/package.json
COPY ./yarn.lock /var/app/yarn.lock
RUN yarn install

FROM node:latest

ENV NODE_ENV=production

WORKDIR /var/app

COPY --from=build /var/app/app/ ./app/
COPY --from=build /var/app/node_modules/ ./node_modules/
COPY --from=build /var/app/package.json ./package.json

CMD ["yarn", "start"]
