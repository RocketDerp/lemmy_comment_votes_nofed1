
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
			FROM generate_series(1, 25000) AS source(i)
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
			FROM generate_series(1, 25000) AS source(i)
			;


-- lemmy_helper benchmark_fill_comment1
			INSERT INTO comment
			( id, path, ap_id, content, post_id, creator_id, local, published )
			-- ( path, content, post_id, creator_id, local, published )
			SELECT
				nextval(pg_get_serial_sequence('comment', 'id')),
				text2ltree('0.' || currval( pg_get_serial_sequence('comment', 'id')) ),
				'http://lemmy-alpha:8541/comment/' || currval( pg_get_serial_sequence('comment', 'id') ),
				'ZipGen Stress-Test message in spread of communities\n\n comment ${now.toISOString()} c' || i
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
			FROM generate_series(1, 500) AS source(i)
			;

-- lemmy_helper comment3

			INSERT INTO comment
			( id, path, ap_id, content, post_id, creator_id, local, published )
			SELECT
				nextval(pg_get_serial_sequence('comment', 'id')),
				text2ltree('0.' || currval(pg_get_serial_sequence('comment', 'id')) ),
				'http://lemmy-alpha:8541/comment/' || currval( pg_get_serial_sequence('comment', 'id') ),
				'ZipGen Stress-Test message in Huge Community\n\n comment ${now.toISOString()} c' || i || '\n\n all from the same random user.'
					|| ' PostgreSQL comment id ' || currval( pg_get_serial_sequence('comment', 'id') ),
				-- NOT: source=source
				-- just one single random post in community
				(SELECT id FROM post
					WHERE community_id = 19
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
			FROM generate_series(1, 1500) AS source(i)
			;


-- lemmy_helper comment_reply0

			INSERT INTO comment
			( id, path, ap_id, content, post_id, creator_id, local, published )
			SELECT
				nextval(pg_get_serial_sequence('comment', 'id')),
				text2ltree( path::text || '.' || currval(pg_get_serial_sequence('comment', 'id')) ),
				'http://lemmy-slpha:8541/comment/' || currval( pg_get_serial_sequence('comment', 'id') ),
				'ZipGen Stress-Test message in Huge Community\n\n comment ${now.toISOString()} c' || '?' || '\n\n all from the same random user.'
					|| ' PostgreSQL comment id ' || currval( pg_get_serial_sequence('comment', 'id') )
					|| ' path ' || path::text
					|| '\n\n> ' || REPLACE(content, '\n', ' CRLF '),
				-- NOT: source=source
				-- just one single random post in community
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
			LIMIT 12000
			;
