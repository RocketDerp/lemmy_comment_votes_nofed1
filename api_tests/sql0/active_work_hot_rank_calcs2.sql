
/*
===================================================
*/



/*
======================================================================================================
===== Hand-optimize
*/

SELECT 
   "post"."id" AS post_id, "post"."name" AS post_title,
   -- "post"."url", "post"."body", "post"."creator_id", "post"."community_id", "post"."removed", "post"."locked", "post"."published", "post"."updated", "post"."deleted", "post"."nsfw", "post"."embed_title", "post"."embed_description", "post"."thumbnail_url",
   -- "post"."ap_id", "post"."local", "post"."embed_video_url", "post"."language_id", "post"."featured_community", "post"."featured_local",
     "person"."id" AS p_id, "person"."name",
     -- "person"."display_name", "person"."avatar", "person"."banned", "person"."published", "person"."updated",
     -- "person"."actor_id", "person"."bio", "person"."local", "person"."private_key", "person"."public_key", "person"."last_refreshed_at", "person"."banner", "person"."deleted", "person"."inbox_url", "person"."shared_inbox_url", "person"."matrix_user_id", "person"."admin",
     -- "person"."bot_account", "person"."ban_expires",
     "person"."instance_id" AS p_inst,
   "community"."id" AS c_id, "community"."name" AS community_name,
   -- "community"."title", "community"."description", "community"."removed", "community"."published", "community"."updated", "community"."deleted",
   -- "community"."nsfw", "community"."actor_id", "community"."local", "community"."private_key", "community"."public_key", "community"."last_refreshed_at", "community"."icon", "community"."banner",
   -- "community"."followers_url", "community"."inbox_url", "community"."shared_inbox_url", "community"."hidden", "community"."posting_restricted_to_mods",
   "community"."instance_id" AS c_inst,
   -- "community"."moderators_url", "community"."featured_url",
     ("community_person_ban"."id" IS NOT NULL) AS ban,
   -- "post_aggregates"."id", "post_aggregates"."post_id", "post_aggregates"."comments", "post_aggregates"."score", "post_aggregates"."upvotes", "post_aggregates"."downvotes", "post_aggregates"."published",
   -- "post_aggregates"."newest_comment_time_necro", "post_aggregates"."newest_comment_time", "post_aggregates"."featured_community", "post_aggregates"."featured_local",
   --"post_aggregates"."hot_rank", "post_aggregates"."hot_rank_active", "post_aggregates"."community_id", "post_aggregates"."creator_id", "post_aggregates"."controversy_rank",
   --  "community_follower"."pending",
   ("post_saved"."id" IS NOT NULL) AS save,
   ("post_read"."id" IS NOT NULL) AS read,
   ("person_block"."id" IS NOT NULL) as block,
   "post_like"."score",
   coalesce(("post_aggregates"."comments" - "person_post_aggregates"."read_comments"), "post_aggregates"."comments") AS unread

FROM (
   ((((((((((
   (
	   (
	   "post_aggregates" 
	   INNER JOIN "person" ON ("post_aggregates"."creator_id" = "person"."id" AND "post_aggregates"."creator_id" = 3)
	   )
     INNER JOIN "community" ON 
       ("post_aggregates"."community_id" = "community"."id"
          AND ("community"."nsfw" = false)
          AND ("community"."deleted" = false)
          AND ("community"."removed" = false)
       )
   )
   LEFT OUTER JOIN "community_person_ban"
       ON (("post_aggregates"."community_id" = "community_person_ban"."community_id") AND ("community_person_ban"."person_id" = "post_aggregates"."creator_id"))
   )
   INNER JOIN "post" ON (
       "post_aggregates"."post_id" = "post"."id"
         AND ("post"."deleted" = false)
         AND ("post"."removed" = false)
         AND ("post"."nsfw" = false)
       )
   )
   LEFT OUTER JOIN "community_follower" ON (("post_aggregates"."community_id" = "community_follower"."community_id") AND ("community_follower"."person_id" = 3))
   )
   LEFT OUTER JOIN "community_moderator" ON (("post"."community_id" = "community_moderator"."community_id") AND ("community_moderator"."person_id" = 3))
   )
   LEFT OUTER JOIN "post_saved" ON (("post_aggregates"."post_id" = "post_saved"."post_id") AND ("post_saved"."person_id" = 3))
   )
   LEFT OUTER JOIN "post_read" ON (("post_aggregates"."post_id" = "post_read"."post_id") AND ("post_read"."person_id" = 3))
   )
   LEFT OUTER JOIN "person_block" ON
      (
         ("post_aggregates"."creator_id" = "person_block"."target_id")
         AND ("person_block"."person_id" = 3)
         --AND ("person_block"."person_id" IS NULL)
      )
   )
   LEFT OUTER JOIN "post_like" ON (("post_aggregates"."post_id" = "post_like"."post_id") AND ("post_like"."person_id" = 3))
   )
   LEFT OUTER JOIN "person_post_aggregates" ON 
     (
        ("post_aggregates"."post_id" = "person_post_aggregates"."post_id") 
        AND ("person_post_aggregates"."person_id" = 3)
     )
   )
   LEFT OUTER JOIN "community_block" ON
     (
        ("post_aggregates"."community_id" = "community_block"."community_id")
        AND ("community_block"."person_id" = 3)
        --AND ("community_block"."person_id" IS NULL)
     )
   )
   LEFT OUTER JOIN "local_user_language" ON
     (
         ("post"."language_id" = "local_user_language"."language_id")
         AND ("local_user_language"."local_user_id" = 3)
         --AND ("local_user_language"."language_id" IS NOT NULL)
     )
   )
WHERE 
  ("post_aggregates"."creator_id" = 3)
  AND post.language_id IN (SELECT "local_user_language"."language_id" FROM local_user_language WHERE "local_user_language"."local_user_id" = 3)
  AND post_aggregates.community_id NOT IN (SELECT community_id FROM community_block WHERE "community_block"."person_id" = 3)
  AND post_aggregates.creator_id NOT IN (SELECT target_id FROM person_block WHERE "person_block"."person_id" = 3)

ORDER BY "post_aggregates"."featured_local" DESC , "post_aggregates"."published" DESC
LIMIT 10
OFFSET 0
;

