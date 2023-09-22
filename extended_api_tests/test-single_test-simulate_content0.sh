# create should not run concurrently, it paces with nginx and lemmy's rate limiting
# this test uses .replaceAll on string, needs es2021

# ./node_modules/.bin/jest  src/simulate_content_proxy_work.spec.ts
./node_modules/.bin/jest  simulate_content.spec.ts
