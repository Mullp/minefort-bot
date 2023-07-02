FROM arm64v8/node:20.2.0-alpine3.18 as builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn run compile

FROM arm64v8/node:20.2.0-alpine3.18 as final
WORKDIR /app
COPY --from=builder /app/build ./build
COPY package.json .
COPY yarn.lock .
COPY ./assets ./assets
COPY prisma ./prisma
RUN yarn install --production

CMD [ "yarn", "start:migrate:prod" ]
