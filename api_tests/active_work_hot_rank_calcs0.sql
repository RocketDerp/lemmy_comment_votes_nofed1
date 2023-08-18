SELECT hot_rank(1::numeric, CURRENT_TIMESTAMP::timestamp) AS hot_rank_now_score_1, CURRENT_TIMESTAMP;

SELECT hot_rank(3::numeric, CURRENT_TIMESTAMP::timestamp) AS hot_rank_now_score_3, CURRENT_TIMESTAMP;

SELECT hot_rank(-1::numeric, CURRENT_TIMESTAMP::timestamp) AS hot_rank_now_score_neg1, CURRENT_TIMESTAMP;

SELECT post_id, hot_rank, hot_rank_active, published FROM post_aggregates
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


SELECT hot_rank(1::numeric, timezone('utc', now())::timestamp) AS hot_rank_now_score_1, timezone('utc', now())::timestamp AS current_now;

SELECT hot_rank(3::numeric, timezone('utc', now())) AS hot_rank_now_score_3, timezone('utc', now()) AS current_now;

SELECT hot_rank(-1::numeric, timezone('utc', now())) AS hot_rank_now_score_neg1, timezone('utc', now()) AS current_now;

