


/*
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


-- DELETE FROM community WHERE name LIKE 'zzy_com_';


-- communities come first in Lemmy, lemmy.world has over 10,000 locally
SELECT 'mass_create_communities kicking off' AS status_message;
SELECT * FROM bench('SELECT mass_create_communities(12000);', 1, 0);


-- posts then go into Community
SELECT 'benchmark_fill_post2 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_post2(30000);', 1, 0);
SELECT 'benchmark_fill_post3 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_post3(30000);', 1, 0);

-- create a list of id numbers for posts to have rapid pull-from list.
SELECT 'post targets post_temp_id0 kicking off' AS status_message;
DROP TABLE IF EXISTS post_temp_id0;
SELECT * FROM bench('
CREATE TEMP TABLE IF NOT EXISTS post_temp_id0 AS (
   SELECT id FROM post_temp0
   ORDER BY random() LIMIT 25000
);', 1, 0);
-- spit out 10 to see what it looks like.
SELECT * FROM post_temp_id0 LIMIT 10;

SELECT pg_stat_statements_reset();

-- Comments come next in Lemmy, they go onto a post
SELECT 'simple comment0' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_simple0(1000);', 1, 0);
SELECT 'simple comment1' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_simple1(1333);', 1, 0);
--SELECT 'simple comment2' AS status_message;
--SELECT * FROM bench('SELECT benchmark_fill_comment_simple2(25000);', 1, 0);
SELECT 'simple comment3' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_simple3(922);', 1, 0);
SELECT 'simple comment4' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_simple4(777);', 1, 0);
/*
without child count on comment_aggregates, lemmy-ui may not show replies!
*/
SELECT 'benchmark_fill_comment_reply_using_temp0 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0(2711);', 1, 0);

SELECT 'benchmark_fill_comment_reply_using_temp0 ROUND 2 kicking off 20 runs' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0(3200);', 20, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 1 kicking off 5 runs level 3' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 3);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 2 kicking off 5 runs level 4' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 4);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 3 kicking off 5 runs level 5' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 5);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 4 kicking off 3 runs level 6' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 6);', 3, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 5 kicking off 3 runs level 7' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 7);', 3, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 5 kicking off 20 runs level 8' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 8);', 20, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 5 kicking off 5 runs level 9' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 9);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 5 kicking off 5 runs level 10' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 10);', 5, 0);
SELECT 'benchmark_fill_comment_reply_using_temp0_extendbranch ROUND 5 kicking off 5 runs level 11' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply_using_temp0_extendbranch(3200, 11);', 5, 0);

SELECT COUNT(*) FROM comment_temp0 AS comment_temp0_cuunt;

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

-- count comment replies (children) for comment_aggregates

SELECT 'child_count_for_all_comments' AS status_message;
SELECT * FROM bench('SELECT child_count_for_all_comments();', 1, 0);


-- review results interactively with lemmy-ui


SELECT count(*) AS comments_with_child_count_rows
    FROM comment_aggregates
    WHERE child_count > 0;

