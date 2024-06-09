FROM node:18.16.0-alpine

RUN mkdir -p /app
WORKDIR /app
COPY jest-image-snapshot-manager-back/ ./

RUN npm install
RUN npm run build
RUN npm install --save-optional \
    "@swc/core-darwin-arm64" \
    "@swc/core-darwin-x64" \
    "@swc/core-linux-arm-gnueabihf" \
    "@swc/core-linux-arm64-gnu" \
    "@swc/core-linux-arm64-musl" \
    "@swc/core-linux-x64-gnu" \
    "@swc/core-linux-x64-musl" \
    "@swc/core-win32-arm64-msvc" \
    "@swc/core-win32-ia32-msvc" \
    "@swc/core-win32-x64-msvc"

EXPOSE $PORT
ENV TZ=$UTC
ENV PORT=$PORT
ENV HOST=$HOST
ENV LOG_LEVEL=$LOG_LEVEL
ENV APP_KEY=$APP_KEY
ENV NODE_ENV=$NODE_ENV
ENV SQLITE_FILE=$SQLITE_FILE

RUN node ace migration:run && node ace db:seed
CMD [ "npm",  "run", "start" ]