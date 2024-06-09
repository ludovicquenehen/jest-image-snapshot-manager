FROM node:18.16.0-alpine
RUN npm install -g pnpm
RUN mkdir -p /app
WORKDIR /app
COPY jest-image-snapshot-manager-front/ .

RUN pnpm install
RUN pnpm build
EXPOSE $PORT

ENV PROXY_API=$PROXY_API

CMD [ "npm", "run", "preview" ]