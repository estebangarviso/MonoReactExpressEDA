###
###   NGINX: REACT using VITE
###

# global variables
# https://hub.docker.com/_/node
ARG ALPINE=node:20.13.1-alpine
# https://hub.docker.com/_/nginx
ARG NGINX=nginx:1.25.5-alpine
ARG PORT=8080
ARG PNPM_VER=9.1.3
ARG APP_DIR='/app/'
ARG OUT_DIR='dist'

##
## STAGE 1: build
##
FROM ${ALPINE} AS builder

ARG APP_DIR
ARG OUT_DIR
ARG ENV

WORKDIR ${APP_DIR}

# installs pnpm
RUN echo "Installing and building the app"
RUN npm i -g pnpm@${PNPM_VER}
# prepares source files
COPY . ${APP_DIR}
RUN pnpm install --frozen-lockfile
# builds the app
ENV NODE_ENV production
RUN pnpm build:${ENV}

##
## STAGE 2: exec
##
FROM ${NGINX}

ARG APP_DIR
ARG OUT_DIR
ARG PORT
# static assets dir
WORKDIR '/usr/share/nginx/html'
# retrieves build app
RUN rm -rf ./*
COPY --from=builder ${APP_DIR}${OUT_DIR} .
COPY --from=builder ${APP_DIR}'nginx.conf' '/etc/nginx/conf.d/default.conf'
# alpine security updates
RUN apk --no-cache -U upgrade

# expose port
ENV PORT=${PORT}
EXPOSE ${PORT}/tcp
# exec command
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
