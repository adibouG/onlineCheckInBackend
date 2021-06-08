#!/bin/bash

set -f 
string=$DEPLOY_SERVER_URL
array=(${string//,/ })

for i in "${!array[@]}" ; do
    echo "Deploy on ${array[i]}"
    ssh ec2-user@${array[i]} "cd /home/ec2-user/gitTest/checkin_backend/checkin_backend && git pull https://${1}:${2}@gitlab.com/enzo-software-development/checkin_backend.git develop && npm install"
done