-- ============================================================
-- FAMILY-HUB — Schéma initial complet
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Trigger helper : updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- families
-- ============================================================
CREATE TABLE IF NOT EXISTS families (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- family_members
-- ============================================================
CREATE TABLE IF NOT EXISTS family_members (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID        REFERENCES families(id) ON DELETE CASCADE,
  user_id    UUID,
  name       TEXT,
  role       TEXT        NOT NULL DEFAULT 'member'
                         CHECK (role IN ('admin', 'member', 'child')),
  color      TEXT,
  avatar_url TEXT,
  fcm_token  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- family_events
-- ============================================================
CREATE TABLE IF NOT EXISTS family_events (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id          UUID        REFERENCES families(id) ON DELETE CASCADE,
  title              TEXT        NOT NULL,
  description        TEXT,
  start_date         TIMESTAMPTZ NOT NULL,
  end_date           TIMESTAMPTZ,
  all_day            BOOLEAN     NOT NULL DEFAULT false,
  location           TEXT,
  reminder_minutes   INTEGER,
  recurrence         TEXT        CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'yearly')),
  category           TEXT        CHECK (category IN ('school', 'vacation', 'birthday', 'appointment', 'sport', 'meal', 'family', 'other')),
  google_event_id    TEXT,
  created_by         UUID        REFERENCES family_members(id) ON DELETE SET NULL,
  assigned_member_id UUID        REFERENCES family_members(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER family_events_updated_at
  BEFORE UPDATE ON family_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS family_events_family_id_idx ON family_events(family_id);
CREATE INDEX IF NOT EXISTS family_events_start_date_idx ON family_events(start_date);

-- ============================================================
-- recipes
-- ============================================================
CREATE TABLE IF NOT EXISTS recipes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  title       TEXT        NOT NULL,
  description TEXT,
  ingredients JSONB       NOT NULL DEFAULT '[]',
  instructions TEXT,
  servings    INTEGER,
  prep_time   INTEGER,
  cook_time   INTEGER,
  category    TEXT        CHECK (category IN ('entree', 'plat', 'dessert', 'gouter', 'autre')),
  tags        JSONB       NOT NULL DEFAULT '[]',
  source      TEXT        NOT NULL DEFAULT 'manual' CHECK (source IN ('chat', 'manual')),
  is_favorite BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- meal_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID,
  week_start DATE        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- meal_plan_items
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_plan_items (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID        NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id    UUID        REFERENCES recipes(id) ON DELETE SET NULL,
  day_of_week  INTEGER     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type    TEXT        NOT NULL CHECK (meal_type IN ('dejeuner', 'diner')),
  custom_title TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- shopping_lists
-- ============================================================
CREATE TABLE IF NOT EXISTS shopping_lists (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID        REFERENCES families(id) ON DELETE CASCADE,
  name         TEXT,
  color        TEXT,
  items        JSONB       NOT NULL DEFAULT '[]',
  meal_summary TEXT,
  pdf_url      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shopping_lists_family_id_idx  ON shopping_lists(family_id);
CREATE INDEX IF NOT EXISTS shopping_lists_created_at_idx ON shopping_lists(created_at DESC);

-- ============================================================
-- shopping_items (listes de courses manuelles)
-- ============================================================
CREATE TABLE IF NOT EXISTS shopping_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    UUID        NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  quantity   TEXT,
  unit       TEXT,
  checked    BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID,
  title      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  type       TEXT        NOT NULL,
  event_id   UUID        REFERENCES family_events(id) ON DELETE SET NULL,
  data       JSONB,
  read       BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- agents
-- ============================================================
CREATE TABLE IF NOT EXISTS agents (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL UNIQUE,
  label          TEXT        NOT NULL,
  description    TEXT,
  system_prompt  TEXT        NOT NULL DEFAULT '',
  category       TEXT,
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  model_provider TEXT        NOT NULL DEFAULT 'openai'
                             CHECK (model_provider IN ('openai', 'huggingface')),
  model_name     TEXT        NOT NULL DEFAULT 'gpt-4o',
  voice_enabled  BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- agent_memories
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_memories (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       TEXT        NOT NULL,
  user_id          UUID,
  memory_type      TEXT        NOT NULL
                               CHECK (memory_type IN ('preference', 'fact', 'constraint', 'context')),
  category         TEXT        NOT NULL DEFAULT 'general',
  subject          TEXT        NOT NULL,
  content          TEXT        NOT NULL,
  source_message   TEXT,
  confidence       REAL        NOT NULL DEFAULT 1.0,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ
);

CREATE TRIGGER agent_memories_updated_at
  BEFORE UPDATE ON agent_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS agent_memories_session_id_idx ON agent_memories(session_id);

-- ============================================================
-- daily_briefings
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_briefings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_date DATE        NOT NULL,
  category      TEXT        NOT NULL,
  title         TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  icon          TEXT        NOT NULL DEFAULT '',
  agent_name    TEXT,
  agent_id      UUID        REFERENCES agents(id) ON DELETE SET NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'running', 'completed', 'error')),
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER daily_briefings_updated_at
  BEFORE UPDATE ON daily_briefings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS daily_briefings_date_idx ON daily_briefings(briefing_date);

-- ============================================================
-- member_integrations
-- ============================================================
CREATE TABLE IF NOT EXISTS member_integrations (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id          UUID        NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  provider           TEXT        NOT NULL,
  access_token       TEXT,
  refresh_token      TEXT,
  token_expires_at   TIMESTAMPTZ,
  provider_email     TEXT,
  status             TEXT        NOT NULL DEFAULT 'active',
  gmail_last_check   TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, provider)
);

CREATE TRIGGER member_integrations_updated_at
  BEFORE UPDATE ON member_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- email_tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS email_tasks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID        NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  family_id       UUID        REFERENCES families(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL CHECK (type IN ('task', 'note')),
  title           TEXT        NOT NULL,
  content         TEXT,
  source_email_id TEXT        NOT NULL,
  source_subject  TEXT,
  source_from     TEXT,
  done            BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_email_id)
);
