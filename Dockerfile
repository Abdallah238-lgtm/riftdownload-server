FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g yt-dlp

EXPOSE 3000
CMD ["node", "server.js"]
