SELECT count(*) AS comments_with_child_count_rows
    FROM comment_aggregates
    WHERE child_count > 0;

/*
lemmy_server's Rust code runs this:

        if let Some(parent_id) = parent_id {
          let top_parent = format!("0.{}", parent_id);
          let update_child_count_stmt = format!(
            "
update comment_aggregates ca set child_count = c.child_count
from (
  select c.id, c.path, count(c2.id) as child_count from comment c
  join comment c2 on c2.path <@ c.path and c2.path != c.path
  and c.path <@ '{top_parent}'
  group by c.id
) as c
where ca.comment_id = c.id"
          );

          sql_query(update_child_count_stmt).execute(conn).await?;
        }


NOTE:
can't use temp table while prototype in a different .sql file        
*/

SELECT id, path, post_id
   FROM comment
   WHERE nlevel(path) >= (SELECT MAX(nlevel(path)) FROM comment)
   LIMIT 15
   ;

/*
combine with subquery of Lemmy Rust update
   except count of all only one immediate level below
   loop as a emans to batch?
*/
SELECT id, path, post_id, nlevel(path) AS path_nlevel
   FROM comment AS c
   WHERE nlevel(path) >= (SELECT MAX(nlevel(path)) FROM comment)
   AND (
      -- this assumes child-count is 
      SELECT child_count
      FROM comment_aggregates WHERE comment_id = c.id
      ) = 0
   LIMIT 15
   ;

  
SELECT c.id, c.path, COUNT(c2.id) AS child_count
FROM comment c
JOIN comment c2 on c2.path <@ c.path
         AND c2.path != c.path
         AND c.path <@ '0.2334.4033'
GROUP BY c.id
;


SELECT id, path, post_id, nlevel(path) AS path_nlevel
	FROM comment
	WHERE nlevel(path) > 5
	LIMIT 15
	;

/*
Research and study:
   https://stackoverflow.com/questions/24954606/postgres-ltree-query-count-joined-items-on-each-level-of-tree
   
   useful?
       https://stackoverflow.com/questions/66497208/select-rows-and-have-children-of-said-rows-as-a-column-using-ltree
*/

/*
select id, path,
  (select array_agg(p.path)
	from comment p
	where p.path <@ t.path
	)
  from comment t
  where nlevel(path) > 2
  LIMIT 5
  ;
*/


-- https://stackoverflow.com/questions/57519302/postgresql-ltree-query-to-get-comment-threads-nested-json-array-and-build-html-f

SELECT nlevel(path) AS depth, id, path, subpath(path, 1, 1), post_id
  FROM comment
  ORDER BY nlevel(path) DESC
  LIMIT 15
  ;

-- some of these need pure benchmarking

SELECT count(distinct subpath(path, 1, 1))
   FROM comment
   LIMIT 15
   ;
 
