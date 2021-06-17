#!/bin/bash

set -f 
string=$DEPLOY_SERVER_URL
array=(${string//,/ })
    
for i in "${!array[@]}" ; do
    echo "Deploy on ${array[i]}"
    ssh -v -o ProxyCommand="ssh -v -W %h:%p -i ~/.ssh/id_rsa $DEPLOY_USER_NAME@$DEPLOY_SERVER_URL" -i ~/.ssh/id_rsa_app ec2-user@$APP_SERVER_URL  "cd Enzo/checkin_api/repo/checkin_backend && git pull https://${1}:${2}@gitlab.com/enzo-software-development/checkin_backend.git develop && npm install"
done
