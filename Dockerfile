FROM node:20.2.0-alpine3.18 as builder
WORKDIR /app
COPY . .
RUN yarn install
RUN npx prisma generate
RUN yarn run compile

FROM node:20.2.0-alpine3.18 as final
WORKDIR /app
COPY --from=builder /app/build ./build
COPY package.json .
COPY yarn.lock .
COPY ./assets ./assets
COPY prisma ./prisma
RUN yarn install --production
RUN npx prisma generate
RUN npx prisma migrate deploy

CMD [ "yarn", "start" ]
