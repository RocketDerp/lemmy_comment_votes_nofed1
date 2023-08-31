CREATE OR REPLACE FUNCTION mass_create_communities(how_many BigInt)
RETURNS VOID AS
$$
BEGIN

			INSERT INTO community
			( name, title, description, instance_id, local, public_key, actor_id )
			SELECT 'zzy_com_' || i,
			   'ZipGen Community ' || i,
			   'description goes here, run AAAA0000 c' || i,
			   1,
			   true,
			   'NEED_PUBLIC_KEY',
			   'http://lemmy-alpha:8541/c/zzy_com_' || i
			FROM generate_series(1, how_many) AS source(i)
            ;

END
$$
LANGUAGE plpgsql;

--revised content
CREATE OR REPLACE FUNCTION benchmark_fill_comment_reply_using_temp0_extendbranch(how_many BigInt, targetbranch BigInt)
RETURNS VOID AS
$$
BEGIN

            INSERT INTO comment_temp0
            ( id, path, ap_id, content, post_id, creator_id, local, published )
            SELECT
                nextval(pg_get_serial_sequence('comment', 'id')),
                text2ltree( path::text || '.' || currval(pg_get_serial_sequence('comment', 'id')) ),
                'http://lemmy-slpha:8541/comment/' || currval( pg_get_serial_sequence('comment', 'id') ),
                E'ZipGen Stress-Test message comment_reply_using_temp0_extendbranch path nlevel param:'
                    || targetbranch || E'\n\n comment AAAA0000 c' || '?' || E'\n\n all from the same random user.'
                    || ' PostgreSQL comment id ' || currval( pg_get_serial_sequence('comment', 'id') )
                    || ' path ' || path::text || ' nlevel actual: ' || nlevel(path)
                    || E'\n\n> ' || REPLACE(content, E'\n', ' CRLF '),
                comment_temp0.post_id,
                (SELECT id FROM person
                    WHERE comment_temp0.id=comment_temp0.id
                    AND local=true
                    ORDER BY random() LIMIT 1
                    ),
                true,
                NOW()
            FROM comment_temp0
            -- prior testing targeted some specific post id
            WHERE post_id NOT IN (100, 101)
            AND nlevel(path) > targetbranch
            LIMIT how_many
            ;

END
$$
LANGUAGE plpgsql;


-- revised with parameter
CREATE OR REPLACE FUNCTION benchmark_fill_post2(how_many BigInt, target_community TEXT)
RETURNS VOID AS
$$
BEGIN

            INSERT INTO post_temp0
            ( name, body, community_id, creator_id, local, published )
            SELECT 'ZipGen Stress-Test Community post AAAA0000 p' || i,
                'post body run index ' || i || ' created by benchmark_fill_post2'
                   ,
                (SELECT id FROM community
                        WHERE source=source
                        AND local=true
                        AND name LIKE target_community
                        ORDER BY random() LIMIT 1
                        ),
                (SELECT id FROM person
                    WHERE source=source
                    AND local=true
                    ORDER BY random() LIMIT 1
                    ),
                true,
                timezone('utc', NOW()) - ( random() * ( NOW() + '95 days' - NOW() ) )
            FROM generate_series(1, how_many) AS source(i)
            ;

END
$$
LANGUAGE plpgsql;



/*
used to build a list of posts to target for comment activity
*/
CREATE OR REPLACE FUNCTION populate_temp_post_id_table(how_many BigInt, target_community TEXT)
RETURNS VOID AS
$$
BEGIN

    CREATE TEMP TABLE IF NOT EXISTS post_temp_id0 AS (
        SELECT id FROM post_temp0
        WHERE community_id IN (
            SELECT id FROM community
                WHERE name LIKE target_community
            )
        ORDER BY random()
        LIMIT how_many
        );

END
$$
LANGUAGE plpgsql;


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


/*
     BEEF GOES HERE
*/

-- specifically targeting the zzy_com_ communities that were mass-generated
SELECT 'benchmark_fill_post2 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_post2(30000, ''zzy_com_%'');', 1, 0);



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
    WHERE child_count > 0
    ;

