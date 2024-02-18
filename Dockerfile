FROM node:16.14.2-alpine AS base

WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]

FROM base AS dev
ENV NODE_ENV=development
RUN npm ci
COPY . .
CMD ["npm", "run", "start:dev"]

FROM dev AS test
ENV NODE_ENV=test
CMD ["npm", "run", "test"]

FROM test AS test-cov
CMD ["npm", "run", "test:cov"]

FROM dev AS test-watch
ENV GIT_WORK_TREE=/app GET_DIR=/app/.git
RUN apk add git
CMD ["npm", "run", "test:watch"]

FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --only=production
COPY . .
RUN npm install -g @nestjs/cli
RUN npm run build
CMD ["npm", "run", "start:prod"]
