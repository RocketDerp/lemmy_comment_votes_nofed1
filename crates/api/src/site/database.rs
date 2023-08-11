use crate::Perform;
use actix_web::web::Data;
use lemmy_api_common::{
  context::LemmyContext,
  site::{GetDatabaseBugCheck0Count, GetUDatabaseBugCheck0CountResponse},
  utils::{is_admin, local_user_view_from_jwt},
};
use lemmy_db_schema::impls::database_ad_hoc::{simple_rows_count, simple_integer_count};
use lemmy_utils::error::LemmyError;


#[async_trait::async_trait(?Send)]
impl Perform for GetDatabaseBugCheck0Count {
  type Response = GetUDatabaseBugCheck0CountResponse;

  async fn perform(&self, context: &Data<LemmyContext>) -> Result<Self::Response, LemmyError> {
    let data = self;
    let local_user_view = local_user_view_from_jwt(&data.auth, context).await?;

    // Only let admins do this
    is_admin(&local_user_view)?;

    // let database_rows_count = simple_rows_count(&mut context.pool(), "select 99;").await?;
    //       database_rows_count: database_rows_count.try_into().unwrap(),

    // "as count" is required, as it expects a precise column name.
    let database_count_result = simple_integer_count(&mut context.pool(), "select 99 AS count;").await?;
    let a = database_count_result[0].count;

    Ok(Self::Response {
      database_rows_count: a as i64,
    })
  }
}
