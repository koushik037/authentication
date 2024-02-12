FROM node:16.14.0
WORKDIR /app
COPY  . . 
CMD ["node","index.js"]
