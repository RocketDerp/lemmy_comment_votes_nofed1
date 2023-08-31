-- SET TIME ZONE 'UTC';
SET TIME ZONE 'US/Arizona';

SELECT hot_rank(1::numeric, CURRENT_TIMESTAMP::timestamp) AS hot_rank_now_score_1, CURRENT_TIMESTAMP;

SELECT hot_rank(3::numeric, CURRENT_TIMESTAMP::timestamp) AS hot_rank_now_score_3, CURRENT_TIMESTAMP;

SELECT hot_rank(-1::numeric, CURRENT_TIMESTAMP::timestamp) AS hot_rank_now_score_neg1, CURRENT_TIMESTAMP;

SELECT post_id, hot_rank, hot_rank_active, controversy_rank, published FROM post_aggregates
   WHERE hot_rank != 0
   ORDER BY hot_rank DESC
   LIMIT 12;

SELECT COUNT(*) AS count_hot_rank_not_zero, MIN(hot_rank), MAX(hot_rank), MIN(hot_rank_active), MAX(hot_rank_active)
   FROM post_aggregates
   WHERE hot_rank != 0;

/*
I used lemmy-ui to create a new post, and that last query revealed:
 5431038 |     1703 | 2023-08-18 16:29:11.809382
 
Fresh new post added, after 25 minutes here is what:
 post_id | hot_rank | hot_rank_active |         published          
---------+----------+-----------------+----------------------------
 5431039 |     1728 |            1728 | 2023-08-18 16:50:53.661371
 5431038 |     1378 |            1378 | 2023-08-18 16:29:11.809382
 
at 30 minutes after the first post:
 post_id | hot_rank | hot_rank_active |         published          
---------+----------+-----------------+----------------------------
 5431039 |     1503 |            1503 | 2023-08-18 16:50:53.661371
 5431038 |     1138 |            1138 | 2023-08-18 16:29:11.809382

***************************************************************************
almost an hour later:

hot_rank_now_score_1 |       current_timestamp       
----------------------+-------------------------------
                  115 | 2023-08-18 10:28:00.718861-07
(1 row)

 hot_rank_now_score_3 |       current_timestamp       
----------------------+-------------------------------
                  149 | 2023-08-18 10:28:00.720928-07
(1 row)

 hot_rank_now_score_neg1 |       current_timestamp       
-------------------------+-------------------------------
                      57 | 2023-08-18 10:28:00.721098-07
(1 row)

 post_id | hot_rank | hot_rank_active |         published          
---------+----------+-----------------+----------------------------
 5431039 |     1240 |            1240 | 2023-08-18 16:50:53.661371
 5431038 |      964 |             964 | 2023-08-18 16:29:11.809382
      11 |       21 |              21 | 2023-08-17 03:56:30.698409
      30 |       21 |              21 | 2023-08-17 03:56:32.232072
      22 |       21 |              21 | 2023-08-17 03:56:31.655815
      36 |       21 |              21 | 2023-08-17 03:56:32.702168
      35 |       21 |              21 | 2023-08-17 03:56:32.613564
       2 |       21 |              21 | 2023-08-17 03:56:29.878641
       8 |       21 |              21 | 2023-08-17 03:56:30.45048
       6 |       21 |              21 | 2023-08-17 03:56:30.263522
       3 |       21 |              21 | 2023-08-17 03:56:29.958369
      29 |       21 |              21 | 2023-08-17 03:56:32.16813
(12 rows)

 count_hot_rank_not_zero | min | max  | min | max  
-------------------------+-----+------+-----+------
                  171188 |   1 | 1240 |   1 | 1240
(1 row)

   extract    |    current_time    
--------------+--------------------
 25200.000000 | 10:28:01.478451-07
(1 row)

 extract  |        current_now         
----------+----------------------------
 0.000000 | 2023-08-18 17:28:01.478846
(1 row)

 hot_rank_now_score_1 |        current_now         
----------------------+----------------------------
                    0 | 2023-08-18 17:28:01.478972
(1 row)

 hot_rank_now_score_3 |        current_now         
----------------------+----------------------------
                    0 | 2023-08-18 17:28:01.479122
(1 row)

 hot_rank_now_score_neg1 |        current_now         
-------------------------+----------------------------
                       0 | 2023-08-18 17:28:01.479229
(1 row)

 
*/

SELECT EXTRACT(EPOCH FROM (timezone('utc', now()) - CURRENT_TIMESTAMP)), CURRENT_TIME;

SELECT EXTRACT(EPOCH FROM (timezone('utc', now()) - timezone('utc', now())::timestamp)), timezone('utc', now())::timestamp AS current_now;

SET TIME ZONE 'UTC';

-- it seems hot_rank function returns 0 if the time is exactly the current time.
SELECT hot_rank(1::numeric, timezone('utc', now())::timestamp) AS hot_rank_now_score_1, timezone('utc', now())::timestamp AS current_now;

SELECT hot_rank(3::numeric, timezone('utc', now())) AS hot_rank_now_score_3, timezone('utc', now()) AS current_now;

SELECT hot_rank(-1::numeric, timezone('utc', now())) AS hot_rank_now_score_neg1, timezone('utc', now()) AS current_now;

-- tweak time and it works fine
SELECT hot_rank(3::numeric, timezone('utc', now() - interval '1 hour')) AS hot_rank_now_minus1hour_score_3, timezone('utc', now() - interval '1 hour') AS current_now;

SELECT hot_rank(3::numeric, timezone('utc', now() - interval '1 second')) AS hot_rank_now_minus1second_score_3, timezone('utc', now() - interval '1 second') AS current_now;

SELECT hot_rank(3::numeric, timezone('utc', now() - interval '1 minute')) AS hot_rank_now_minus1minute_score_3, timezone('utc', now() - interval '1 minute') AS current_now;

-- one minute in future, also returns 0
SELECT hot_rank(3::numeric, timezone('utc', now() + interval '1 minute')) AS hot_rank_now_plus1minute_score_3, timezone('utc', now() + interval '1 minute') AS current_now;


-- when does hot_rank go flat like old soda?

SELECT hot_rank(250::numeric, timezone('utc', now() - interval '1 second')) AS hot_rank_now_minus1second_score_250, timezone('utc', now() - interval '1 second') AS current_now;

SELECT hot_rank(250::numeric, timezone('utc', now() - interval '1 day')) AS hot_rank_now_minus1day_score_250, timezone('utc', now() - interval '1 day') AS current_now;

SELECT hot_rank(250::numeric, timezone('utc', now() - interval '2 day')) AS hot_rank_now_minus2day_score_250, timezone('utc', now() - interval '2 day') AS current_now;

SELECT hot_rank(250::numeric, timezone('utc', now() - interval '3 day')) AS hot_rank_now_minus3day_score_250, timezone('utc', now() - interval '3 day') AS current_now;

SELECT hot_rank(250::numeric, timezone('utc', now() - interval '6 day')) AS hot_rank_now_minus6day_score_250, timezone('utc', now() - interval '6 day') AS current_now;

SELECT hot_rank(250::numeric, timezone('utc', now() - interval '9 day')) AS hot_rank_now_minus9day_score_250, timezone('utc', now() - interval '9 day') AS current_now;

SELECT hot_rank(250::numeric, timezone('utc', now() - interval '12 day')) AS hot_rank_now_minus12day_score_250, timezone('utc', now() - interval '12 day') AS current_now;

SELECT hot_rank(250::numeric, timezone('utc', now() - interval '22 day')) AS hot_rank_now_minus22day_score_250, timezone('utc', now() - interval '22 day') AS current_now;


/*
===================================================
*/

/*
SELECT "post"."id", "post"."name", "post"."url", "post"."body", "post"."creator_id", "post"."community_id", "post"."removed", "post"."locked", "post"."published",
  "post"."updated", "post"."deleted", "post"."nsfw", "post"."embed_title", "post"."embed_description", "post"."thumbnail_url", "post"."ap_id", "post"."local",
  "post"."embed_video_url", "post"."language_id", "post"."featured_community", "post"."featured_local", "person"."id", "person"."name", "person"."display_name",
  "person"."avatar", "person"."banned", "person"."published", "person"."updated", "person"."actor_id", "person"."bio", "person"."local", "person"."private_key",
  "person"."public_key", "person"."last_refreshed_at", "person"."banner", "person"."deleted", "person"."inbox_url", "person"."shared_inbox_url",
  "person"."matrix_user_id", "person"."admin", "person"."bot_account", "person"."ban_expires", "person"."instance_id", "community"."id", "community"."name",
  "community"."title", "community"."description", "community"."removed", "community"."published", "community"."updated", "community"."deleted", "community"."nsfw",
  "community"."actor_id", "community"."local", "community"."private_key", "community"."public_key", "community"."last_refreshed_at", "community"."icon",
  "community"."banner", "community"."followers_url", "community"."inbox_url", "community"."shared_inbox_url", "community"."hidden",
  "community"."posting_restricted_to_mods", "community"."instance_id", "community"."moderators_url", "community"."featured_url",
   ("community_person_ban"."id" IS NOT NULL),
   "post_aggregates"."id", "post_aggregates"."post_id", "post_aggregates"."comments", "post_aggregates"."score", "post_aggregates"."upvotes",
   "post_aggregates"."downvotes", "post_aggregates"."published", "post_aggregates"."newest_comment_time_necro", "post_aggregates"."newest_comment_time",
   "post_aggregates"."featured_community", "post_aggregates"."featured_local", "post_aggregates"."hot_rank", "post_aggregates"."hot_rank_active", "post_aggregates"."community_id",
   "post_aggregates"."creator_id", "post_aggregates"."controversy_rank", "community_follower"."pending",
    ("post_saved"."id" IS NOT NULL),
    ("post_read"."id" IS NOT NULL),
    ("person_block"."id" IS NOT NULL), 
    "post_like"."score",
     coalesce(("post_aggregates"."comments" - "person_post_aggregates"."read_comments"),
     "post_aggregates"."comments")
      FROM ((((((((((((("post_aggregates"
       INNER JOIN "person" ON ("post_aggregates"."creator_id" = "person"."id"))
       INNER JOIN "community" ON ("post_aggregates"."community_id" = "community"."id"))
       LEFT OUTER JOIN "community_person_ban" ON (("post_aggregates"."community_id" = "community_person_ban"."community_id")
          AND ("community_person_ban"."person_id" = "post_aggregates"."creator_id")))
       INNER JOIN "post" ON ("post_aggregates"."post_id" = "post"."id"))
       LEFT OUTER JOIN "community_follower" ON (("post_aggregates"."community_id" = "community_follower"."community_id") AND ("community_follower"."person_id" = $1)))
       LEFT OUTER JOIN "community_moderator" ON (("post"."community_id" = "community_moderator"."community_id") AND ("community_moderator"."person_id" = $2)))
       LEFT OUTER JOIN "post_saved" ON (("post_aggregates"."post_id" = "post_saved"."post_id") AND ("post_saved"."person_id" = $3)))
       LEFT OUTER JOIN "post_read" ON (("post_aggregates"."post_id" = "post_read"."post_id") AND ("post_read"."person_id" = $4)))
       LEFT OUTER JOIN "person_block" ON (("post_aggregates"."creator_id" = "person_block"."target_id") AND ("person_block"."person_id" = $5)))
       LEFT OUTER JOIN "post_like" ON (("post_aggregates"."post_id" = "post_like"."post_id") AND ("post_like"."person_id" = $6)))
       LEFT OUTER JOIN "person_post_aggregates" ON (("post_aggregates"."post_id" = "person_post_aggregates"."post_id") AND ("person_post_aggregates"."person_id" = $7)))
       LEFT OUTER JOIN "community_block" ON (("post_aggregates"."community_id" = "community_block"."community_id") AND ("community_block"."person_id" = $8)))
       LEFT OUTER JOIN "local_user_language" ON (("post"."language_id" = "local_user_language"."language_id") AND ("local_user_language"."local_user_id" = $9)))
       WHERE (((((((("community"."removed" = $10) AND ("post"."removed" = $11)) AND ("community_follower"."pending" IS NOT NULL))
        AND ("post"."nsfw" = $12)) AND ("community"."nsfw" = $13)) AND ("local_user_language"."language_id" IS NOT NULL))
        AND ("community_block"."person_id" IS NULL)) AND ("person_block"."person_id" IS NULL))
       ORDER BY "post_aggregates"."featured_local" DESC , "post_aggregates"."hot_rank_active" DESC , "post_aggregates"."published" DESC
        LIMIT $14
        OFFSET $15
        ;
 */
 


CREATE OR REPLACE FUNCTION do_lemmy_list_a(param_a_1 BigInt, param_local_user BigInt, com_removed boolean, param_limit BigInt, param_offset BigInt)
RETURNS VOID AS
$$
BEGIN

SELECT "post"."id", "post"."name", "post"."url", "post"."body", "post"."creator_id", "post"."community_id", "post"."removed", "post"."locked", "post"."published",
  "post"."updated", "post"."deleted", "post"."nsfw", "post"."embed_title", "post"."embed_description", "post"."thumbnail_url", "post"."ap_id", "post"."local",
  "post"."embed_video_url", "post"."language_id", "post"."featured_community", "post"."featured_local", "person"."id", "person"."name", "person"."display_name",
  "person"."avatar", "person"."banned", "person"."published", "person"."updated", "person"."actor_id", "person"."bio", "person"."local", "person"."private_key",
  "person"."public_key", "person"."last_refreshed_at", "person"."banner", "person"."deleted", "person"."inbox_url", "person"."shared_inbox_url",
  "person"."matrix_user_id", "person"."admin", "person"."bot_account", "person"."ban_expires", "person"."instance_id", "community"."id", "community"."name",
  "community"."title", "community"."description", "community"."removed", "community"."published", "community"."updated", "community"."deleted", "community"."nsfw",
  "community"."actor_id", "community"."local", "community"."private_key", "community"."public_key", "community"."last_refreshed_at", "community"."icon",
  "community"."banner", "community"."followers_url", "community"."inbox_url", "community"."shared_inbox_url", "community"."hidden",
  "community"."posting_restricted_to_mods", "community"."instance_id", "community"."moderators_url", "community"."featured_url",
   ("community_person_ban"."id" IS NOT NULL),
   "post_aggregates"."id", "post_aggregates"."post_id", "post_aggregates"."comments", "post_aggregates"."score", "post_aggregates"."upvotes",
   "post_aggregates"."downvotes", "post_aggregates"."published", "post_aggregates"."newest_comment_time_necro", "post_aggregates"."newest_comment_time",
   "post_aggregates"."featured_community", "post_aggregates"."featured_local", "post_aggregates"."hot_rank", "post_aggregates"."hot_rank_active", "post_aggregates"."community_id",
   "post_aggregates"."creator_id", "post_aggregates"."controversy_rank", "community_follower"."pending",
    ("post_saved"."id" IS NOT NULL),
    ("post_read"."id" IS NOT NULL),
    ("person_block"."id" IS NOT NULL), 
    "post_like"."score",
     coalesce(("post_aggregates"."comments" - "person_post_aggregates"."read_comments"),
     "post_aggregates"."comments")
      FROM ((((((((((((("post_aggregates"
       INNER JOIN "person" ON ("post_aggregates"."creator_id" = "person"."id"))
       INNER JOIN "community" ON ("post_aggregates"."community_id" = "community"."id"))
       LEFT OUTER JOIN "community_person_ban" ON (("post_aggregates"."community_id" = "community_person_ban"."community_id")
          AND ("community_person_ban"."person_id" = "post_aggregates"."creator_id")))
       INNER JOIN "post" ON ("post_aggregates"."post_id" = "post"."id"))
       LEFT OUTER JOIN "community_follower" ON (("post_aggregates"."community_id" = "community_follower"."community_id") AND ("community_follower"."person_id" = param_a_1)))
       LEFT OUTER JOIN "community_moderator" ON (("post"."community_id" = "community_moderator"."community_id") AND ("community_moderator"."person_id" = param_a_1)))
       LEFT OUTER JOIN "post_saved" ON (("post_aggregates"."post_id" = "post_saved"."post_id") AND ("post_saved"."person_id" = param_a_1)))
       LEFT OUTER JOIN "post_read" ON (("post_aggregates"."post_id" = "post_read"."post_id") AND ("post_read"."person_id" = param_a_1)))
       LEFT OUTER JOIN "person_block" ON (("post_aggregates"."creator_id" = "person_block"."target_id") AND ("person_block"."person_id" = param_a_1)))
       LEFT OUTER JOIN "post_like" ON (("post_aggregates"."post_id" = "post_like"."post_id") AND ("post_like"."person_id" = param_a_1)))
       LEFT OUTER JOIN "person_post_aggregates" ON (("post_aggregates"."post_id" = "person_post_aggregates"."post_id") AND ("person_post_aggregates"."person_id" = param_a_1)))
       LEFT OUTER JOIN "community_block" ON (("post_aggregates"."community_id" = "community_block"."community_id") AND ("community_block"."person_id" = param_a_1)))
       LEFT OUTER JOIN "local_user_language" ON (("post"."language_id" = "local_user_language"."language_id") AND ("local_user_language"."local_user_id" = param_local_user)))
       WHERE (((((((("community"."removed" = com_removed) AND ("post"."removed" = com_removed)) AND ("community_follower"."pending" IS NOT NULL))
        AND ("post"."nsfw" = com_removed)) AND ("community"."nsfw" = com_removed)) AND ("local_user_language"."language_id" IS NOT NULL))
        AND ("community_block"."person_id" IS NULL)) AND ("person_block"."person_id" IS NULL))
       ORDER BY "post_aggregates"."featured_local" DESC , "post_aggregates"."hot_rank_active" DESC , "post_aggregates"."published" DESC
        LIMIT param_limit
        OFFSET param_offset
        ;

   
END
$$
LANGUAGE plpgsql;


--SELECT do_lemmy_list_a(3, 2, false, 20, 0);
-- parameters: $1 = '3', $2 = '3', $3 = '3', $4 = '3', $5 = '3', $6 = '3', $7 = '3', $8 = '3', $9 = '2', $10 = 'f', $11 = 'f', $12 = 'f', $13 = 'f', $14 = '20', $15 = '0'


SELECT "post"."id", "post"."name", "post"."url", "post"."body", "post"."creator_id", "post"."community_id", "post"."removed", "post"."locked", "post"."published",
  "post"."updated", "post"."deleted", "post"."nsfw", "post"."embed_title", "post"."embed_description", "post"."thumbnail_url", "post"."ap_id", "post"."local",
  "post"."embed_video_url", "post"."language_id", "post"."featured_community", "post"."featured_local", "person"."id", "person"."name", "person"."display_name",
  "person"."avatar", "person"."banned", "person"."published", "person"."updated", "person"."actor_id", "person"."bio", "person"."local", "person"."private_key",
  "person"."public_key", "person"."last_refreshed_at", "person"."banner", "person"."deleted", "person"."inbox_url", "person"."shared_inbox_url",
  "person"."matrix_user_id", "person"."admin", "person"."bot_account", "person"."ban_expires", "person"."instance_id", "community"."id", "community"."name",
  "community"."title", "community"."description", "community"."removed", "community"."published", "community"."updated", "community"."deleted", "community"."nsfw",
  "community"."actor_id", "community"."local", "community"."private_key", "community"."public_key", "community"."last_refreshed_at", "community"."icon",
  "community"."banner", "community"."followers_url", "community"."inbox_url", "community"."shared_inbox_url", "community"."hidden",
  "community"."posting_restricted_to_mods", "community"."instance_id", "community"."moderators_url", "community"."featured_url",
   ("community_person_ban"."id" IS NOT NULL),
   "post_aggregates"."id", "post_aggregates"."post_id", "post_aggregates"."comments", "post_aggregates"."score", "post_aggregates"."upvotes",
   "post_aggregates"."downvotes", "post_aggregates"."published", "post_aggregates"."newest_comment_time_necro", "post_aggregates"."newest_comment_time",
   "post_aggregates"."featured_community", "post_aggregates"."featured_local", "post_aggregates"."hot_rank", "post_aggregates"."hot_rank_active", "post_aggregates"."community_id",
   "post_aggregates"."creator_id", "post_aggregates"."controversy_rank", "community_follower"."pending",
    ("post_saved"."id" IS NOT NULL),
    ("post_read"."id" IS NOT NULL),
    ("person_block"."id" IS NOT NULL), 
    "post_like"."score",
     coalesce(("post_aggregates"."comments" - "person_post_aggregates"."read_comments"),
     "post_aggregates"."comments")
      FROM ((((((((((((("post_aggregates"
       INNER JOIN "person" ON ("post_aggregates"."creator_id" = "person"."id"))
       INNER JOIN "community" ON ("post_aggregates"."community_id" = "community"."id"))
       LEFT OUTER JOIN "community_person_ban" ON (("post_aggregates"."community_id" = "community_person_ban"."community_id")
          AND ("community_person_ban"."person_id" = "post_aggregates"."creator_id")))
       INNER JOIN "post" ON ("post_aggregates"."post_id" = "post"."id"))
       LEFT OUTER JOIN "community_follower" ON (("post_aggregates"."community_id" = "community_follower"."community_id") AND ("community_follower"."person_id" = 3)))
       LEFT OUTER JOIN "community_moderator" ON (("post"."community_id" = "community_moderator"."community_id") AND ("community_moderator"."person_id" = 3)))
       LEFT OUTER JOIN "post_saved" ON (("post_aggregates"."post_id" = "post_saved"."post_id") AND ("post_saved"."person_id" = 3)))
       LEFT OUTER JOIN "post_read" ON (("post_aggregates"."post_id" = "post_read"."post_id") AND ("post_read"."person_id" = 3)))
       LEFT OUTER JOIN "person_block" ON (("post_aggregates"."creator_id" = "person_block"."target_id") AND ("person_block"."person_id" = 3)))
       LEFT OUTER JOIN "post_like" ON (("post_aggregates"."post_id" = "post_like"."post_id") AND ("post_like"."person_id" = 3)))
       LEFT OUTER JOIN "person_post_aggregates" ON (("post_aggregates"."post_id" = "person_post_aggregates"."post_id") AND ("person_post_aggregates"."person_id" = 3)))
       LEFT OUTER JOIN "community_block" ON (("post_aggregates"."community_id" = "community_block"."community_id") AND ("community_block"."person_id" = 3)))
       LEFT OUTER JOIN "local_user_language" ON (("post"."language_id" = "local_user_language"."language_id") AND ("local_user_language"."local_user_id" = 2)))
       WHERE (((((((("community"."removed" = false) AND ("post"."removed" = false)) AND ("community_follower"."pending" IS NOT NULL))
        AND ("post"."nsfw" = false)) AND ("community"."nsfw" = false)) AND ("local_user_language"."language_id" IS NOT NULL))
        AND ("community_block"."person_id" IS NULL)) AND ("person_block"."person_id" IS NULL))
       ORDER BY "post_aggregates"."featured_local" DESC , "post_aggregates"."hot_rank_active" DESC , "post_aggregates"."published" DESC
        LIMIT 1
        OFFSET 0
        ;
        




SET geqo = on;
SET geqo_threshold = 12;
SET from_collapse_limit = 15;
SET join_collapse_limit = 15;

ALTER ROLE lemmy SET geqo = on;
ALTER ROLE lemmy SET geqo_threshold = 12;
ALTER ROLE lemmy SET from_collapse_limit = 15;
ALTER ROLE lemmy SET join_collapse_limit = 15;


ALTER DATABASE lemmy_alpha SET geqo = on;
ALTER DATABASE lemmy_alpha SET geqo_threshold = 12;
ALTER DATABASE lemmy_alpha SET from_collapse_limit = 15;
ALTER DATABASE lemmy_alpha SET join_collapse_limit = 15;

ALTER DATABASE lemmy SET geqo = on;
ALTER DATABASE lemmy SET geqo_threshold = 12;
ALTER DATABASE lemmy SET from_collapse_limit = 15;
ALTER DATABASE lemmy SET join_collapse_limit = 15;
