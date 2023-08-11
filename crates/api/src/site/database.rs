use crate::Perform;
use actix_web::web::Data;
use lemmy_api_common::{
  context::LemmyContext,
  site::{GetDatabaseBugCheck0Count, GetUDatabaseBugCheck0CountResponse},
  utils::{is_admin, local_user_view_from_jwt},
};
use lemmy_db_schema::source::local_site::LocalSite;
use lemmy_db_views::structs::RegistrationApplicationView;
use lemmy_utils::error::LemmyError;

#[async_trait::async_trait(?Send)]
impl Perform for GetDatabaseBugCheck0Count {
  type Response = GetUDatabaseBugCheck0CountResponse;

  async fn perform(&self, context: &Data<LemmyContext>) -> Result<Self::Response, LemmyError> {
    let data = self;
    let local_user_view = local_user_view_from_jwt(&data.auth, context).await?;
    let local_site = LocalSite::read(&mut context.pool()).await?;

    // Only let admins do this
    is_admin(&local_user_view)?;

    let verified_email_only = local_site.require_email_verification;

    let database_rows_count =
      RegistrationApplicationView::get_unread_count(&mut context.pool(), verified_email_only)
        .await?;

    Ok(Self::Response {
      database_rows_count,
    })
  }
}
