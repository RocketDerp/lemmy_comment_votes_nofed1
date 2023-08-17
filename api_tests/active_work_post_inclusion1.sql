/*
"inclusion" is the term for a focus on:
   1. HARD SELECT filtering of posts before JOIN logic
   2. allowing small communities to be included even with their old content
   3. NOT being caught up in changes to logic regarding sorting order, presentation order, score on post, but focused on HARD performance predictability

   see:
      https://lemmy.ml/post/3471891
      
   The focus is on post
       comments do not carry the community_id or other filtering concepts, so even when diving directly into a comment listing that spans communities and multiple posts....
       the post filtering comees into play.
*/


SELECT ranked_recency.*
FROM
   (
      SELECT id, post_id, community_id, published,
          rank() OVER (
             PARTITION BY community_id
             ORDER BY published DESC, id DESC
           )
      FROM post_aggregates) ranked_recency
WHERE rank <= 3
ORDER BY community_id
-- limit only for interactive testing output
LIMIT 12
;


SELECT * FROM bench('
SELECT COUNT(ranked_recency.*) AS post_row_count
FROM
  (
     SELECT id, post_id, community_id, published,
        rank() OVER (
           PARTITION BY community_id
           ORDER BY published DESC, id DESC
           )
     FROM post_aggregates) ranked_recency
WHERE rank <= 1000
;'
, 1, 0);

