#!/bin/bash

set -f 
string=$APP_SERVER_URLS
array=(${string//,/ })
echo "Deploy"
#for i in "${!array[@]}" ; do
    echo "Deploy on  instance"
    ssh  -o ProxyCommand="ssh  -W %h:%p -i ~/.ssh/id_deploy $DEPLOY_SERVER_USER@$DEPLOY_SERVER_URL" -i ~/.ssh/id_rsa_app $APP_SERVER_USER@${i}  "cd ${EC2_APP_PATH} && sudo git pull https://${1}:${2}@${GIT_REPO} ${GIT_BRANCHE} && sudo npm install"
#done
