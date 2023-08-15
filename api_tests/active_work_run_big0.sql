/*
active_work_run_big0.sql
run before this:
active_work_run0001.sql
active_work_run0002.sql
adds more posts and comments to hand-made test communities form simulation

ok, let's seee how the SELECT performs without the INSERT overhead.
use temporary tables for post and comment building.
*/
CREATE TEMP TABLE post_temp0 (LIKE post INCLUDING DEFAULTS);
CREATE TEMP TABLE comment_temp0 (LIKE comment INCLUDING DEFAULTS);

CREATE SEQUENCE post_temp0_seq;
SELECT setval('post_temp0_seq', (SELECT max(id) FROM post), true);
ALTER TABLE post_temp0 ALTER id SET DEFAULT nextval('post_temp0_seq');

CREATE SEQUENCE comment_temp0_seq;
SELECT setval('comment_temp0_seq', (SELECT max(id) FROM comment), true);
ALTER TABLE comment_temp0 ALTER id SET DEFAULT nextval('comment_temp0_seq');


/*
     BEEF GOES HERE
*/


-- specifically targeting the simulation created test communities that were had-generated
SELECT 'benchmark_fill_post2 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_post2(500000, ''zy_%'');', 1, 0);


-- create a list of id numbers for posts to have rapid pull-from list.
SELECT 'post targets post_temp_id0 populate_temp_post_id_table kicking off' AS status_message;
DROP TABLE IF EXISTS post_temp_id0;
SELECT * FROM bench('SELECT populate_temp_post_id_table(25000, ''zy_%'');', 1, 0);
-- spit out 10 to see what it looks like.
SELECT * FROM post_temp_id0 LIMIT 10;

-- trunk level comments
SELECT 'simple comment3' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_simple3(8000);', 1, 0);
SELECT 'simple comment4' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_simple4(10000);', 1, 0);

-- reply comments
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 1 kicking off 5 runs level 1' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(12500, 1);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 1 kicking off 5 runs level 2' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(7500, 2);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 1 kicking off 5 runs level 3' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(5200, 3);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 2 kicking off 5 runs level 4' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(5200, 4);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 3 kicking off 5 runs level 5' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(5200, 5);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 4 kicking off 3 runs level 6' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(5200, 6);', 3, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 5 kicking off 3 runs level 7' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 7);', 3, 0);


SELECT COUNT(*) AS post_temp0_count FROM post_temp0;
SELECT COUNT(*) AS comment_temp0_count FROM comment_temp0;
SELECT MAX(nlevel(path)) AS comment_temp0_path_max_level FROM comment_temp0;


/*
copy in the temp post table to main post table
  the per-row trigger action going on for aggregates must make this slower and why temp table so much faster
   could reproduce the trigger as a per-statement action for these operations, remove/restore existing trigger before/after
*/
SELECT 'copy post temp table into main post table, kicking off' AS status_message;
SELECT * FROM bench('INSERT INTO post SELECT * FROM post_temp0', 1, 0);
SELECT 'copy comment temp table into main post table, kicking off' AS status_message;
SELECT * FROM bench('INSERT INTO comment SELECT * FROM comment_temp0', 1, 0);


