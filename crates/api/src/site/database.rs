use crate::Perform;
use actix_web::web::Data;
use lemmy_api_common::{
  context::LemmyContext,
  site::{GetDatabaseBugCheck0Count, GetUDatabaseBugCheck0CountResponse},
  utils::{is_admin, local_user_view_from_jwt},
};
use lemmy_db_schema::impls::database_ad_hoc::{simple_rows_count, simple_integer_count, simple_biginteger_count};
use lemmy_utils::error::LemmyError;


#[async_trait::async_trait(?Send)]
impl Perform for GetDatabaseBugCheck0Count {
  type Response = GetUDatabaseBugCheck0CountResponse;

  async fn perform(&self, context: &Data<LemmyContext>) -> Result<Self::Response, LemmyError> {
    let data = self;
    let local_user_view = local_user_view_from_jwt(&data.auth, context).await?;

    // Only let admins do this
    is_admin(&local_user_view)?;

    let statement_index = data.statement;

    // let database_rows_count = simple_rows_count(&mut context.pool(), "select 99;").await?;
    //       database_rows_count: database_rows_count.try_into().unwrap(),

    // "as count" is required, as it expects a precise column name.
    // Lemmy issue: https://github.com/LemmyNet/lemmy/issues/3741

    let sql_statement = match statement_index{
      Some(1) => 
      "
      SELECT COUNT(*) AS count
      FROM comment
      WHERE path = '0'
      ;
      ",
      Some(2) =>
      "
      SELECT COUNT(*) AS count
      FROM comment
      WHERE id >= 0
      ;
      ",
      Some(3) =>
      "
      SELECT COUNT(*) AS count
      FROM post
      WHERE id >= 0
      ;
      ",
      Some(100) =>
      "
      INSERT INTO post
         (name, body, community, creator_id, local)
      SELECT 'post title', 'post body', trunc(random() * 1000), random()
         false
      FROM generate_series(1, 50);
      ;
      ",
      Some(200) =>
      "-- ToDo: tickle scheduled jobs to rebuild sorting orders, on admin demand"
      ,
      _ => "SELECT -1::bigint AS count;",
  };

    // ToDo: put in test with row
    /*

      PostInsertForm {
        name,
        url: url.map(Into::into),
        body: body_slurs_removed,
        creator_id: creator.id,
        community_id: community.id,
        removed: None,
        locked: page.comments_enabled.map(|e| !e),
        published: page.published.map(|u| u.naive_local()),
        updated: page.updated.map(|u| u.naive_local()),
        deleted: Some(false),
        nsfw: page.sensitive,
        embed_title,
        embed_description,
        embed_video_url,
        thumbnail_url,
        ap_id: Some(page.id.clone().into()),
        local: Some(false),
        language_id,
        featured_community: None,
        featured_local: None,
      }



    let sql_statement = 
    "
    SELECT COUNT(*) AS count
    FROM comment
    WHERE path = '0'
    ;
    ";
  */

    // let sql_statement = "SELECT 99 AS count;";
    //let database_count_result = simple_integer_count(&mut context.pool(), sql_statement2).await?;
    // let a = database_count_result[0].count;

    let database_count_result = simple_biginteger_count(&mut context.pool(), sql_statement).await?;
    let a = database_count_result[0].count;

    Ok(Self::Response {
      database_rows_count: a as i64,
    })
  }
}
