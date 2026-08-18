FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Vite 개발 서버를 외부(호스트 브라우저)에서 접근할 수 있도록 --host 옵션 부여
CMD ["npm", "run", "dev", "--", "--host"]