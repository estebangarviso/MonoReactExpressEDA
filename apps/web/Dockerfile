###
###   NGINX: REACT using VITE
###

# global variables
# https://hub.docker.com/_/node
ARG ALPINE=node:20.13.1-alpine
# https://hub.docker.com/_/nginx
ARG NGINX=nginx:1.25.5-alpine
ARG PORT=8080
ARG APP_DIR='/app/'
ARG WEB_DIR='apps/web/'
ARG OUT_DIR='dist'
ARG SERVICE_PKG_NAME='@demo/web'

FROM ${ALPINE} AS base

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
    'pnpm-lock.yaml' \
    'node_modules/.bin'

##
## STAGE 3: exec
##
FROM ${NGINX}

ARG APP_DIR
ARG WEB_DIR
ARG OUT_DIR
ARG PORT
# static assets dir
WORKDIR '/usr/share/nginx/html'
# retrieves build app
RUN rm -rf ./*
COPY --from=installer ${APP_DIR} ${APP_DIR}
COPY --from=builder ${APP_DIR}'apps/web/nginx.conf' '/etc/nginx/conf.d/default.conf'
# Create a symbolic link to built app
RUN ln -s ${APP_DIR}${WEB_DIR}${OUT_DIR} ./
# alpine security updates
RUN apk --no-cache -U upgrade

# expose port
ENV PORT=${PORT}
EXPOSE ${PORT}/tcp
# exec command
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
