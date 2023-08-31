/*

*/


CREATE OR REPLACE FUNCTION lemmy_community_names_6(lemmy_markdown TEXT)
RETURNS text[] AS
$$
DECLARE
    community_pile_arr text[];
    one_match text[];
BEGIN
    FOR one_match IN SELECT (
      -- regexp_matches(lemmy_markdown, '(\/[cmu]\/|!)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 'g')
      regexp_matches(lemmy_markdown, '(\/[cmu]\/|!)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9\.\-\:]{2,})', 'g')
      ) AS match 
    LOOP
        RAISE NOTICE 'lemmy community 6 match array = %', one_match;
        community_pile_arr := array_append( community_pile_arr, one_match [2] );
    END LOOP;

    RETURN community_pile_arr;
END
$$ LANGUAGE plpgsql;



SELECT * FROM lemmy_community_names_6('hello world jim !community@server.com with another !finneganswake@bulletintree.com again');

SELECT * FROM lemmy_community_names_6(
  'hello world jim !community@server.com with another' ||
  ' !finneganswake@bulletintree.com again' ||
  ' three !zy_Ireland@lemmy-alpha:8541' ||
  ' four !multipass@bulletintree.com five /c/multipass@bulletintree.com'
  );

SELECT * FROM lemmy_community_names_6(
  ' six !zy_Ireland@lemmy-alpha' ||
  ' [!finneganswake@bulletintree.com](https://bulletintree.com/c/finneganswake)' ||
  ' !meta@lemmy.ml' ||
  ' and [!multipass@bulletintree.com](https://bulletintree.com/c/multipass)'
  );

SELECT * FROM lemmy_community_names_6(
  ' ten http://lemmy-alpha:8541/c/Dublin' ||
  ' eleven https://bulletintree.com/c/finneganswake' ||
  ' twelve /c/multipass' ||
  ' thirteen !multipass@bulletintree.com' ||
  ' howdy end'
  );

 


/*
=============================================================
=== find body of posts
*/

SELECT post.id AS post_id, post.name AS post_title, featured_community,
     multipass_community.*
  FROM post
  LEFT OUTER JOIN  (
     SELECT id, name AS community_name, title AS community_title, instance_id AS instance, posting_restricted_to_mods
     FROM community
     WHERE posting_restricted_to_mods = true
     ) AS multipass_community ON post.community_id = multipass_community.id
  WHERE featured_community = true
  AND multipass_community.posting_restricted_to_mods = true
  ;
 
SELECT post.id AS post_id, lemmy_community_names_6(body)
  FROM post
  LEFT OUTER JOIN  (
     SELECT id, name AS community_name, title AS community_title, instance_id AS instance, posting_restricted_to_mods
     FROM community
     WHERE posting_restricted_to_mods = true
     ) AS multipass_community ON post.community_id = multipass_community.id
  WHERE featured_community = true
  AND multipass_community.posting_restricted_to_mods = true
  ;
 
SELECT id, name, instance_id, actor_id
   FROM community
   ORDER BY id ASC
   LIMIT 5
   ;

-- how many subscribers to a community
SELECT * FROM (
  SELECT COUNT(person_id) AS count_members, community_id
  FROM community_follower
  GROUP BY community_id
) AS comm
WHERE comm.count_members > 1
ORDER BY comm.count_members DESC
;

-- person with most subscriptions
SELECT * FROM (
  SELECT COUNT(community_id) AS joined_count, person_id
  FROM community_follower
  GROUP BY person_id
  ORDER BY COUNT(community_id) DESC
  LIMIT 12
) AS comm
WHERE comm.joined_count > 1
ORDER BY comm.joined_count DESC
;


SELECT *
   FROM community_follower
   ORDER BY id ASC
   LIMIT 5
   ;

SELECT COUNT(*) AS community_follower_total_rows, COUNT(pending = true) pending, COUNT(pending = false) pending_false
   FROM community_follower
   ;
   
SELECT id, name FROM community ORDER BY id DESC LIMIT 5;

/*
so it seems person_id must be an already existing value
so we need to create at least one person account for multipass

CREATE TABLE public.community_follower (
    id integer NOT NULL,
    community_id integer NOT NULL,
    person_id integer NOT NULL,
    published timestamp without time zone DEFAULT now() NOT NULL,
    pending boolean DEFAULT false NOT NULL
);

uhh oh, this would be a problem for using a single person for mmultipass

ALTER TABLE ONLY public.community_follower
    ADD CONSTRAINT community_follower_community_id_person_id_key UNIQUE (community_id, person_id);

ok, so instead of using existing community_id...
person must have public key, msut have valid instance id (no -1).

The problem is that I can likely set a high value like 50,100 for a person, but then the next routien Lemmy person will get 50,101
  ACTUALLY NO, the sequence holds!
  And insert of -10 works. But can't use -1 due to how non-logged-in queries work currently.

*/
-- INSERT INTO community_follower (person_id, community_id, pending) VALUES (-1, 3, false);
-- worked: INSERT INTO community_follower (person_id, community_id, pending) VALUES (32, 12032, false);

-- SITE can crash on startup with migrations if this isn't right...
INSERT INTO person (id, name, public_key, instance_id, actor_id) VALUES (50100, 'multipass_zz',  'nokey', 1, 'http://lemmy-alpha:8541/u/' || 50100);
SELECT id, name FROM person ORDER BY id DESC LIMIT 3;
INSERT INTO community_follower (person_id, community_id, pending) VALUES (50100, 12032, false);

/* ok, that worked! */

-- SITE can crash on startup with migrations if this isn't right... actor_id
INSERT INTO person (id, name, public_key, instance_id, actor_id) VALUES (-10, 'multipass_zz',  'nokey multipass_virtual_person', 1, 'http://lemmy-alpha:8541/u/' || -10);
SELECT id, name FROM person ORDER BY id ASC LIMIT 3;
INSERT INTO community_follower (person_id, community_id, pending) VALUES (-10, 12032, false);


DELETE FROM community_follower WHERE person_id IN (50100, -10);
DELETE FROM person WHERE id IN (50100, -10);

SELECT * from language WHERE name like 'Yo%' LIMIT 5;
SELECT * from language WHERE name like 'Tw%' LIMIT 5;
