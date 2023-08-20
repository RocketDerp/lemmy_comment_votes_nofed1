SELECT * FROM PERSON_FOLLOWER;

SELECT * FROM person_post_aggregates;

SELECT * FROM community_moderator LIMIT 10;

--SELECT * FROM community LIMIT 1;

SELECT  id , name , title ,          description          , removed ,         published          , updated , deleted , nsfw ,            actor_id            , local ,     last_refreshed_at      , icon , banner ,              followers_url               ,              inbox_url               ,       shared_inbox_url        , hidden , posting_restricted_to_mods , instance_id , moderators_url , featured_url
  FROM community
  ORDER BY id DESC
  LIMIT 5;
  
