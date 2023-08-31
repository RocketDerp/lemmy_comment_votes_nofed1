/*
"inclusion" is the term for a focus on:
   1. HARD SELECT filtering of posts before JOIN logic
   2. allowing small communities to be included even with their old content
   3. NOT being caught up in changes to logic regarding sorting order, presentation order, but focused on HARD performance predictability
   
   see:
      https://lemmy.ml/post/3471891
      
   The focus is on post
       comments do not carry the community_id or other filtering concepts, so even when diving directly into a comment listing that spans communities and multiple posts....
       the post filtering comees into play.
*/

SELECT posts, comments FROM site_aggregates WHERE site_id = 1;

SELECT COUNT(*) AS post_table_count FROM post;
SELECT COUNT(*) AS post_aggregates_table_count FROM post_aggregates;

SELECT MIN(published) AS oldest_published, MAX(published) AS newest_published from post_aggregates;;


/*
The trick:
   can I allow maximum of 10000 posts per community ordered by published?
   
Ideas:
  1) have a post_inclusion_id table with nothing but ID of post numbers
  2) there is no outer-limit, as communities can keep growing in number
  
research
  I don't really need a dynamic limit, 1000 is fine, but it needs to be per-community
  https://stackoverflow.com/questions/41336890/is-it-possible-to-use-limit-with-a-subquery-result
  I don't really need conditoinal limit, 1000 is always fine, but reference:
  https://stackoverflow.com/questions/71479694/query-to-select-limit-in-specific-condition
  
  this is intersting:
     https://stackoverflow.com/questions/18090285/using-postgres-rank-function-to-limit-to-n-top-results
  partititon and window by field:
     https://stackoverflow.com/questions/10466852/identifying-results-by-group-and-rank-using-sql
  select with group-by first?
    https://stackoverflow.com/questions/71074473/equivalent-for-fetch-first-with-ties-in-postgres-11-with-comparable-performance/71074731#71074731
*/

SELECT t1.post_id, t1.published, t1.community_id
    FROM post_aggregates t1
    INNER JOIN (
     SELECT post_id
     FROM post_aggregates
     WHERE community_id = 19
     ORDER BY published DESC
     LIMIT 1000
  ) AS t2 ON t1.post_id = t2.post_id
  -- ok, this sort serves to sort the entire result set to match what typical end-user browsing starts wtih 
  ORDER BY published
  -- REMOVE THIS LIMIT, only for interactive sampling
  LIMIT 12
  ;


SELECT id, community_id, published
    FROM post_aggregates
    WHERE id IN (
     SELECT id
     FROM post_aggregates
     WHERE community_id = 19
     ORDER BY published DESC
     LIMIT 1000
  )
  -- limit only for interactive testing output
  LIMIT 12
  ;

/*
SELECT id
    FROM my_table
    WHERE id IN (
     SELECT id
		 FROM my_table
		 WHERE criteria_a = 19
		 ORDER BY create_when DESC
		 LIMIT 1000
	UNION
	  SELECT id
		 FROM my_table
		 WHERE criteria_a = 20
		 ORDER BY create_when DESC
		 LIMIT 1000
     );

SELECT id, community_id, published
    FROM post_aggregates
    WHERE id IN (
     SELECT id
     FROM post_aggregates
     WHERE community_id = 19
     ORDER BY published DESC
     LIMIT 1000
     UNION
     SELECT id
     FROM post_aggregates
     WHERE community_id = 20
     ORDER BY published DESC
     LIMIT 1000
  )
  ORDER BY published DESC
  -- limit only for interactive testing output
  LIMIT 12
  ;

Actually UNION doesn't work with syntax

*/


SELECT id, community_id, published
    FROM post_aggregates
    WHERE id IN (
     SELECT id
     FROM post_aggregates
     WHERE community_id = 19
     ORDER BY published DESC
     LIMIT 1000
    )
    OR id IN (
     SELECT id
     FROM post_aggregates
     WHERE community_id = 20
     ORDER BY published DESC
     LIMIT 1000
    )
  ORDER BY published DESC
  -- limit only for interactive testing output
  LIMIT 12
  ;


/*	
SELECT id, community_id, published,
  RANK () OVER (
     PARTITION BY community_id
     ORDER BY published DESC
     TOP 1000
     -- LIMIT 1000
  )
  FROM post_aggregates
  -- limit only for interactive testing output
  LIMIT 12
  ;


WITH cte AS (
   SELECT community_id
   FROM post_aggregates
   GROUP BY community_id
   )
TABLE cte
UNION
(
     SELECT id
     FROM post_aggregates
     WHERE community_id = (SELECT id FROM cte)
     ORDER BY published DESC
     LIMIT 1000
)

select ranked_scores.* from 
(SELECT score_data.*,
  rank() OVER (PARTITION BY job_id ORDER BY score DESC)
  FROM score_data) ranked_scores 
where rank <=3

https://medium.com/@amulya349/how-to-select-top-n-rows-from-each-category-in-postgresql-39e3cfebb020
*/

SELECT ranked_recency.*
FROM
   (
      SELECT id, community_id, published,
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
 
SELECT COUNT(ranked_recency.*) AS post_row_count
FROM
  (
     SELECT id, community_id, published,
        rank() OVER (
           PARTITION BY community_id
           ORDER BY published DESC, id DESC
           )
     FROM post_aggregates) ranked_recency
WHERE rank <= 1000
;


SELECT COUNT(*) AS community_id_in_post_count
   FROM post_aggregates
   GROUP BY community_id
   ORDER BY community_id
   LIMIT 12
   ;

SELECT COUNT(DISTINCT community_id) AS community_id_count FROM post_aggregates;

