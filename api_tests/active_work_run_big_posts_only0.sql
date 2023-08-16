/*
active_work_run_big_posts_only0.sql
run before this:
active_work_run0001.sql
active_work_run0002.sql
adds more posts to hand-made test communities form simulation
   big as in 150,000 new posts

ok, let's seee how the SELECT performs without the INSERT overhead.
use temporary tables for post and comment building.
*/
CREATE TEMP TABLE post_temp0 (LIKE post INCLUDING DEFAULTS);

CREATE SEQUENCE post_temp0_seq;
SELECT setval('post_temp0_seq', (SELECT max(id) FROM post), true);
ALTER TABLE post_temp0 ALTER id SET DEFAULT nextval('post_temp0_seq');


/*
     BEEF GOES HERE
*/


-- specifically targeting the simulation created test communities that were had-generated
SELECT 'benchmark_fill_post2 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_post2(150000, ''zy_%'');', 1, 0);



SELECT COUNT(*) AS post_temp0_count FROM post_temp0;


/*
copy in the temp post table to main post table
  the per-row trigger action going on for aggregates must make this slower and why temp table so much faster
   could reproduce the trigger as a per-statement action for these operations, remove/restore existing trigger before/after
*/
SELECT 'copy post temp table into main post table, kicking off' AS status_message;
SELECT * FROM bench('INSERT INTO post SELECT * FROM post_temp0', 1, 0);
