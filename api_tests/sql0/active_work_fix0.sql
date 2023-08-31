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






DELETE FROM community WHERE name LIKE 'zzy_com_%';
SELECT count(*) AS community_count FROM community;

-- communities come first in Lemmy, lemmy.world has over 10,000 locally
SELECT 'mass_create_communities kicking off' AS status_message;
SELECT * FROM bench('SELECT mass_create_communities(12000);', 1, 0);

SELECT count(*) AS community_count FROM community;
