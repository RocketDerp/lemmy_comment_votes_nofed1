#!/usr/bin/env bash
set -e

# NOTE: these URL environment variables do not have the database name on end.
#   They are only used for testing scripts, not used directly by thee lemmy_server app.
#   Since they are non-standard format, the "BASE_" prefix was added.
export BASE_LEMMY_DATABASE_URL=postgres://lemmy:password@localhost:5432
export BASE_LEMMY_DATABASE_READ_URL=postgres://lemmy_read0:readpassword@localhost:5432
# TO DISALBLE 2nd account usage, USE: export BASE_LEMMY_DATABASE_READ_URL to the same value as BASE_LEMMY_DATABASE_URL
export LEMMY_SYNCHRONOUS_FEDERATION=1 # currently this is true in debug by default, but still.
pushd ..
cargo build
rm target/lemmy_server || true
cp target/debug/lemmy_server target/lemmy_server
killall -s1 lemmy_server || true
./api_tests/prepare-drone-federation-test.sh
popd

yarn
yarn api-test || true

killall -s1 lemmy_server || true
for INSTANCE in lemmy_alpha lemmy_beta lemmy_gamma lemmy_delta lemmy_epsilon; do
  psql "$BASE_LEMMY_DATABASE_URL" -c "DROP DATABASE $INSTANCE"
done
