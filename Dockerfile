FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm ci

COPY *.ts ./
COPY tsconfig.json ./
RUN npm run build

CMD [ "node", "doctolib_checker.js" ]
