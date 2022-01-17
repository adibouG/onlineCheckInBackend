# Filename: Dockerfile 
FROM node:16-alpine

# Uncomment if use of `process.dlopen` is necessary
# apk add --no-cache libc6-compat

ENV PORT 3003
EXPOSE 3003

ARG NODE_ENV=dev
ENV NODE_ENV $NODE_ENV

ENV HOST https://dev.cloud.enzosystems.com:3003

ENV EMAIL_ SERVICE https://dev.cloud.enzosystems.com:6000/messaging/email/sendmessage
ENV LINK_URL https://dev.cloud.enzosystems.com:3000/

ENV SCHEME http


WORKDIR /home/ec2-user/Enzo/docker/checkin_backend
COPY package.json .
RUN npm install
COPY . .

CMD [ "npm", "start" ]


