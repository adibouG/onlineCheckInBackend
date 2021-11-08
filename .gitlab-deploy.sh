#!/bin/bash

set -f 
string=$APP_SERVER_URL
array=(${string//,/ })
echo "Deploy"
for i in "${!array[@]}" ; do
    echo "Deploy on  instance1"
    ssh -v -o ProxyCommand="ssh -v -W %h:%p -i ~/.ssh/id_rsa ec2-user@34.244.245.12" -i ~/.ssh/id_rsa_app ec2-user@10.0.0.47  "cd Enzo/checkin_api/repo/checkin_backend && git pull https://${1}:${2}@gitlab.com/enzo-software-development/checkin_backend.git develop && npm install"
    echo "Deploy on instance2"
    ssh -v -o ProxyCommand="ssh -v -W %h:%p -i ~/.ssh/id_rsa ec2-user@34.244.245.12" -i ~/.ssh/id_rsa_app ec2-user@10.0.1.79  "cd Enzo/checkin_api/repo/checkin_backend &&  git pull https://${1}:${2}@gitlab.com/enzo-software-development/checkin_backend.git develop && npm install"

done
