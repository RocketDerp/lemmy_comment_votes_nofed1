echo "curl 'http://127.0.0.1:8541/api/v3/community/list?sort=New&limit=50' | jq '.communities | length' | awk '\$1==50' | grep ." > runme0.sh
chmod +x runme0.sh

hyperfine 'yes "" | head -n200 | parallel -j 200 ./direct_api_curl_test_postlist0.sh'
