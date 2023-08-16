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


DROP TRIGGER person_aggregates_post_count ON public.post;


/*
TRIGGER will be replaced with per-statement INSERT only
*/
CREATE TRIGGER person_aggregates_post_count
   AFTER INSERT ON public.post
   REFERENCING NEW TABLE AS new_rows
   FOR EACH STATEMENT
   EXECUTE FUNCTION person_aggregates_post_count();



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
TRIGGER will be replaced with per-statement INSERT only
no Lemmy-delete or SQL DELETE to be performed during this period.
*/
CREATE OR REPLACE FUNCTION public.person_aggregates_post_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
        UPDATE
            person_aggregates personagg
        SET
            post_count = post_count + p.new_post_count
        FROM (
            SELECT count(*) AS new_post_count, creator_id
            FROM new_rows
            GROUP BY creator_id
             ) AS p
        WHERE
            personagg.person_id = p.creator_id;

    RETURN NULL;
END
$$;
