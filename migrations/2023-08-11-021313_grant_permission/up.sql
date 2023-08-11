-- this hangs migrations with no message:
-- GRANT ALL PRIVILEGES ON DATABASE lemmy TO lemmy_read0;

-- THIS worked for passing lemmy API tests
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lemmy_read0;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lemmy_read0;

-- should this be the next step? or create a role?
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON tables TO lemmy_read0;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, USAGE ON sequences TO lemmy_read0;
