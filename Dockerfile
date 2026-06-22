FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm rebuild bcrypt

COPY --from=build /app/build ./build
COPY api ./api
COPY data ./data
COPY public ./public
COPY config.js knexfile.js server.js ./

EXPOSE 8080

CMD ["npm", "start"]
