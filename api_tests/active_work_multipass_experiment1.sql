/*

Cleaning this up, here is what is needed to know:
  https://stackoverflow.com/questions/52158569/postgresql-return-next-error-returned-more-than-one-row

*/


DROP FUNCTION parse_markdown_for_lemmy_community_names(text);

CREATE OR REPLACE FUNCTION parse_markdown_for_lemmy_community_names (lemmy_markdown TEXT)
RETURNS setof text[] AS
$$
BEGIN

-- hashtags
/*
SELECT 
    REGEXP_MATCHES('Learning #PostgreSQL #REGEXP_MATCHES', 
         '#([A-Za-z0-9_]+)', 
        'g');
*/

-- SELECT REGEXP_MATCHES(lemmy_markdown, '<value>(.*?)</value>', 'g');

-- SELECT REGEXP_MATCHES(lemmy_markdown, '(\/[cmu]\/|!)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 'g');

RETURN REGEXP_MATCHES(lemmy_markdown,
 '(\/[cmu]\/|!)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 'g');

END
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION parse_markdown_for_lemmy_community_names_3 (lemmy_markdown TEXT)
RETURNS ???? AS
$$
BEGIN

-- hashtags
/*
SELECT 
    REGEXP_MATCHES('Learning #PostgreSQL #REGEXP_MATCHES', 
         '#([A-Za-z0-9_]+)', 
        'g');
*/

-- SELECT REGEXP_MATCHES(lemmy_markdown, '<value>(.*?)</value>', 'g');

-- SELECT REGEXP_MATCHES(lemmy_markdown, '(\/[cmu]\/|!)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 'g');

RETURN REGEXP_MATCHES(lemmy_markdown,
 '(\/[cmu]\/|!)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 'g');

END
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION parse_markdown_lemmy_community_names_2 (lemmy_markdown TEXT)
RETURNS text[] AS
$$
BEGIN

	SELECT REGEXP_MATCHES(lemmy_markdown,
	 '(\/[cmu]\/|!)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 'g')
	 ;

END
$$
LANGUAGE SQL;



-- from lemmy-ui
/**
 * Accepted formats:
 * !community@server.com
 * /c/community@server.com
 * /m/community@server.com
 * /u/username@server.com
 */
-- export const instanceLinkRegex =  /(\/[cmu]\/|!)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;


SELECT REGEXP_MATCHES('hello world jim !community@server.com again',
 '(\/[cmu]\/|!)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 'g');
SELECT REGEXP_MATCHES('hello world jim /c/community@server.com again',
 '(\/[cmu]\/|!)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 'g');
SELECT REGEXP_MATCHES('hello world jim !community@server.com with another !finneganswake@bulletintree.com again',
 '(\/[cmu]\/|!)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 'g');
SELECT REGEXP_MATCHES('hello world jim !community@server.com with another !finneganswake@bulletintree.com again',
 '(\/[cmu]\/|!)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 'g');

SELECT parse_markdown_for_lemmy_community_names('hello world jim !community@server.com with another !finneganswake@bulletintree.com again');
SELECT parse_markdown_for_lemmy_community_names('hello world jim with another !finneganswake@bulletintree.com again');

SELECT parse_markdown_lemmy_community_names_2('hello world jim !community@server.com with another !finneganswake@bulletintree.com again');

SELECT parse_markdown_lemmy_community_names_3('hello world jim !community@server.com with another !finneganswake@bulletintree.com again');


SELECT * FROM community_moderator LIMIT 10;

/*
id | name | title |          description          | removed |         published          | updated | deleted | nsfw |            actor_id            | local |                           private_key                            |                            public_key                            |     last_refreshed_at      | icon | banner |              followers_url               |              inbox_url               |       shared_inbox_url        | hidden | posting_restricted_to_mods | instance_id | moderators_url | featured_url 
SELECT  id , name , title ,          description          , removed ,         published          , updated , deleted , nsfw ,            actor_id            , local ,     last_refreshed_at      , icon , banner ,              followers_url               ,              inbox_url               ,       shared_inbox_url        , hidden , posting_restricted_to_mods , instance_id , moderators_url , featured_url
*/
-- SELECT * FROM community LIMIT 1;

-- SELECT  id , name , title, actor_id, instance_id, local, hidden, posting_restricted_to_mods AS mods, published, updated, last_refreshed_at

SELECT  id, name, title, actor_id, instance_id AS inst, local, hidden, posting_restricted_to_mods AS mods_only
  FROM community
  WHERE posting_restricted_to_mods = true
  ORDER BY updated DESC, id DESC
  LIMIT 5;


/*
   id    |     name      |   id    |     name      | url |                                                       body                                                       | creator_id | community_id | removed | locked |         published          | updated | deleted | nsfw | embed_title | embed_description | thumbnail_url |                ap_id                 | local | embed_video_url | language_id | featured_community | featured_local
*/

/*
SELECT post.id AS post_id, post.name AS post_title, featured_community,
     body,
     multipass_community.*
  FROM post
  LEFT OUTER JOIN  (
     SELECT id, name AS community_name, title AS community_title, instance_id AS instance
     FROM community
     WHERE posting_restricted_to_mods = true
     ) AS multipass_community ON post.community_id = multipass_community.id
  WHERE featured_community = true;
*/

/*
SELECT id, name, * FROM post
   WHERE featured_community = true
   LIMIT 2;
*/

SELECT post.id AS post_id, post.name AS post_title, featured_community,
     multipass_community.*
  FROM post
  LEFT OUTER JOIN  (
     SELECT id, name AS community_name, title AS community_title, instance_id AS instance
     FROM community
     WHERE posting_restricted_to_mods = true
     ) AS multipass_community ON post.community_id = multipass_community.id
  WHERE featured_community = true;
