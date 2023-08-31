#
# kill and restart lemmy_server after rebuild of code
# typically run after 'cargo build'
#

export RUST_BACKTRACE=1
export RUST_LOG="warn,lemmy_server=debug,lemmy_api=debug,lemmy_api_common=debug,lemmy_api_crud=debug,lemmy_apub=debug,lemmy_db_schema=debug,lemmy_db_views=debug,lemmy_db_views_actor=debug,lemmy_db_views_moderator=debug,lemmy_routes=debug,lemmy_utils=debug,lemmy_websocket=debug"
export LEMMY_SYNCHRONOUS_FEDERATION=1 # currently this is true in debug by default, but still.

declare -a allinstances=("alpha" "beta" "gamma" "delta" "epsilon")

echo "killall existing lemmy_server processes"
killall lemmy_server || true

pushd ..
cargo build
rm target/lemmy_server || true
cp target/debug/lemmy_server target/lemmy_server

echo "$PWD"

# this function uses binary executable prefix to pass the real lemmy_server environment variables names
launch_lemmy_server_for () {
   echo "start lemmy_server for $1"
LEMMY_CONFIG_LOCATION=./docker/federation/lemmy_$1.hjson \
LEMMY_DATABASE_URL="${BASE_LEMMY_DATABASE_URL}/lemmy_$1" \
LEMMY_DATABASE_READ_URL="${BASE_LEMMY_DATABASE_READ_URL}/lemmy_$1" \
target/lemmy_server >/tmp/lemmy_$1.out 2>&1 &
}

# target/lemmy_server >/tmp/lemmy_$1.out 2>&1 &

for i in "${allinstances[@]}"
do
  launch_lemmy_server_for "$i"
done

# proves faster to start them all in parallel then wait

onport=8531

for INSTANCENAME in "${allinstances[@]}"
do
  let "onport+=10"
  newhost='lemmy-'$INSTANCENAME:$onport
  apifull=$newhost/api/v3/site
  while [[ "$(curl -s -o /dev/null -w '%{http_code}' $apifull)" != "200" ]]; do sleep 0.25; done
  echo "$INSTANCENAME started"
done

popd
