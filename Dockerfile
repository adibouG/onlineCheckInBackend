# Filename: Dockerfile 
FROM node:16-alpine

# Uncomment if use of `process.dlopen` is necessary
# apk add --no-cache libc6-compat

ENV PORT 3003
EXPOSE 3003 # replace this with your application's default port, if necessary

ARG NODE_ENV=dev
ENV NODE_ENV $NODE_ENV

ENV HOST http://ec2-52-17-51-8.eu-west-1.compute.amazonaws.com
ENV EMAIL_ SERVICE https://dev.cloud.enzosystems.com:6000/messaging/email/sendmessage
ENV LINK_URL http://ec2-52-17-51-8.eu-west-1.compute.amazonaws.com:3000

ENV SCHEME http


WORKDIR /home/ec2-user/gitTest/checkin_backend_docker
COPY package.json .
RUN npm install
COPY . .

CMD [ "npm", "start" ]


