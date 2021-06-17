#!/bin/bash

set -f 
string=$DEPLOY_SERVER_URL
array=(${string//,/ })
    
for i in "${!array[@]}" ; do
    echo "Deploy on ${array[i]}"
    ssh -v -o ProxyCommand="ssh -v -W %h:%p -i ~/.ssh/id_rsa gitdeploy@34.244.245.12" -i ~/.ssh/id_rsa_app ec2-user@10.0.0.47  "cd Enzo/checkin_api/repo/checkin_backend && git pull https://${1}:${2}@gitlab.com/enzo-software-development/checkin_backend.git develop && npm install"
done
