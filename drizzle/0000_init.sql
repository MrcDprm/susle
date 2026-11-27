CREATE TABLE IF NOT EXISTS trees (
  id text PRIMARY KEY,
  name text NOT NULL,
  style smallint NOT NULL,
  lang text NOT NULL,
  owner_key_hash text NOT NULL UNIQUE,
  accepting boolean NOT NULL DEFAULT true,
  reveal_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS ornaments (
  id uuid PRIMARY KEY,
  tree_id text NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  slot integer NOT NULL,
  kind smallint NOT NULL,
  author_name text,
  body text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tree_id, slot)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  count integer NOT NULL
);
