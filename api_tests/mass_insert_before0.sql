/*
   mass_insert_before0.sql
   run BEFORE maass INSERT on an isolated system.
   
   Perhaps create a special PostgreSQL ROLE/USER and lock out others during this, or set others to read-only.
   
   Background reading:
      https://www.cybertec-postgresql.com/en/why-are-my-postgresql-updates-getting-slower/


lemmy schema dump, 0.18.4
TABLE post focus of INSERT:

CREATE TRIGGER post_aggregates_post
  AFTER INSERT OR DELETE
   ON public.post FOR EACH ROW
   EXECUTE FUNCTION public.post_aggregates_post();

CREATE TRIGGER community_aggregates_post_count
  AFTER INSERT OR DELETE OR UPDATE OF removed, deleted
   ON public.post FOR EACH ROW
   EXECUTE FUNCTION public.community_aggregates_post_count();

CREATE TRIGGER site_aggregates_post_insert
  AFTER INSERT OR UPDATE OF removed, deleted
   ON public.post FOR EACH ROW WHEN ((new.local = true))
   EXECUTE FUNCTION public.site_aggregates_post_insert();

CREATE TRIGGER person_aggregates_post_count
  AFTER INSERT OR DELETE OR UPDATE OF removed, deleted
   ON public.post FOR EACH ROW
   EXECUTE FUNCTION public.person_aggregates_post_count();

*/


DROP TRIGGER site_aggregates_post_insert ON public.post;


/*
TRIGGER will be replaced with per-statement INSERT only
*/
CREATE TRIGGER site_aggregates_post_insert
   AFTER INSERT ON public.post
   REFERENCING NEW TABLE AS new_rows
   FOR EACH STATEMENT
   EXECUTE FUNCTION site_aggregates_post_insert();


DROP TRIGGER community_aggregates_post_count ON public.post;


/*
TRIGGER will be replaced with per-statement INSERT only
*/
CREATE TRIGGER community_aggregates_post_count
   AFTER INSERT ON public.post
   REFERENCING NEW TABLE AS new_rows
   FOR EACH STATEMENT
   EXECUTE FUNCTION community_aggregates_post_count();


/*
TRIGGER will be replaced with per-statement INSERT only
no Lemmy-delete or SQL DELETE to be performed during this period.
*/
CREATE OR REPLACE FUNCTION public.site_aggregates_post_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   UPDATE site_aggregates SET posts = posts +
      (SELECT count(*) FROM new_rows WHERE local = true)
      ;
   RETURN NULL;
END
$$;


/*
can we rework this UPDATE into?

			update comment_aggregates ca
         set child_count = c.child_count
			from (
			   select c.id, c.path, count(c2.id) as child_count from comment c
			   join comment c2 on c2.path <@ c.path and c2.path != c.path
			   and c.path <@ '0.1359561'
			   group by c.id
			     ) as c
			where ca.comment_id = c.id
*/

CREATE OR REPLACE FUNCTION public.community_aggregates_post_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
        UPDATE
            community_aggregates ca
        SET
            posts = posts + p.new_post_count
        FROM (
            SELECT count(*) AS new_post_count, community_id
            FROM new_rows
            GROUP BY community_id
             ) AS p
        WHERE
            ca.community_id = p.community_id;
    RETURN NULL;
END
$$;

/*
SELECT count(*) AS new_post_count, community_id
FROM post
GROUP BY community_id
ORDER BY post_count DESC
LIMIT 10
;
*/
