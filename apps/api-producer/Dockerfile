###
###   EXPRESSJS
###

# global variables
ARG NODE=node:20.15.0-alpine
ARG NODE_ENV='production'
ARG PORT=8081
ARG HOSTNAME='0.0.0.0'
ARG TIME_ZONE='America/New_York'
ARG LANG='en_US.UTF-8'
ARG APP_DIR='/app/'
ARG BUILD_DIR='dist'
ARG TURBO_VERSION=2.0.5
ARG SERVICE_PKG_NAME='@demo/api-producer'

FROM ${NODE} AS base

##
## STAGE 1: builder
##
FROM base AS builder

ARG APP_DIR
ARG TURBO_VERSION
ARG SERVICE_PKG_NAME

WORKDIR ${APP_DIR}

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update
RUN apk add --no-cache libc6-compat
# Intall Turbo
RUN echo "Installing turbo..."
RUN npm install -g turbo@${TURBO_VERSION}

COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune ${SERVICE_PKG_NAME} --docker

##
## STAGE 2: installer
##
FROM base AS installer
ARG APP_DIR
ARG NODE_ENV=development
ARG SERVICE_PKG_NAME
ARG ENV

RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR ${APP_DIR}

# Prepares source files
RUN echo "Copying turbo install files..."
COPY --from=builder ${APP_DIR}out/json/ ./
COPY --from=builder ${APP_DIR}out/package-lock.json ./package-lock.json
# Install dependencies
RUN echo "Installing dependencies in ${NODE_ENV} mode..."
RUN npm pkg delete scripts.prepare
RUN npm install

# Build the project and its dependencies
COPY --from=builder ${APP_DIR}out/full/ .
COPY turbo.json turbo.json
ENV NODE_ENV production
RUN npx turbo run build:${ENV} --filter=${SERVICE_PKG_NAME}

# Removes unnecessary files and dependencies (https://github.com/tj/node-prune)
RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune
RUN rm -rf \
  'package.json' \
  'pnpm-lock.yaml'

##
## STAGE 2: exec
##
FROM base AS runner

ARG APP_DIR
ARG LANG
ARG TIME_ZONE
ARG NODE_ENV
ARG PORT
ARG HOSTNAME
ARG ENV
ARG SERVICE_PKG_NAME
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

WORKDIR ${APP_DIR}

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
# non root user mode
USER expressjs

# Prepares source files
RUN echo "Copying built files..."
# Copy built files
COPY --from=installer ${APP_DIR} ./

EXPOSE ${PORT}/tcp

# set environment variables
# Inject AWS credentials as environment variables
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV HOSTNAME=${HOSTNAME}
ENV LANG=${LANG}
ENV TZ=${TIME_ZONE}
ENV ENV=${ENV}

# exec command
RUN echo "Running the service in ${NODE_ENV} mode..."
CMD ["node", "apps/worker-consumer/dist/index.js"]
