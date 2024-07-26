###
###   EXPRESSJS
###     API Service Consumer for MonoRepo
###       Build with Turborepo and PNPM
###

# global variables
ARG NODE=node:20.15.0-alpine
ARG NODE_ENV='production'
# ARG PORT=8080
ARG HOSTNAME='0.0.0.0'
ARG TIME_ZONE='America/New_York'
ARG LANG='en_US.UTF-8'
ARG APP_DIR='/app/'
ARG BUILD_DIR='dist'
ARG PUBLIC_DIR='public'
ARG PNPM_VERSION=8.14.0
ARG TURBO_VERSION=2.0.5
ARG PKG_NAME='@demo/worker-consumer'

##
## STAGE 0: base config
##
FROM ${NODE} AS base

ARG APP_DIR
ARG NODE_ENV
ARG TURBO_VERSION
ARG PNPM_VERSION
ARG PKG_NAME

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR ${APP_DIR}

RUN npm i -g pnpm@${PNPM_VERSION} turbo@${TURBO_VERSION}
COPY . .

# Add workspaces to the out directory
# @doc: https://turbo.build/repo/docs/guides/tools/docker
RUN turbo prune ${PKG_NAME} --docker

##
## STAGE 1: build
##
FROM base AS builder

ARG APP_DIR
ARG PUBLIC_DIR
ARG NODE_ENV
ARG PKG_NAME
ARG ENV

WORKDIR ${APP_DIR}

# Prepares source files
RUN echo "Copying necessary files from base image"
COPY --from=base ${APP_DIR}out/json .

# Build the app
RUN echo "Installing dependencies and building the app"
ENV NODE_ENV=${NODE_ENV}
RUN pnpm install --no-frozen-lockfile --ignore-scripts --no-optional
COPY --from=base ${APP_DIR}out/full .
RUN pnpm turbo run build:${ENV} --filter=${PKG_NAME}

# Removes unnecessary files and dependencies (https://github.com/tj/node-prune)
RUN echo "Removing unnecessary files and dependencies"
RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune
RUN rm -rf \
  'node_modules/.bin'

##
## STAGE 3: exec
##
FROM base AS exec

ARG APP_DIR
ARG LANG
ARG TIME_ZONE
ARG NODE_ENV
# ARG PORT
ARG HOSTNAME
ARG BUILD_DIR
ARG PUBLIC_DIR

WORKDIR ${APP_DIR}

# creates user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder ${APP_DIR}${PUBLIC_DIR} ./${PUBLIC_DIR}
# Automatically leverage output traces to reduce image size
# https://expressjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=expressjs:nodejs ${APP_DIR}${BUILD_DIR} .

# alpine security updates
RUN apk --no-cache -U upgrade

# non root user mode
USER expressjs
# EXPOSE ${PORT}/tcp # Consumer does not need to expose a port

# set environment variables
ENV NODE_ENV=${NODE_ENV}
# ENV PORT=${PORT}
ENV HOSTNAME=${HOSTNAME}

# exec command
CMD ["node", "index.js"]
