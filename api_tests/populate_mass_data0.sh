#!/bin/bash

#
# one purpose of this file is to try to keep paswords off GitHub
#

export BASE_LEMMY_DATABASE_URL=postgres://lemmy:zbbs84952@localhost:5432
export BASE_LEMMY_DATABASE_READ_URL=postgres://lemmy_read0:ginger77145@localhost:5432


  database_mass_insert() {
    INSTANCE=lemmy_alpha
    echo "************"
    echo "************ major SQL script"
    echo "************ $INSTANCE"
    echo "************"
    #
    # OK, before, update, after
    # before
    time psql "$BASE_LEMMY_DATABASE_URL/$INSTANCE" --file mass_insert_before0.sql
    
    # beef here
    #    active_work_runb0001.sql creates 12,000 communities and puts a few posts in them
    # time psql "$BASE_LEMMY_DATABASE_URL/$INSTANCE" --file active_work_run0001.sql
    #    target the specific hand-made test communities from simulation
    time psql "$BASE_LEMMY_DATABASE_URL/$INSTANCE" --file active_work_run_big2.sql
    
    # after
    time psql "$BASE_LEMMY_DATABASE_URL/$INSTANCE" --file mass_insert_after0.sql
  }


  # runjest simulate_content.spec.ts
  database_mass_insert
