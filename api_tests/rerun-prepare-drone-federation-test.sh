#!/usr/bin/env bash
# IMPORTANT NOTE: this script does not use the normal LEMMY_DATABASE_URL format
#   it is expected that this script is called by run-federation-test.sh script.

# set -e will cause bash to exit on any non-zero command result.
set -e

bypass_pg_create=false;

export RUST_BACKTRACE=1
export RUST_LOG="warn,lemmy_server=debug,lemmy_api=debug,lemmy_api_common=debug,lemmy_api_crud=debug,lemmy_apub=debug,lemmy_db_schema=debug,lemmy_db_views=debug,lemmy_db_views_actor=debug,lemmy_db_views_moderator=debug,lemmy_routes=debug,lemmy_utils=debug,lemmy_websocket=debug"

## declare an array variable with the base instance names
declare -a allinstances=("alpha" "beta" "gamma" "delta" "epsilon")

lemmy_read_username=lemmy_read0

if [ "$bypass_pg_create" = false ]
then
echo "prepare PostgreSQL for drone instances"
for INSTANCENAME in "${allinstances[@]}"; do
  INSTANCE=lemmy_$INSTANCENAME
  echo "DB URL: ${BASE_LEMMY_DATABASE_URL} INSTANCE: $INSTANCE"
  psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "DROP DATABASE IF EXISTS $INSTANCE"
  echo "create database $INSTANCE"
  psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "CREATE DATABASE $INSTANCE"

  # create secondary user only one time
  # sudo -iu postgres psql -c "CREATE USER lemmy_read0 WITH PASSWORD 'readpassword';"
  # only need to do once
  # psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "ALTER ROLE $lemmy_read_username SET statement_timeout = 8000;  -- milliseconds"

  # this needs to be done after every CREATE DATABASE
  psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "GRANT ALL PRIVILEGES ON DATABASE $INSTANCE TO $lemmy_read_username;"
  psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $lemmy_read_username;"

  psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO $lemmy_read_username;"
done
fi

if [ -z "$DO_WRITE_HOSTS_FILE" ]; then
  if ! grep -q lemmy-alpha /etc/hosts; then
    echo "Please add the following to your /etc/hosts file, then press enter:

      127.0.0.1       lemmy-alpha
      127.0.0.1       lemmy-beta
      127.0.0.1       lemmy-gamma
      127.0.0.1       lemmy-delta
      127.0.0.1       lemmy-epsilon"
    read -p ""
  fi
else
  for INSTANCE in lemmy-alpha lemmy-beta lemmy-gamma lemmy-delta lemmy-epsilon; do
    echo "127.0.0.1 $INSTANCE" >> /etc/hosts
  done
fi

echo "killall existing lemmy_server processes"
killall lemmy_server || true

echo "$PWD"

# this function uses binary executable prefix to pass the real lemmy_server environment variables names
launch_lemmy_server_for () {
   echo "start lemmy_server for $1"
LEMMY_CONFIG_LOCATION=./docker/federation/lemmy_$1.hjson \
LEMMY_DATABASE_URL="${BASE_LEMMY_DATABASE_URL}/lemmy_$1" \
LEMMY_DATABASE_READ_URL="${BASE_LEMMY_DATABASE_READ_URL}/lemmy_$1" \
target/lemmy_server >/tmp/lemmy_$1.out 2>&1 &
}

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


# since they are started, migrations are complete, tables in place
for INSTANCENAME in "${allinstances[@]}"; do
  INSTANCE=lemmy_$INSTANCENAME
  # create secondary user only one time
  # sudo -iu postgres psql -c "CREATE USER lemmy_read0 WITH PASSWORD 'readpassword';"
  # only need to do once
  # psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "ALTER ROLE $lemmy_read_username SET statement_timeout = 8000;  -- milliseconds"

  # this needs to be done after every CREATE DATABASE
  # psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "GRANT ALL PRIVILEGES ON DATABASE $INSTANCE TO $lemmy_read_username;"
  # psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $lemmy_read_username;"

  # the schema is named "lemmy", regardless of the instance DATABASE?
  # psql "${BASE_LEMMY_DATABASE_URL}/lemmy" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $lemmy_read_username;"
done

echo "after GRANT loop"
