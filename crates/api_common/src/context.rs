use lemmy_db_schema::{
  source::secret::Secret,
  utils::{ActualDbPool, DbPool},
};
use lemmy_utils::{
  rate_limit::RateLimitCell,
  settings::{structs::Settings, SETTINGS},
};
use reqwest_middleware::ClientWithMiddleware;
use std::sync::Arc;

#[derive(Clone)]
pub struct LemmyContext {
  pool: ActualDbPool,
  read_pool: ActualDbPool,
  client: Arc<ClientWithMiddleware>,
  secret: Arc<Secret>,
  rate_limit_cell: RateLimitCell,
}

impl LemmyContext {
  pub fn create(
    pool: ActualDbPool,
    read_pool: ActualDbPool,
    client: ClientWithMiddleware,
    secret: Secret,
    rate_limit_cell: RateLimitCell,
  ) -> LemmyContext {
    LemmyContext {
      pool,
      read_pool,
      client: Arc::new(client),
      secret: Arc::new(secret),
      rate_limit_cell,
    }
  }
  pub fn read_pool(&self) -> DbPool<'_> {
    DbPool::Pool(&self.read_pool)
  }
  pub fn pool(&self) -> DbPool<'_> {
    DbPool::Pool(&self.pool)
  }
  pub fn inner_pool(&self) -> &ActualDbPool {
    &self.pool
  }
  pub fn inner_read_pool(&self) -> &ActualDbPool {
    &self.read_pool
  }
  pub fn client(&self) -> &ClientWithMiddleware {
    &self.client
  }
  pub fn settings(&self) -> &'static Settings {
    &SETTINGS
  }
  pub fn secret(&self) -> &Secret {
    &self.secret
  }
  pub fn settings_updated_channel(&self) -> &RateLimitCell {
    &self.rate_limit_cell
  }
}
