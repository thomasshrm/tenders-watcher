# base
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# deps
FROM base AS deps
COPY package*.json ./
RUN npm ci

# build (TS -> JS)
FROM base AS build
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# dev runtime
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm i --save-dev ts-node nodemon @types/node
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
# le .env sera monté par docker-compose
EXPOSE 5175
CMD ["npm","run","dev"]

# prod runtime
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=build /app/dist ./dist
EXPOSE 5175
CMD ["node","dist/index.js"]