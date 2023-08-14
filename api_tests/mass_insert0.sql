-- hard-coded values
--   19 is targeted testing community from run of jest Lemmy activity simulation
--   'zy_' is a community name prefix from run of jest Lemmy activity simulation
--   Linux sed command could be used to replace these values.
--

-- real	55m2.853s
-- user	0m0.021s
-- sys	0m0.018s

-- this run
-- real	7m31.110s
--
-- INSERT 0 30000
-- INSERT 0 40000
-- INSERT 0 25000
-- INSERT 0 25000
-- DO
-- real	7m56.587s

-- benchmark references
--    https://www.tangramvision.com/blog/how-to-benchmark-postgresql-queries-well

/*
For some reason, PostgreSQL was dragging down even with DROP DATABASE between runs.
I deleted the PostgreSQL database directory and recreated the cluster
    sudo -iu postgres /usr/lib/postgresql/15/bin/initdb -D /WorkSpot0/postgres_data

Now the code runs at this performance as it is created here:

CREATE FUNCTION
         avg          |  min  |  q1   | median |  q3   |         p95          |  max  | repeats 
----------------------+-------+-------+--------+-------+----------------------+-------+---------
 0.004520000000000003 | 0.003 | 0.003 |  0.003 | 0.003 | 0.006099999999999994 | 0.052 |      50
(1 row)

CREATE FUNCTION
    avg    |    min    |    q1     |  median   |    q3     |    p95    |    max    | repeats 
-----------+-----------+-----------+-----------+-----------+-----------+-----------+---------
 13192.173 | 13192.173 | 13192.173 | 13192.173 | 13192.173 | 13192.173 | 13192.173 |       1
(1 row)

CREATE FUNCTION
    avg    |    min    |    q1     |  median   |    q3     |    p95    |    max    | repeats 
-----------+-----------+-----------+-----------+-----------+-----------+-----------+---------
 31059.783 | 31059.783 | 31059.783 | 31059.783 | 31059.783 | 31059.783 | 31059.783 |       1
(1 row)

CREATE FUNCTION
    avg     |    min     |     q1     |   median   |     q3     |    p95     |    max     | repeats 
------------+------------+------------+------------+------------+------------+------------+---------
 211249.527 | 211249.527 | 211249.527 | 211249.527 | 211249.527 | 211249.527 | 211249.527 |       1
(1 row)

CREATE FUNCTION
    avg     |    min     |     q1     |   median   |     q3     |    p95     |    max     | repeats 
------------+------------+------------+------------+------------+------------+------------+---------
 188812.358 | 188812.358 | 188812.358 | 188812.358 | 188812.358 | 188812.358 | 188812.358 |       1
(1 row)

CREATE FUNCTION
   avg    |   min    |    q1    |  median  |    q3    |   p95    |   max    | repeats 
----------+----------+----------+----------+----------+----------+----------+---------
 2324.161 | 2324.161 | 2324.161 | 2324.161 | 2324.161 | 2324.161 | 2324.161 |       1
(1 row)


real	7m26.742s
user	0m0.023s
sys	0m0.010s


Without delete of Linuxc files and entire reuild of cluster:

CREATE FUNCTION
    avg     |    min     |     q1     |   median   |     q3     |    p95     |    max     | repeats 
------------+------------+------------+------------+------------+------------+------------+---------
 203954.196 | 203954.196 | 203954.196 | 203954.196 | 203954.196 | 203954.196 | 203954.196 |       1
(1 row)

CREATE FUNCTION
   avg    |   min    |    q1    |  median  |    q3    |   p95    |   max    | repeats 
----------+----------+----------+----------+----------+----------+----------+---------
 2334.262 | 2334.262 | 2334.262 | 2334.262 | 2334.262 | 2334.262 | 2334.262 |       1
(1 row)


real	33m41.817s


*/


-- scripts/clock_timestamp_function.sql
CREATE OR REPLACE FUNCTION bench(query TEXT, iterations INTEGER = 100, warmup_iterations INTEGER = 5)
RETURNS TABLE(avg FLOAT, min FLOAT, q1 FLOAT, median FLOAT, q3 FLOAT, p95 FLOAT, max FLOAT, repeats INTEGER) AS $$
DECLARE
  _start TIMESTAMPTZ;
  _end TIMESTAMPTZ;
  _delta DOUBLE PRECISION;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS _bench_results (
      elapsed DOUBLE PRECISION
  );

  -- Warm the cache
  FOR i IN 1..warmup_iterations LOOP
    RAISE 'hello warmup %', i;
    EXECUTE query;
  END LOOP;

  -- Run test and collect elapsed time into _bench_results table
  FOR i IN 1..iterations LOOP
    _start = clock_timestamp();
    EXECUTE query;
    _end = clock_timestamp();
    _delta = 1000 * ( extract(epoch from _end) - extract(epoch from _start) );
    INSERT INTO _bench_results VALUES (_delta);
  END LOOP;

  RETURN QUERY SELECT
    avg(elapsed),
    min(elapsed),
    percentile_cont(0.25) WITHIN GROUP (ORDER BY elapsed),
    percentile_cont(0.5) WITHIN GROUP (ORDER BY elapsed),
    percentile_cont(0.75) WITHIN GROUP (ORDER BY elapsed),
    percentile_cont(0.95) WITHIN GROUP (ORDER BY elapsed),
    max(elapsed),
    iterations
    FROM _bench_results;
  DROP TABLE IF EXISTS _bench_results;

END
$$
LANGUAGE plpgsql;

SELECT * FROM bench('SELECT 1', 50, 0);


-- lemmy_helper benchmark_fill_post2

CREATE OR REPLACE FUNCTION benchmark_fill_post2(how_many BigInt)
RETURNS VOID AS
$$
BEGIN

			INSERT INTO post_temp0
			( name, body, community_id, creator_id, local, published )
			SELECT 'ZipGen Stress-Test Community post AAAA0000 p' || i,
				'post body ' || i,
				(SELECT id FROM community
						WHERE source=source
						AND local=true
						AND name LIKE 'zy_%'
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


-- lemmy_helper benchmark_fill_post3

CREATE OR REPLACE FUNCTION benchmark_fill_post3(how_many BigInt)
RETURNS VOID AS
$$
BEGIN
			INSERT INTO post_temp0
			( name, body, community_id, creator_id, local, published )
			SELECT 'ZipGen Stress-Test Huge Community post AAAA0000 p' || i,
				'post body ' || i,
				19, -- targeted testing community from simulation
				(SELECT id FROM person
					WHERE source=source
					AND local=true
					ORDER BY random() LIMIT 1
					),
				true,
				timezone('utc', NOW()) - ( random() * ( NOW() + '128 days' - NOW() ) )
			FROM generate_series(1, how_many) AS source(i)
			;

END
$$
LANGUAGE plpgsql;


--- fill comments without any complex select logic
--- it took twice as long?! same post / comment issue? 449455.753 ms

CREATE OR REPLACE FUNCTION benchmark_fill_comment_simple0(how_many BigInt)
RETURNS VOID AS
$$
BEGIN

			INSERT INTO comment_temp0
			( id, path, ap_id, content, post_id, creator_id, local, published )
			SELECT
				nextval(pg_get_serial_sequence('comment', 'id')),
				text2ltree('0.' || currval( pg_get_serial_sequence('comment', 'id')) ),
				'http://lemmy-alpha:8541/comment/' || currval( pg_get_serial_sequence('comment', 'id') ),
				E'ZipGen Stress-Test message in spread of communities\n\n comment AAAA0000 c' || i
				    || ' PostgreSQL comment id ' || currval( pg_get_serial_sequence('comment', 'id') ),
				100,
				7,
				true,
				timezone('utc', NOW()) - ( random() * ( NOW() + '93 days' - NOW() ) )
			FROM generate_series(1, how_many) AS source(i)
			;

END
$$
LANGUAGE plpgsql;


-- lemmy_helper benchmark_fill_comment1

CREATE OR REPLACE FUNCTION benchmark_fill_comment1(how_many BigInt)
RETURNS VOID AS
$$
BEGIN

			INSERT INTO comment
			( id, path, ap_id, content, post_id, creator_id, local, published )
			-- ( path, content, post_id, creator_id, local, published )
			SELECT
				nextval(pg_get_serial_sequence('comment', 'id')),
				text2ltree('0.' || currval( pg_get_serial_sequence('comment', 'id')) ),
				'http://lemmy-alpha:8541/comment/' || currval( pg_get_serial_sequence('comment', 'id') ),
				E'ZipGen Stress-Test message in spread of communities\n\n comment AAAA0000 c' || i
				    || ' PostgreSQL comment id ' || currval( pg_get_serial_sequence('comment', 'id') ),
				(SELECT id FROM post
					WHERE source=source
					AND community_id IN (
						-- DO NOT put source=source, static query result is fine
						SELECT id FROM community
						WHERE local=true
						AND id <> 19  -- exclude the big one to speed up inserts
						AND name LIKE 'zy_%'
						)
					AND local=true
					ORDER BY random() LIMIT 1
					),
				(SELECT id FROM person
					WHERE source=source
					AND local=true
					ORDER BY random() LIMIT 1
					),
				true,
				timezone('utc', NOW()) - ( random() * ( NOW() + '93 days' - NOW() ) )
			FROM generate_series(1, how_many) AS source(i)
			;

END
$$
LANGUAGE plpgsql;


-- lemmy_helper comment2

CREATE OR REPLACE FUNCTION benchmark_fill_comment2(how_many BigInt)
RETURNS VOID AS
$$
BEGIN

			INSERT INTO comment
			( id, path, ap_id, content, post_id, creator_id, local, published )
			SELECT
				nextval(pg_get_serial_sequence('comment', 'id')),
				text2ltree('0.' || currval(pg_get_serial_sequence('comment', 'id')) ),
				'http://lemmy-alpha:8541/comment/' || currval( pg_get_serial_sequence('comment', 'id') ),
				E'ZipGen Stress-Test message in Huge Community\n\n comment AAAA0000 c' || i || E'\n\n all from the same random user.'
					|| ' PostgreSQL comment id ' || currval( pg_get_serial_sequence('comment', 'id') ),
				(SELECT id FROM post
					WHERE source=source
					AND community_id = 19
					AND local=true
					ORDER BY random() LIMIT 1
					),
			    -- random person, but same person for all quantity
				-- NOT: source=source
				(SELECT id FROM person
					WHERE local=true
					ORDER BY random() LIMIT 1
					),
				true,
				timezone('utc', NOW()) - ( random() * ( NOW() + '93 days' - NOW() ) )
			FROM generate_series(1, how_many) AS source(i)
			;

END
$$
LANGUAGE plpgsql;


-- lemmy_helper benchmark_fill_comment_reply0
-- running multiple passes will give replies to replies

CREATE OR REPLACE FUNCTION benchmark_fill_comment_reply0(how_many BigInt)
RETURNS VOID AS
$$
BEGIN

			INSERT INTO comment
			( id, path, ap_id, content, post_id, creator_id, local, published )
			SELECT
				nextval(pg_get_serial_sequence('comment', 'id')),
				text2ltree( path::text || '.' || currval(pg_get_serial_sequence('comment', 'id')) ),
				'http://lemmy-slpha:8541/comment/' || currval( pg_get_serial_sequence('comment', 'id') ),
				E'ZipGen Stress-Test message in Huge Community\n\n comment AAAA0000 c' || '?' || E'\n\n all from the same random user.'
					|| ' PostgreSQL comment id ' || currval( pg_get_serial_sequence('comment', 'id') )
					|| ' path ' || path::text
					|| E'\n\n> ' || REPLACE(content, E'\n', ' CRLF '),
				post_id,
				-- random person, but same person for all quantity
				-- NOT: source=source
				7,
				true,
				NOW()
			FROM comment
			WHERE post_id IN
				(SELECT id FROM post
					WHERE community_id = 19
					AND local=true
					-- AND path level < 14?
					)
			AND local=true
			LIMIT how_many
			;

END
$$
LANGUAGE plpgsql;


-- *************************************************************************************
-- ** Execute
-- *************************************************************************************
-- this takes: real	4m44.482s
/*
 13440.881 | 13440.881 | 13440.881 | 13440.881 | 13440.881 | 13440.881 | 13440.881 |       1
 benchmark_fill_post3 kicking off
 18826.093 | 18826.093 | 18826.093 | 18826.093 | 18826.093 | 18826.093 | 18826.093 |       1
 benchmark_fill_comment1 kicking off
 218809.803 | 218809.803 | 218809.803 | 218809.803 | 218809.803 | 218809.803 | 218809.803 |       1
 benchmark_fill_comment2 kicking off
 30791.385 | 30791.385 | 30791.385 | 30791.385 | 30791.385 | 30791.385 | 30791.385 |       1
 benchmark_fill_comment_reply0 kicking off
 2521.066 | 2521.066 | 2521.066 | 2521.066 | 2521.066 | 2521.066 | 2521.066 |       1
*/

/*
revised order of post creation, yields:
 benchmark_fill_post3 kicking off
 19381.957 | 19381.957 | 19381.957 | 19381.957 | 19381.957 | 19381.957 | 19381.957 |       1
 benchmark_fill_post2 kicking off
 19996.972 | 19996.972 | 19996.972 | 19996.972 | 19996.972 | 19996.972 | 19996.972 |       1
 benchmark_fill_comment1 kicking off
 253836.805 | 253836.805 | 253836.805 | 253836.805 | 253836.805 | 253836.805 | 253836.805 |       1
 benchmark_fill_comment2 kicking off
 35345.686 | 35345.686 | 35345.686 | 35345.686 | 35345.686 | 35345.686 | 35345.686 |       1
 benchmark_fill_comment_reply0 kicking off
 2933.079 | 2933.079 | 2933.079 | 2933.079 | 2933.079 | 2933.079 | 2933.079 |       1
*/
/*
back to original order
*/

/*
remove constraints for bulk insert
doesn't work very well
  -- probably better to create a temporary table then do bulk copy in.
aggregates will still have constraints, but still...

reading:
https://www.enterprisedb.com/blog/7-best-practice-tips-postgresql-bulk-data-loading
*/
-- ALTER TABLE ONLY public.comment DROP CONSTRAINT comment_pkey;
-- fails with: cannot drop constraint comment_pkey on table comment because other objects depend on it
-- ALTER TABLE ONLY public.post DROP CONSTRAINT post_pkey;
/*
ALTER TABLE public.comment_like SET UNLOGGED;
ALTER TABLE public.post_like SET UNLOGGED;
ALTER TABLE public.comment SET UNLOGGED;
ALTER TABLE public.post SET UNLOGGED;
*/

/*
ok, let's seee how the SELECCT performs without the INSERT overhead.
*/
CREATE TEMP TABLE post_temp0 (LIKE post INCLUDING DEFAULTS);
CREATE TEMP TABLE comment_temp0 (LIKE comment INCLUDING DEFAULTS);

CREATE SEQUENCE post_temp0_seq;
SELECT setval('post_temp0_seq', (SELECT max(id) FROM post), true);
ALTER TABLE post_temp0 ALTER id SET DEFAULT nextval('post_temp0_seq');
--ALTER SEQUENCE post_temp0_seq OWNED BY lemmy;

CREATE SEQUENCE comment_temp0_seq;
SELECT setval('comment_temp0_seq', (SELECT max(id) FROM comment), true);
ALTER TABLE comment_temp0 ALTER id SET DEFAULT nextval('comment_temp0_seq');
--ALTER SEQUENCE comment_temp0_seq OWNED BY lemmy;

-- 23m55.409s with temporary post table?


-- communities come first in Lemmy
-- already generated by the simulation jest test script

-- posts then go into Community
SELECT 'benchmark_fill_post2 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_post2(30000);', 1, 0);
SELECT 'benchmark_fill_post3 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_post3(30000);', 1, 0);

-- copy in the temp post table to main post table
SELECT 'copy post temp table into main post table, kicking off' AS status_message;
SELECT * FROM bench('INSERT INTO post SELECT * FROM post_temp0', 1, 0);

-- Comments come next in Lemmy, they go onto a post
SELECT 'simple comment' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_simple0(25000);', 1, 0);

SELECT 'benchmark_fill_comment1 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment1(25000);', 1, 0);
SELECT 'benchmark_fill_comment2 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment2(5000);', 1, 0);
SELECT 'benchmark_fill_comment_reply0 kicking off' AS status_message;
SELECT * FROM bench('SELECT benchmark_fill_comment_reply0(5000);', 1, 0);

/*
-- ALTER TABLE ONLY public.comment ADD CONSTRAINT comment_pkey PRIMARY KEY (id);
-- ALTER TABLE ONLY public.post ADD CONSTRAINT post_pkey PRIMARY KEY (id);

ALTER TABLE public.comment SET LOGGED;
ALTER TABLE public.post SET LOGGED;
*/
