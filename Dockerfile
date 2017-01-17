FROM node:6-slim
MAINTAINER Community Management

WORKDIR /usr/src/app

ADD *.js *.json *.html *.sh /usr/src/app/
ADD build/node_modules /usr/src/app/node_modules

CMD node index.js
