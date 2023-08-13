-- hard-coded values
--   19 is targeted testing community from run of jest Lemmy activity simulation
--   'zy_' is a community name prefix from run of jest Lemmy activity simulation
--   Linux sed command could be used to replace these values.
--

-- real	55m2.853s
-- user	0m0.021s
-- sys	0m0.018s


-- lemmy_helper benchmark_fill_post2
			INSERT INTO post
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
			FROM generate_series(1, 30000) AS source(i)
			;

-- lemmy_helper benchmark_fill_post3
			INSERT INTO post
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
			FROM generate_series(1, 40000) AS source(i)
			;


-- lemmy_helper benchmark_fill_comment1
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
			FROM generate_series(1, 25000) AS source(i)
			;

-- lemmy_helper comment2

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
			FROM generate_series(1, 25000) AS source(i)
			;


-- lemmy_helper benchmark_fill_comment_reply0
-- running multiple passes will give replies to replies

DO
$$
BEGIN

	FOR x IN 1..2
	LOOP

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
				(SELECT id FROM person
					WHERE local=true
					ORDER BY random() LIMIT 1
					),
				true,
				timezone('utc', NOW()) - ( random() * ( NOW() + '93 days' - NOW() ) )
			FROM comment
			WHERE post_id IN
				(SELECT id FROM post
					WHERE community_id = 19
					AND local=true
					-- AND path level < 14?
					)
			AND local=true
			LIMIT 25000
			;

	END LOOP;

END;
$$
