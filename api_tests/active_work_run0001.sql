/*
active_work_run0001.sql
intended to run after clean total rebuild
adds more communities and posts

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


-- communities come first in Lemmy, lemmy.world has over 10,000 locally
SELECT 'mass_create_communities kicking off' AS status_message;
SELECT * FROM bench('SELECT mass_create_communities(12000);', 1, 0);


-- specifically targeting the zzy_com_ communities that were mass-generated
--  this creates a scattering of posts, simulating many relatively inactive communities
SELECT 'benchmark_fill_post2 kicking off' AS status_message;
-- PERFORMANCE WARNING: this next line can be slow, despite temp table, the SELECT source?
SELECT * FROM bench('SELECT benchmark_fill_post2(120000, ''zzy_com_%'');', 1, 0);


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

-- count comment replies (children) for comment_aggregates

SELECT 'child_count_for_all_comments' AS status_message;
SELECT * FROM bench('SELECT child_count_for_all_comments();', 1, 0);


-- review results interactively with lemmy-ui


SELECT count(*) AS comments_with_child_count_rows
    FROM comment_aggregates
    WHERE child_count > 0
    ;

