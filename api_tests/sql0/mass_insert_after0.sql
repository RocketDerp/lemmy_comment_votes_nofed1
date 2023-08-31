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


/*
comment table
*/

-- IMPORTANT NOTE: this is the stcok 0.18.4 function, an optimized single UPDATE variation is in other .sql files
-- IMPORTANT NOTE: this logic for INSERT TRIGGER always assumes that the published datestamp is now(), which was a logical assumption with general use of Lemmy prior to federation being added.
CREATE OR REPLACE FUNCTION public.post_aggregates_comment_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check for post existence - it may not exist anymore
    IF TG_OP = 'INSERT' OR EXISTS (
        SELECT
            1
        FROM
            post p
        WHERE
            p.id = OLD.post_id) THEN
        IF (was_restored_or_created (TG_OP, OLD, NEW)) THEN
            UPDATE
                post_aggregates pa
            SET
                comments = comments + 1
            WHERE
                pa.post_id = NEW.post_id;
        ELSIF (was_removed_or_deleted (TG_OP, OLD, NEW)) THEN
            UPDATE
                post_aggregates pa
            SET
                comments = comments - 1
            WHERE
                pa.post_id = OLD.post_id;
        END IF;
    END IF;
    IF TG_OP = 'INSERT' THEN
        UPDATE
            post_aggregates pa
        SET
            newest_comment_time = NEW.published
        WHERE
            pa.post_id = NEW.post_id;
        -- A 2 day necro-bump limit
        UPDATE
            post_aggregates pa
        SET
            newest_comment_time_necro = NEW.published
        FROM
            post p
        WHERE
            pa.post_id = p.id
            AND pa.post_id = NEW.post_id
            -- Fix issue with being able to necro-bump your own post
            AND NEW.creator_id != p.creator_id
            AND pa.published > ('now'::timestamp - '2 days'::interval);
    END IF;
    RETURN NULL;
END
$$;


DROP TRIGGER post_aggregates_comment_count ON public.comment;

CREATE TRIGGER post_aggregates_comment_count
  AFTER INSERT OR DELETE OR UPDATE OF removed, deleted
  ON public.comment FOR EACH ROW
  EXECUTE FUNCTION public.post_aggregates_comment_count();


-- *************************************************************************************
-- ** Revised Lemmy TRIGGER logic
-- *************************************************************************************

/*
PostgreSQL read of row carries far less overhead than an UPDATE to a row.
IMPORTANT NOTE: this logic for INSERT TRIGGER always assumes that the published datestamp is now(), which was a logical assumption with general use of Lemmy prior to federation being added.
*/
CREATE OR REPLACE FUNCTION public.post_aggregates_comment_count() RETURNS trigger
    LANGUAGE plpgsql
    AS
$$
    DECLARE
        prev_post_aggregate RECORD; -- previous post aggregate record
        executed_update boolean DEFAULT FALSE;

BEGIN

    IF TG_OP = 'INSERT' THEN
        -- assumption made that every new comment has an already existing post_aggregates row to reference
        -- LIMIT 1 used to satisfy PostgreSQL function, but there should never be duplicates for same post_id
        -- Side benefit: this puts the taget UPDATE row into cache
        SELECT * INTO prev_post_aggregate FROM post_aggregates WHERE post_id = NEW.post_id LIMIT 1;    

        -- A 2 day necro-bump limit
        IF prev_post_aggregate.published > ('now'::timestamp - '2 days'::interval) THEN
            -- Fix issue with being able to necro-bump your own post
            IF NEW.creator_id != prev_post_aggregate.creator_id THEN
                UPDATE
                    post_aggregates pa
                SET
                    -- this statement should be for comment INSERT circumstance 1
                    newest_comment_time = NEW.published,
                    comments = comments + 1,
                    newest_comment_time_necro = NEW.published
                WHERE
                    pa.post_id = NEW.post_id;

                executed_update := TRUE;
            END IF;
        END IF;
        
        IF NOT executed_update THEN
            UPDATE
                post_aggregates pa
            SET
                -- this statement should be for comment INSERT circumstance 2
                newest_comment_time = NEW.published,
                comments = comments + 1
            WHERE
                pa.post_id = NEW.post_id;
        END IF;

    -- ELSE not an INSERT
    ELSIF EXISTS (
        -- If not INSERT, Check for post existence - it may not exist anymore
        SELECT
            1
        FROM
            post p
        WHERE
            p.id = OLD.post_id
        )
        THEN
            -- Lemmy has an issue with counting comment replies
            --   this might be a place to increment/decrement count
            --   on comment_aggregate for children comments on restore/delete.
            IF (was_restored_or_created (TG_OP, OLD, NEW)) THEN
                UPDATE
                    post_aggregates pa
                SET
                    comments = comments + 1
                WHERE
                    pa.post_id = NEW.post_id;
            ELSIF (was_removed_or_deleted (TG_OP, OLD, NEW)) THEN
                UPDATE
                    post_aggregates pa
                SET
                    comments = comments - 1
                WHERE
                    pa.post_id = OLD.post_id;
            END IF;
    END IF;

    RETURN NULL;
END
$$;


DROP TRIGGER community_aggregates_comment_count ON public.comment;

CREATE TRIGGER community_aggregates_comment_count
  AFTER INSERT OR DELETE OR UPDATE OF removed, deleted
  ON public.comment FOR EACH ROW
  EXECUTE FUNCTION public.community_aggregates_comment_count();


CREATE OR REPLACE FUNCTION public.community_aggregates_comment_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (was_restored_or_created (TG_OP, OLD, NEW)) THEN
        UPDATE
            community_aggregates ca
        SET
            comments = comments + 1
        FROM
            post p
        WHERE
            p.id = NEW.post_id
            AND ca.community_id = p.community_id;
    ELSIF (was_removed_or_deleted (TG_OP, OLD, NEW)) THEN
        UPDATE
            community_aggregates ca
        SET
            comments = comments - 1
        FROM
            post p
        WHERE
            p.id = OLD.post_id
            AND ca.community_id = p.community_id;
    END IF;
    RETURN NULL;
END
$$;


DROP TRIGGER person_aggregates_comment_count ON public.comment;

CREATE TRIGGER person_aggregates_comment_count
  AFTER INSERT OR DELETE OR UPDATE OF removed, deleted
  ON public.comment FOR EACH ROW
  EXECUTE FUNCTION public.person_aggregates_comment_count();


CREATE OR REPLACE FUNCTION public.person_aggregates_comment_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (was_restored_or_created (TG_OP, OLD, NEW)) THEN
        UPDATE
            person_aggregates
        SET
            comment_count = comment_count + 1
        WHERE
            person_id = NEW.creator_id;
    ELSIF (was_removed_or_deleted (TG_OP, OLD, NEW)) THEN
        UPDATE
            person_aggregates
        SET
            comment_count = comment_count - 1
        WHERE
            person_id = OLD.creator_id;
    END IF;
    RETURN NULL;
END
$$;


DROP TRIGGER site_aggregates_comment_insert ON public.comment;

CREATE TRIGGER site_aggregates_comment_insert
  AFTER INSERT OR UPDATE OF removed, deleted
  ON public.comment
  FOR EACH ROW WHEN ((new.local = true))
  EXECUTE FUNCTION public.site_aggregates_comment_insert();



CREATE OR REPLACE FUNCTION public.site_aggregates_comment_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (was_restored_or_created (TG_OP, OLD, NEW)) THEN
        UPDATE
            site_aggregates sa
        SET
            comments = comments + 1
        FROM
            site s
        WHERE
            sa.site_id = s.id;
    END IF;
    RETURN NULL;
END
$$;

