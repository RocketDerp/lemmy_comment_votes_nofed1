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
   WHERE nlevel(path) > (SELECT MAX(nlevel(path)) FROM comment) - 1
   LIMIT 15
   ;

SELECT id, path, post_id
	FROM comment
	WHERE nlevel(path) > 2
	LIMIT 15
	;

SELECT c.id, c.path, COUNT(c2.id) AS child_count
FROM comment c
JOIN comment c2 on c2.path <@ c.path
         AND c2.path != c.path
         AND c.path <@ '0.2334.4033'
GROUP BY c.id
;


/*
Research and study:
   https://stackoverflow.com/questions/24954606/postgres-ltree-query-count-joined-items-on-each-level-of-tree
*/
