-- lemmy 0.18.4 schema dump
CREATE OR REPLACE FUNCTION public.community_aggregates_post_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (was_restored_or_created (TG_OP, OLD, NEW)) THEN
        UPDATE
            community_aggregates
        SET
            posts = posts + 1
        WHERE
            community_id = NEW.community_id;
        IF (TG_OP = 'UPDATE') THEN
            -- Post was restored, so restore comment counts as well
            UPDATE
                community_aggregates ca
            SET
                posts = coalesce(cd.posts, 0),
                comments = coalesce(cd.comments, 0)
            FROM (
                SELECT
                    c.id,
                    count(DISTINCT p.id) AS posts,
                    count(DISTINCT ct.id) AS comments
                FROM
                    community c
                LEFT JOIN post p ON c.id = p.community_id
                    AND p.deleted = 'f'
                    AND p.removed = 'f'
            LEFT JOIN comment ct ON p.id = ct.post_id
                AND ct.deleted = 'f'
                AND ct.removed = 'f'
        WHERE
            c.id = NEW.community_id
        GROUP BY
            c.id) cd
        WHERE
            ca.community_id = NEW.community_id;
        END IF;
    ELSIF (was_removed_or_deleted (TG_OP, OLD, NEW)) THEN
        UPDATE
            community_aggregates
        SET
            posts = posts - 1
        WHERE
            community_id = OLD.community_id;
        -- Update the counts if the post got deleted
        UPDATE
            community_aggregates ca
        SET
            posts = coalesce(cd.posts, 0),
            comments = coalesce(cd.comments, 0)
        FROM (
            SELECT
                c.id,
                count(DISTINCT p.id) AS posts,
                count(DISTINCT ct.id) AS comments
            FROM
                community c
            LEFT JOIN post p ON c.id = p.community_id
                AND p.deleted = 'f'
                AND p.removed = 'f'
        LEFT JOIN comment ct ON p.id = ct.post_id
            AND ct.deleted = 'f'
            AND ct.removed = 'f'
    WHERE
        c.id = OLD.community_id
    GROUP BY
        c.id) cd
    WHERE
        ca.community_id = OLD.community_id;
    END IF;
    RETURN NULL;
END
$$;


CREATE OR REPLACE FUNCTION public.site_aggregates_post_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (was_restored_or_created (TG_OP, OLD, NEW)) THEN
        UPDATE
            site_aggregates sa
        SET
            posts = posts + 1
        FROM
            site s
        WHERE
            sa.site_id = s.id;
    END IF;
    RETURN NULL;
END
$$;


CREATE OR REPLACE FUNCTION public.person_aggregates_post_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (was_restored_or_created (TG_OP, OLD, NEW)) THEN
        UPDATE
            person_aggregates
        SET
            post_count = post_count + 1
        WHERE
            person_id = NEW.creator_id;
    ELSIF (was_removed_or_deleted (TG_OP, OLD, NEW)) THEN
        UPDATE
            person_aggregates
        SET
            post_count = post_count - 1
        WHERE
            person_id = OLD.creator_id;
    END IF;
    RETURN NULL;
END
$$;



DROP TRIGGER site_aggregates_post_insert ON public.post;


CREATE TRIGGER site_aggregates_post_insert
  AFTER INSERT OR UPDATE OF removed, deleted
   ON public.post FOR EACH ROW WHEN ((new.local = true))
   EXECUTE FUNCTION public.site_aggregates_post_insert();


DROP TRIGGER community_aggregates_post_count ON public.post;


CREATE TRIGGER community_aggregates_post_count
  AFTER INSERT OR DELETE OR UPDATE OF removed, deleted
   ON public.post FOR EACH ROW
   EXECUTE FUNCTION public.community_aggregates_post_count();


DROP TRIGGER person_aggregates_post_count ON public.post;


CREATE TRIGGER person_aggregates_post_count
  AFTER INSERT OR DELETE OR UPDATE OF removed, deleted
   ON public.post FOR EACH ROW
   EXECUTE FUNCTION public.person_aggregates_post_count();
