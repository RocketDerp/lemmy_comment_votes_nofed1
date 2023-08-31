SELECT * FROM registration_application
   ORDER BY id DESC
   LIMIT 2
   ;


/*
 id | person_id |                      password_encrypted                      | email | show_nsfw |  theme  | default_sort_type | default_listing_type
    | interface_language | show_avatars | send_notifications_to_email |        validator_time         | show_scores | show_bot_accounts 
    | show_read_posts | show_new_post_notifs | email_verified | accepted_application | totp_2fa_secret | totp_2fa_url | open_links_in_new_tab
    | blur_nsfw | auto_expand | infinite_scroll_enabled | admin 
*/
SELECT * FROM local_user
   WHERE accepted_application = false
   ORDER BY validator_time DESC
   LIMIT 3
   ;


-- DROP TABLE IF EXISTS registration_pre_processing;


--     id SERIAL PRIMARY KEY,
CREATE TABLE public.registration_pre_processing (
    id serial PRIMARY KEY,
    status smallint,
    stage smallint,
    reserve_username text NOT NULL,
    password_encrypted text,
    extra_data0 text,
    extra_data1 text,
    local_user_id integer,
    answer text NOT NULL,
    admin_id integer,
    deny_reason text,
    deny_when timestamp with time zone,
    published timestamp with time zone DEFAULT now() NOT NULL,
    updated timestamp with time zone
);

/*
CREATE SEQUENCE public.registration_pre_processing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    
ALTER SEQUENCE public.registration_pre_processing_id_seq OWNED BY public.registration_pre_processing.id;
*/

INSERT INTO registration_pre_processing (reserve_username, answer) VALUES ('user_jim', 'test123');

/*
DROP TABLE IF EXISTS registration_pre_processing;

CREATE TABLE public.registration_pre_processing (
    id SERIAL PRIMARY KEY,
    status smallint,
    stage smallint,
    reserve_username text,
    password_encrypted text,
    extra_data0 text,
    extra_data1 text,
    local_user_id integer,
    answer text,
    admin_id integer,
    deny_reason text,
    deny_when timestamp with time zone,
    published timestamp with time zone DEFAULT now(),
    updated timestamp with time zone
);
*/

SELECT * FROM registration_pre_processing
   ORDER BY published DESC
   LIMIT 10
   ;

/*

pub struct RegistrationPreProcessing {
  pub id: i32,
  pub status: i16,
  // stage is just another extra field like status for complex schemes.
  pub stage: i16,
  pub reserve_username: String,
  pub password_encrypted: String,
  /// extra_data0 can be used for JSON, notes, or other info for signup campaigns/etc.
  pub extra_data0: String,
  pub extra_data1: String,
  /// localUserid is not used the same as in registration_application, it may be null, has no constraints.
  pub local_user_id: LocalUserId,
  pub answer: String,
  pub admin_id: Option<PersonId>,
  pub deny_reason: Option<String>,
  pub deny_when: DateTime<Utc>,
  pub published: DateTime<Utc>,
  /// updated should ideally be set when status, stage, or non-deny changes are made to record.
  pub updated: DateTime<Utc>,
}
*/
