/*
Trying to figure out SQL method
*/



SELECT count(*) AS post_count, community_id
FROM post
GROUP BY community_id
ORDER BY post_count DESC
LIMIT 10
;
