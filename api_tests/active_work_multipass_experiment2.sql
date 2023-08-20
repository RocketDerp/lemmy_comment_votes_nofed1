
CREATE OR REPLACE FUNCTION lemmy_community_names_4 (lemmy_markdown TEXT)
RETURNS void AS
$$
declare
  arr1 text[] ;
  var int;

BEGIN



arr1 := REGEXP_MATCHES('hello world jim !community@server.com with another !finneganswake@bulletintree.com again',
 '(\/[cmu]\/|!)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 'g');

  <<"FOREACH eaxmple">>
  foreach var in array arr1 loop
    raise info '%', var;
  end loop "FOREACH eaxmple";

END
$$
LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION lemmy_community_names_6 (lemmy_markdown TEXT)
RETURNS text[] AS $$
DECLARE
    community_pile_arr text[];
    one_match text;
BEGIN
    FOR one_match IN SELECT (
      regexp_matches(lemmy_markdown, '(\/[cmu]\/|!)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 'g')
      ) AS match 
    LOOP
        RAISE NOTICE 'lemmy community match array = %', one_match;
        community_pile_arr := array_append( community_pile_arr, one_match );
    END LOOP;

    RETURN community_pile_arr;
END;
$$ LANGUAGE plpgsql;



-- from lemmy-ui
/**
 * Accepted formats:
 * !community@server.com
 * /c/community@server.com
 * /m/community@server.com
 * /u/username@server.com
 */
-- export const instanceLinkRegex =  /(\/[cmu]\/|!)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;


-- SELECT lemmy_community_names_4('hello world jim !community@server.com with another !finneganswake@bulletintree.com again');

SELECT * FROM lemmy_community_names_6('hello world jim !community@server.com with another !finneganswake@bulletintree.com again');

SELECT * FROM lemmy_community_names_6(
  'hello world jim !community@server.com with another' ||
  ' !finneganswake@bulletintree.com again' ||
  ' three !zy_Ireland@lemmy-alpha:8541' ||
  ' four !multipass@bulletintree.com five /c/multipass@bulletintree.com' ||
  ' six !zy_Ireland@lemmy-alpha' ||
  ' [!finneganswake@bulletintree.com](https://bulletintree.com/c/finneganswake)' ||
  ' !meta@lemmy.ml' ||
  ' and [!multipass@bulletintree.com](https://bulletintree.com/c/multipass)'
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
 
