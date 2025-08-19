FROM node:18

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
ENV npm_config_proxy=""
ENV npm_config_https_proxy=""
RUN npm install

COPY . .

CMD ["npm", "start"]