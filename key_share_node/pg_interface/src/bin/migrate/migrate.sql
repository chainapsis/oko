-- public.2_key_shares definition

-- Drop table

-- DROP TABLE public.2_key_shares;

CREATE TABLE public.2_key_shares (
	share_id uuid DEFAULT gen_random_uuid() NOT NULL,
	wallet_id uuid NOT NULL,
	enc_share bytea NOT NULL,
	status varchar NOT NULL,
	reshared_at timestamptz DEFAULT now() NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	aux jsonb NULL,
	CONSTRAINT key_shares_pkey PRIMARY KEY (share_id),
	CONSTRAINT key_shares_unique UNIQUE (wallet_id)
);


-- public.2_pg_dumps definition

-- Drop table

-- DROP TABLE public.2_pg_dumps;

CREATE TABLE public.2_pg_dumps (
	dump_id uuid DEFAULT gen_random_uuid() NOT NULL,
	status varchar(16) NOT NULL,
	dump_path varchar(255) NULL,
	meta jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT pg_dumps_pkey PRIMARY KEY (dump_id)
);


-- public.2_users definition

-- Drop table

-- DROP TABLE public.2_users;

CREATE TABLE public.2_users (
	user_id uuid DEFAULT gen_random_uuid() NOT NULL,
	auth_type varchar(64) NOT NULL,
	email varchar(255) NOT NULL,
	status varchar(16) DEFAULT 'active'::character varying NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	aux jsonb NULL,
	CONSTRAINT users_pkey PRIMARY KEY (user_id)
	CONSTRAINT users_auth_type_email_key UNIQUE (auth_type, email),
);


-- public.2_wallets definition

-- Drop table

-- DROP TABLE public.2_wallets;

CREATE TABLE public.2_wallets (
	wallet_id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	curve_type varchar(16) NOT NULL,
	public_key bytea NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	aux jsonb NULL,
	CONSTRAINT wallets_pkey PRIMARY KEY (wallet_id),
	CONSTRAINT wallets_public_key_key UNIQUE (public_key)
);


-- public.2_server_keypairs definition

-- Drop table

-- DROP TABLE public.2_server_keypairs;

CREATE TABLE public.2_server_keypairs (
	keypair_id uuid DEFAULT gen_random_uuid() NOT NULL,
	version int4 GENERATED ALWAYS AS IDENTITY NOT NULL,
	public_key bytea NOT NULL,
	enc_private_key text NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	rotated_at timestamptz NULL,
	CONSTRAINT server_keypairs_pkey PRIMARY KEY (keypair_id),
	CONSTRAINT server_keypairs_version_key UNIQUE (version)
);
CREATE INDEX idx_server_keypairs_is_active ON public.2_server_keypairs USING btree (is_active) WHERE (is_active = true);
