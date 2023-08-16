#!/usr/bin/env bash
set -e

bypass_pg_purge=true;
bypass_drone_prep=false;

declare -a allinstances=("alpha" "beta" "gamma" "delta" "epsilon")

# NOTE: these URL environment variables do not have the database name on end.
#   They are only used for testing scripts, not used directly by thee lemmy_server app.
#   Since they are non-standard format, the "BASE_" prefix was added.
export DISABLED_BASE_LEMMY_DATABASE_URL=postgres://lemmy:password@localhost:5432
export DISABLED_BASE_LEMMY_DATABASE_READ_URL=postgres://lemmy_read0:readpassword@localhost:5432
# TO DISALBLE 2nd account usage, USE: export BASE_LEMMY_DATABASE_READ_URL to the same value as BASE_LEMMY_DATABASE_URL

export LEMMY_SYNCHRONOUS_FEDERATION=1 # currently this is true in debug by default, but still.
pushd ..
cargo build
rm target/lemmy_server || true
cp target/debug/lemmy_server target/lemmy_server

if [ "$bypass_drone_prep" = false ]
then
echo "prepare drone federation instances"
./api_tests/rerun-prepare-drone-federation-test.sh
fi
popd


bypass_yarn=true

yarn

# does this raelly need to be done per instance, or just once per PostgreSQL system?
for INSTANCENAME in "${allinstances[@]}"; do
  INSTANCE=lemmy_$INSTANCENAME
  # reminder: PostgreSQL can convert to JSON
  # in postgress config file, set:
  #   shared_preload_libraries = 'pg_stat_statements'	# (change requires restart)
  #   pg_stat_statements.track = all
  #psql "$BASE_LEMMY_DATABASE_URL/$INSTANCENAME" -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
  #psql "$BASE_LEMMY_DATABASE_URL/$INSTANCENAME" -c "SELECT pg_stat_statements_reset();"
done



if [ "$bypass_yarn" = false ]
then
  echo ":::: running yarn api-test"
  yarn api-test || true
#    "api-test": "jest -i follow.spec.ts && jest -i src/post.spec.ts && jest -i comment.spec.ts && jest -i private_message.spec.ts && jest -i user.spec.ts && jest -i community.spec.ts"
# yarn api-test
# node jest -i follow.spec.ts
else

  runjest() {
      echo ":::: run jest script $1"
      ./node_modules/.bin/jest --maxConcurrency=25 $1
      echo ":::: jest exited with code $?"
      if [ $? -eq 0 ]
      then
        echo "good test run"
      else
        echo "bad test results"
        read -p "Press any key to resume ..."
      fi
  }


  database_tune_before_testing() {
    time psql "$BASE_LEMMY_DATABASE_URL/$INSTANCE" --file mass_insert_before0.sql
    # 2023-08-16 lemmy developer says this is default on Lemmy installs, I assume wit Docker/Ansible config.
    # psql "$BASE_LEMMY_DATABASE_URL/lemmy" -c "ALTER USER lemmy SET synchronous_commit=OFF;"
  }

  database_mass_insert() {
    INSTANCE=lemmy_alpha
    echo "************"
    echo "************ major SQL script"
    echo "************ $INSTANCE"
    echo "************"
    # output shows rows inserted, let it go to screen
    time psql "$BASE_LEMMY_DATABASE_URL/$INSTANCE" --file mass_insert0.sql
    # time psql "$BASE_LEMMY_DATABASE_URL/$INSTANCE" --file mass_insert0_reference0.sql
  }


  database_tune_before_testing
  runjest simulate_content.spec.ts
  database_mass_insert
  #runjest follow.spec.ts
  #runjest post.spec.ts
  #runjest comment.spec.ts
  #runjest private_message.spec.ts
  # runjest user.spec.ts
  #runjest community.spec.ts
  #runjest remote_to_remote.spec.ts
  #runjest aggregates.spec.ts
  #runjest remote_home_remote.spec.ts
  # runjest benchmark_baseline.spec.ts
  # runjest benchmark_concurrent.spec.ts
  # runjest live_servers.spec.ts
  # runjest live_servers_stress.spec.ts
  # runjest benchmark_stresstest_concurrent.spec.ts
  # runjest benchmark_jest_study_concurrent.spec.ts
  runjest admin_instance.spec.ts

fi



for INSTANCENAME in "${allinstances[@]}"; do
  INSTANCE=lemmy_$INSTANCENAME
  # reminder: PostgreSQL can convert to JSON
  #psql "$BASE_LEMMY_DATABASE_URL" -c "SELECT queryid, calls, rows, mean_exec_time, query FROM pg_stat_statements ORDER BY calls DESC;" > /tmp/${INSTANCE}_stat_statements.txt
done


if [ "$bypass_pg_purge" = false ]; then

killall -s1 lemmy_server

for INSTANCENAME in "${allinstances[@]}"; do
  INSTANCE=lemmy_$INSTANCENAME
  psql "$BASE_LEMMY_DATABASE_URL/lemmy" -c "DROP DATABASE $INSTANCE;"
done

fi


# do it 4 times, but at 2 a time
# seq 4 | parallel -n0 -j2 "curl -H 'Content-Type: application/json' http://httpbin.org/post -X POST -d '{\"url\":\"http://google.com/\"}'"
# seq 10 | parallel -n0 -j5 "curl -H 'Content-Type: application/json' 'http://127.0.0.1:8561/api/v3/community/list?sort=New&limit=50'

# seq 10 | parallel -n0 -j5 "curl 'http://127.0.0.1:8541/api/v3/community/list?sort=New&limit=50'"

# hyperfine --warmup 1 --runs 25 "curl 'http://127.0.0.1:8541/api/v3/community/list?sort=New&limit=50'"

# curl 'http://127.0.0.1:8541/api/v3/community/list?sort=New&limit=50' | jq '.communities | length' | awk '$1>2'

hyperfine --warmup 1 --runs 25 "curl 'http://127.0.0.1:8541/api/v3/community/list?sort=New&limit=50' | jq '.communities | length' | awk '\$1==50' | grep ."

# hyperfine in paralle
#   https://github.com/sharkdp/hyperfine/issues/58

echo "curl 'http://127.0.0.1:8541/api/v3/community/list?sort=New&limit=50' | jq '.communities | length' | awk '\$1==50' | grep ." > runme0.sh
chmod +x runme0.sh

hyperfine 'yes "" | head -n25 | parallel -j 25 ./runme0.sh'
