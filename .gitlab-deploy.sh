#!/bin/bash

set -f 
string=$APP_SERVER_URLS
array=(${string//,/ })
echo "Deploy"
#for i in "${!array[@]}" ; do
    echo "Deploy on  instance1"
    ssh  -o ProxyCommand="ssh  -W %h:%p -i ~/.ssh/id_deploy $DEPLOY_SERVER_USER@$DEPLOY_SERVER_URL" -i ~/.ssh/id_rsa_app $APP_SERVER_USER@${array[0]}  "cd Enzo/checkin_api/repo/checkin_backend && sudo git pull https://${1}:${2}@gitlab.com/enzo-software-development/checkin_backend.git develop && sudo npm install"
    echo "Deploy on instance2"
    ssh  -o ProxyCommand="ssh  -W %h:%p -i ~/.ssh/id_deploy $DEPLOY_SERVER_USER@$DEPLOY_SERVER_URL" -i ~/.ssh/id_rsa_app $APP_SERVER_USER@${array[1]}  "cd Enzo/checkin_api/repo/checkin_backend &&  sudo git pull https://${1}:${2}@gitlab.com/enzo-software-development/checkin_backend.git develop && sudo npm install"
#done
