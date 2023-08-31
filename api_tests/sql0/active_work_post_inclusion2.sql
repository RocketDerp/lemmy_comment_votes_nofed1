
SELECT COUNT(*) AS inclusion_1 FROM post_aggregates WHERE inclusion = 1;
SELECT COUNT(*) AS inclusion_0 FROM post_aggregates WHERE inclusion = 0;
SELECT COUNT(*) AS inclusion_1_for_community FROM post_aggregates WHERE inclusion = 1 AND community_id = 18;
SELECT COUNT(*) AS inclusion_0_for_community FROM post_aggregates WHERE inclusion = 0 AND community_id = 18;
