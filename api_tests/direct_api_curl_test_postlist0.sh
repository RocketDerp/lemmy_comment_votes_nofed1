curl 'http://127.0.0.1:8541/api/v3/community/list?sort=New&limit=50' | jq '.communities | length' | awk '$1==50' | grep .
