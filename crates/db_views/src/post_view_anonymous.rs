use crate::{structs::{LocalUserView, PostAnonymousView}, post_view::PostQuery};
use diesel::{
  debug_query,
  dsl::{now, IntervalDsl},
  pg::Pg,
  result::Error,
  sql_function,
  sql_types,
  BoolExpressionMethods,
  ExpressionMethods,
  JoinOnDsl,
  NullableExpressionMethods,
  PgTextExpressionMethods,
  QueryDsl,
};
use diesel_async::RunQueryDsl;
use lemmy_db_schema::{
  aggregates::structs::PostAggregates,
  newtypes::{CommunityId, LocalUserId, PersonId, PostId},
  schema::{
    community,
    community_block,
    community_follower,
    community_moderator,
    community_person_ban,
    local_user_language,
    person,
    person_block,
    person_post_aggregates,
    post,
    post_aggregates,
    post_like,
  },
  source::{
    community::{Community, CommunityFollower},
    person::Person,
    post::Post,
  },
  traits::JoinView,
  utils::{fuzzy_search, limit_and_offset, DbConn, DbPool, ListFn, Queries, ReadFn},
  ListingType,
  SortType,
  SubscribedType,
};
use tracing::debug;

type PostAnonymousViewTuple = (
  Post,
  Person,
  Community,
  bool,
  PostAggregates,
  SubscribedType,
  bool,
  Option<i16>,
  i64,
);

sql_function!(fn coalesce(x: sql_types::Nullable<sql_types::BigInt>, y: sql_types::BigInt) -> sql_types::BigInt);

fn queries<'a>() -> Queries<
  impl ReadFn<'a, PostAnonymousView, (PostId, Option<PersonId>, bool)>,
  impl ListFn<'a, PostAnonymousView, PostQuery<'a>>,
> {
  let all_joins = |query: post_aggregates::BoxedQuery<'a, Pg>, my_person_id: Option<PersonId>| {
    // The left join below will return None in this case
    let person_id_join = my_person_id.unwrap_or(PersonId(-1));

    query
      .inner_join(person::table)
      .inner_join(community::table)
      .left_join(
        community_person_ban::table.on(
          post_aggregates::community_id
            .eq(community_person_ban::community_id)
            .and(community_person_ban::person_id.eq(post_aggregates::creator_id)),
        ),
      )
      .inner_join(post::table)
      .left_join(
        community_follower::table.on(
          post_aggregates::community_id
            .eq(community_follower::community_id)
            .and(community_follower::person_id.eq(person_id_join)),
        ),
      )
      .left_join(
        community_moderator::table.on(
          post::community_id
            .eq(community_moderator::community_id)
            .and(community_moderator::person_id.eq(person_id_join)),
        ),
      )
      .left_join(
        person_block::table.on(
          post_aggregates::creator_id
            .eq(person_block::target_id)
            .and(person_block::person_id.eq(person_id_join)),
        ),
      )
      .left_join(
        post_like::table.on(
          post_aggregates::post_id
            .eq(post_like::post_id)
            .and(post_like::person_id.eq(person_id_join)),
        ),
      )
      .left_join(
        person_post_aggregates::table.on(
          post_aggregates::post_id
            .eq(person_post_aggregates::post_id)
            .and(person_post_aggregates::person_id.eq(person_id_join)),
        ),
      )
  };

  let selection = (
    post::all_columns,
    person::all_columns,
    community::all_columns,
    community_person_ban::id.nullable().is_not_null(),
    post_aggregates::all_columns,
    CommunityFollower::select_subscribed_type(),
    person_block::id.nullable().is_not_null(),
    post_like::score.nullable(),
    coalesce(
      post_aggregates::comments.nullable() - person_post_aggregates::read_comments.nullable(),
      post_aggregates::comments,
    ),
  );

  let read =
    move |mut conn: DbConn<'a>,
          (post_id, my_person_id, is_mod_or_admin): (PostId, Option<PersonId>, bool)| async move {
      // The left join below will return None in this case
      let person_id_join = my_person_id.unwrap_or(PersonId(-1));

      let mut query = all_joins(
        post_aggregates::table
          .filter(post_aggregates::post_id.eq(post_id))
          .into_boxed(),
        my_person_id,
      )
      .select(selection);

      // Hide deleted and removed for non-admins or mods
      if !is_mod_or_admin {
        query = query
          .filter(community::removed.eq(false))
          .filter(post::removed.eq(false))
          // users can see their own deleted posts
          .filter(
            community::deleted
              .eq(false)
              .or(post::creator_id.eq(person_id_join)),
          )
          .filter(
            post::deleted
              .eq(false)
              .or(post::creator_id.eq(person_id_join)),
          );
      }

      query.first::<PostAnonymousViewTuple>(&mut conn).await
    };

  let list = move |mut conn: DbConn<'a>, options: PostQuery<'a>| async move {
    let person_id = options.local_user.map(|l| l.person.id);
    let local_user_id = options.local_user.map(|l| l.local_user.id);

    // The left join below will return None in this case
    let person_id_join = person_id.unwrap_or(PersonId(-1));
    let local_user_id_join = local_user_id.unwrap_or(LocalUserId(-1));

    let mut query = all_joins(post_aggregates::table.into_boxed(), person_id)
      .left_join(
        community_block::table.on(
          post_aggregates::community_id
            .eq(community_block::community_id)
            .and(community_block::person_id.eq(person_id_join)),
        ),
      )
      .left_join(
        local_user_language::table.on(
          post::language_id
            .eq(local_user_language::language_id)
            .and(local_user_language::local_user_id.eq(local_user_id_join)),
        ),
      )
      .select(selection);

    let is_creator = options.creator_id == options.local_user.map(|l| l.person.id);
    // only show deleted posts to creator
    if is_creator {
      query = query
        .filter(community::deleted.eq(false))
        .filter(post::deleted.eq(false));
    }

    let is_admin = options.local_user.map(|l| l.person.admin).unwrap_or(false);
    // only show removed posts to admin when viewing user profile
    if !(options.is_profile_view && is_admin) {
      query = query
        .filter(community::removed.eq(false))
        .filter(post::removed.eq(false));
    }

    if options.community_id.is_none() {
      query = query.then_order_by(post_aggregates::featured_local.desc());
    } else if let Some(community_id) = options.community_id {
      query = query
        .filter(post_aggregates::community_id.eq(community_id))
        .then_order_by(post_aggregates::featured_community.desc());
    }

    if let Some(creator_id) = options.creator_id {
      query = query.filter(post_aggregates::creator_id.eq(creator_id));
    }

    if let Some(listing_type) = options.listing_type {
      match listing_type {
        ListingType::Subscribed => query = query.filter(community_follower::pending.is_not_null()),
        ListingType::Local => {
          query = query.filter(community::local.eq(true)).filter(
            community::hidden
              .eq(false)
              .or(community_follower::person_id.eq(person_id_join)),
          );
        }
        ListingType::All => {
          query = query.filter(
            community::hidden
              .eq(false)
              .or(community_follower::person_id.eq(person_id_join)),
          )
        }
      }
    }

    if let Some(url_search) = options.url_search {
      query = query.filter(post::url.eq(url_search));
    }

    if let Some(search_term) = options.search_term {
      let searcher = fuzzy_search(&search_term);
      query = query.filter(
        post::name
          .ilike(searcher.clone())
          .or(post::body.ilike(searcher)),
      );
    }

    if !options
      .local_user
      .map(|l| l.local_user.show_nsfw)
      .unwrap_or(false)
    {
      query = query
        .filter(post::nsfw.eq(false))
        .filter(community::nsfw.eq(false));
    };

    if !options
      .local_user
      .map(|l| l.local_user.show_bot_accounts)
      .unwrap_or(true)
    {
      query = query.filter(person::bot_account.eq(false));
    };


    if options.moderator_view {
      query = query.filter(community_moderator::person_id.is_not_null());
    }

    if options.liked_only {
      query = query.filter(post_like::score.eq(1));
    } else if options.disliked_only {
      query = query.filter(post_like::score.eq(-1));
    }

    if options.local_user.is_some() {
      // Filter out the rows with missing languages
      query = query.filter(local_user_language::language_id.is_not_null());

      // Don't show blocked communities or persons
      query = query.filter(community_block::person_id.is_null());
      if !options.moderator_view {
        query = query.filter(person_block::person_id.is_null());
      }
    }

    query = match options.sort.unwrap_or(SortType::Hot) {
      SortType::Active => query
        .then_order_by(post_aggregates::hot_rank_active.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::Hot => query
        .then_order_by(post_aggregates::hot_rank.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::Controversial => query.then_order_by(post_aggregates::controversy_rank.desc()),
      SortType::New => query.then_order_by(post_aggregates::published.desc()),
      SortType::Old => query.then_order_by(post_aggregates::published.asc()),
      SortType::NewComments => query.then_order_by(post_aggregates::newest_comment_time.desc()),
      SortType::MostComments => query
        .then_order_by(post_aggregates::comments.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopAll => query
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopYear => query
        .filter(post_aggregates::published.gt(now - 1.years()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopMonth => query
        .filter(post_aggregates::published.gt(now - 1.months()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopWeek => query
        .filter(post_aggregates::published.gt(now - 1.weeks()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopDay => query
        .filter(post_aggregates::published.gt(now - 1.days()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopHour => query
        .filter(post_aggregates::published.gt(now - 1.hours()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopSixHour => query
        .filter(post_aggregates::published.gt(now - 6.hours()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopTwelveHour => query
        .filter(post_aggregates::published.gt(now - 12.hours()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopThreeMonths => query
        .filter(post_aggregates::published.gt(now - 3.months()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopSixMonths => query
        .filter(post_aggregates::published.gt(now - 6.months()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
      SortType::TopNineMonths => query
        .filter(post_aggregates::published.gt(now - 9.months()))
        .then_order_by(post_aggregates::score.desc())
        .then_order_by(post_aggregates::published.desc()),
    };

    let (limit, offset) = limit_and_offset(options.page, options.limit)?;

    query = query.limit(limit).offset(offset);

    debug!("Post View Query: {:?}", debug_query::<Pg, _>(&query));

    query.load::<PostAnonymousViewTuple>(&mut conn).await
  };

  Queries::new(read, list)
}

impl PostAnonymousView {
  pub async fn read(
    pool: &mut DbPool<'_>,
    post_id: PostId,
    my_person_id: Option<PersonId>,
    is_mod_or_admin: bool,
  ) -> Result<Self, Error> {
    let mut res = queries()
      .read(pool, (post_id, my_person_id, is_mod_or_admin))
      .await?;

    // If a person is given, then my_vote, if None, should be 0, not null
    // Necessary to differentiate between other person's votes
    if my_person_id.is_some() && res.my_vote.is_none() {
      res.my_vote = Some(0)
    };

    Ok(res)
  }
}

impl<'a> PostQuery<'a> {
  pub async fn list_anonymous(self, pool: &mut DbPool<'_>) -> Result<Vec<PostAnonymousView>, Error> {
    queries().list(pool, self).await
  }
}

impl JoinView for PostAnonymousView {
  type JoinTuple = PostAnonymousViewTuple;
  fn from_tuple(a: Self::JoinTuple) -> Self {
    Self {
      post: a.0,
      creator: a.1,
      community: a.2,
      creator_banned_from_community: a.3,
      counts: a.4,
      subscribed: a.5,
      creator_blocked: a.6,
      my_vote: a.7,
      unread_comments: a.8,
    }
  }
}
