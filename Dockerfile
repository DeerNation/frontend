FROM node:8-alpine as builder
#####
# NEEDS local ./plugins dir with all content plugins in it (no symlink)
#####

RUN apk update && apk add git python2
RUN npm -g config set user root
RUN npm install -g qxcompiler

COPY config/config.json /etc/deernation/config.json
WORKDIR /app
COPY . .
RUN npm run compile-frontend-build

FROM nginx:1.15.2-alpine as runtime

LABEL maintainer="Tobias Bräutigam tbraeutigam@gmail.com" \
   description="Web Frontend for the DeerNation application."

RUN rm -r /etc/nginx/*
COPY config/nginx/*.conf /etc/nginx/

RUN chmod -R 777 /var/log/nginx /var/cache/nginx/ \
    && chmod 644 /etc/nginx/*

WORKDIR /usr/share/nginx/html/
COPY --from=builder /app/app/build-output .