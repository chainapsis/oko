-- public.admin_users definition

-- Drop table

-- DROP TABLE public.admin_users;

CREATE TABLE public.admin_users (
	user_id uuid DEFAULT gen_random_uuid() NOT NULL,
	email varchar NOT NULL,
	password_hash varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT admin_users_pkey PRIMARY KEY (user_id),
	CONSTRAINT admin_users_email_key UNIQUE (email)
);

-- public.customers definition

-- Drop table

-- DROP TABLE public.customers;

CREATE TABLE public.customers (
	customer_id uuid DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar NOT NULL,
	status varchar(32) NOT NULL,
	url varchar NULL,
	logo_url varchar NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT customers_pkey PRIMARY KEY (customer_id)
);

-- public.customer_dashboard_users definition

-- Drop table

-- DROP TABLE public.customer_dashboard_users;

CREATE TABLE public.customer_dashboard_users (
	user_id uuid DEFAULT gen_random_uuid() NOT NULL,
	customer_id uuid NOT NULL,
	status varchar(32) NOT NULL,
	email varchar NOT NULL,
	is_email_verified bool NOT NULL,
	password_hash varchar(255) NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT customer_dashboard_users_pkey PRIMARY KEY (user_id),
	CONSTRAINT customer_dashboard_users_email_key UNIQUE (email)
);

-- Indexes for customer_dashboard_users
CREATE INDEX idx_customer_dashboard_users_customer_id ON public.customer_dashboard_users USING btree (customer_id);

-- public.api_keys definition

-- Drop table

-- DROP TABLE public.api_keys;

CREATE TABLE public.api_keys (
	key_id uuid DEFAULT gen_random_uuid() NOT NULL,
	customer_id uuid NOT NULL,
	hashed_key varchar(64) NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT api_keys_pkey PRIMARY KEY (key_id),
	CONSTRAINT api_keys_hashed_key_key UNIQUE (hashed_key)
);

-- Indexes for api_keys
CREATE INDEX idx_api_keys_customer_id ON public.api_keys USING btree (customer_id);

-- public.email_verifications definition

-- Drop table

-- DROP TABLE public.email_verifications;

CREATE TABLE public.email_verifications (
	email_verification_id uuid DEFAULT gen_random_uuid() NOT NULL,
	email varchar(255) NOT NULL,
	verification_code varchar(6) NOT NULL,
	status varchar(32) NOT NULL,
	expires_at timestamptz NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT email_verifications_pkey PRIMARY KEY (email_verification_id)
);

-- Indexes for email_verifications
CREATE INDEX idx_email_verifications_email ON public.email_verifications USING btree (email);
CREATE INDEX idx_email_verifications_email_expires ON public.email_verifications USING btree (email, expires_at);
CREATE INDEX idx_email_verifications_expires ON public.email_verifications USING btree (expires_at);

-- public.ewallet_users definition

-- Drop table

-- DROP TABLE public.ewallet_users;

CREATE TABLE public.ewallet_users (
	user_id uuid DEFAULT gen_random_uuid() NOT NULL,
	email varchar(255) NOT NULL,
	status varchar(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT ewallet_users_pkey PRIMARY KEY (user_id),
	CONSTRAINT ewallet_users_email_key UNIQUE (email)
);

-- public.ewallet_wallets definition

-- Drop table

-- DROP TABLE public.ewallet_wallets;

CREATE TABLE public.ewallet_wallets (
	wallet_id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	curve_type varchar(16) NOT NULL,
	public_key bytea NOT NULL,
	status varchar(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
	enc_tss_share bytea NOT NULL,
	sss_threshold smallint NOT NULL DEFAULT 2,
	metadata jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT ewallet_wallets_pkey PRIMARY KEY (wallet_id),
	CONSTRAINT ewallet_wallets_public_key_key UNIQUE (public_key)
);

-- Indexes for ewallet_wallets
CREATE INDEX idx_ewallet_wallets_user_id_curve_type_status ON public.ewallet_wallets USING btree (user_id, curve_type, status);
CREATE INDEX idx_ewallet_wallets_created_at ON public.ewallet_wallets USING btree (created_at);

-- public.tss_sessions definition

-- Drop table

-- DROP TABLE public.tss_sessions;

CREATE TABLE public.tss_sessions (
	session_id uuid DEFAULT gen_random_uuid() NOT NULL,
	customer_id uuid NOT NULL,
	wallet_id uuid NOT NULL,
	state varchar(32) NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT tss_sessions_pkey PRIMARY KEY (session_id)
);

-- Indexes for tss_sessions
CREATE INDEX idx_tss_sessions_wallet_id ON public.tss_sessions USING btree (wallet_id);
CREATE INDEX idx_tss_sessions_customer_id ON public.tss_sessions USING btree (customer_id);
CREATE INDEX idx_tss_sessions_created_at ON public.tss_sessions USING btree (created_at);

-- public.tss_stages definition

-- Drop table

-- DROP TABLE public.tss_stages;

CREATE TABLE public.tss_stages (
	stage_id uuid DEFAULT gen_random_uuid() NOT NULL,
	session_id uuid NOT NULL,
	stage_type varchar(32) NOT NULL,
	stage_status varchar(32) NOT NULL,
	stage_data jsonb NULL,
	error_message text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT tss_stages_pkey PRIMARY KEY (stage_id),
	CONSTRAINT tss_stages_session_id_stage_type_key UNIQUE (session_id, stage_type)
);

-- -- public.key_share_nodes definition

-- -- Drop table

-- -- DROP TABLE public.key_share_nodes;

CREATE TABLE public.key_share_nodes (
	node_id uuid DEFAULT gen_random_uuid() NOT NULL,
	node_name varchar(255) NOT NULL,
	server_url varchar(255) NOT NULL,
	status varchar(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT key_share_nodes_pkey PRIMARY KEY (node_id)
);

CREATE UNIQUE INDEX key_share_nodes_server_url_uniq_active
  ON public.key_share_nodes (server_url)
  WHERE deleted_at IS NULL;

-- -- public.wallet_ks_nodes definition

-- -- Drop table

-- -- DROP TABLE public.wallet_ks_nodes;

CREATE TABLE public.wallet_ks_nodes (
	wallet_ks_node_id uuid DEFAULT gen_random_uuid() NOT NULL,
	wallet_id uuid NOT NULL,
	node_id uuid NOT NULL,
	status varchar(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT wallet_ks_nodes_pkey PRIMARY KEY (wallet_ks_node_id),
	CONSTRAINT wallet_ks_nodes_wallet_id_node_id_key UNIQUE (wallet_id, node_id)
);

-- Indexes for wallet_ks_nodes
CREATE INDEX idx_wallet_ks_nodes_wallet_id ON public.wallet_ks_nodes USING btree (wallet_id);
CREATE INDEX idx_wallet_ks_nodes_node_id ON public.wallet_ks_nodes USING btree (node_id);

-- -- public.ks_node_health_checks definition

-- -- Drop table

-- -- DROP TABLE public.ks_node_health_checks;
CREATE TABLE public.ks_node_health_checks (
	check_id uuid DEFAULT gen_random_uuid() NOT NULL,
	node_id uuid NOT NULL,
	status varchar(32) NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT ks_node_health_checks_pkey PRIMARY KEY (check_id)
);

-- -- Indexes for ks_node_health_checks
CREATE INDEX idx_ks_node_health_checks_node_id_created_at ON public.ks_node_health_checks (node_id, created_at DESC);

-- -- Drop table

-- DROP TABLE public.key_share_node_meta;

CREATE TABLE public.key_share_node_meta (
	meta_id uuid DEFAULT gen_random_uuid() NOT NULL,
	sss_threshold smallint NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT key_share_node_meta_pkey PRIMARY KEY (meta_id)
);


-- public.tss_activation_settings definition

-- Drop table

-- DROP TABLE public.tss_activation_settings;

-- TSS 기능별 활성화 설정 테이블
CREATE TABLE public.tss_activation_settings (
  activation_key varchar(64) NOT NULL,
  is_enabled bool DEFAULT true NOT NULL,
  description text NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT tss_activation_settings_pkey PRIMARY KEY (activation_key)
);

-- public.audit_event definition

-- Drop table

-- DROP TABLE public.audit_event;

CREATE TABLE audit_event (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_id   TEXT NOT NULL,
  actor        TEXT NOT NULL,
  actor_ip     INET,
  user_agent   TEXT,
  source       TEXT NOT NULL,
  action       TEXT NOT NULL,
  target_type  TEXT NOT NULL,
  target_id    TEXT,
  changes      JSONB,
  params       JSONB,
  outcome      TEXT NOT NULL,
  error        TEXT
);

-- Indexes for audit_event
CREATE INDEX ON audit_event (occurred_at DESC);
CREATE INDEX ON audit_event (target_type, target_id, occurred_at DESC);
CREATE INDEX ON audit_event (action, occurred_at DESC);
CREATE UNIQUE INDEX audit_event_unique_req ON audit_event (request_id, action, target_type, target_id);
