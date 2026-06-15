-- ============================================================
-- RUANGAMBIS — DATABASE SCHEMA FINAL (Blueprint Compliant)
-- Versi: 1.1 (Clean, No Pomodoro/Todo, Full Security)
-- ============================================================

-- 1. PROFILES
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  school_name TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  invited_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INVITATIONS
CREATE TABLE invitations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  created_by  UUID NOT NULL REFERENCES profiles(id),
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PACKAGES
CREATE TABLE packages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBTESTS
CREATE TABLE subtests (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id  UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUESTIONS
CREATE TABLE questions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subtest_id  UUID NOT NULL REFERENCES subtests(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  image_url   TEXT,
  order_index INTEGER NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. OPTIONS
CREATE TABLE options (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label       CHAR(1) NOT NULL CHECK (label IN ('A','B','C','D','E')),
  content     TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TRY-OUT SESSIONS
CREATE TABLE try_out_sessions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES profiles(id),
  package_id     UUID NOT NULL REFERENCES packages(id),
  status         TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'expired')),
  started_at     TIMESTAMPTZ DEFAULT NOW(),
  submitted_at   TIMESTAMPTZ,
  time_remaining INTEGER,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(), -- KRUSIAL untuk Resume Strategy
  score          NUMERIC(5,2),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SESSION ANSWERS
CREATE TABLE session_answers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID NOT NULL REFERENCES try_out_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  option_id   UUID REFERENCES options(id) ON DELETE SET NULL,
  is_flagged  BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMPTZ,
  UNIQUE(session_id, question_id)
);

-- 9. SESSION SUBTEST SCORES
CREATE TABLE session_subtest_scores (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id      UUID NOT NULL REFERENCES try_out_sessions(id) ON DELETE CASCADE,
  subtest_id      UUID NOT NULL REFERENCES subtests(id),
  total_questions INTEGER NOT NULL,
  correct_count   INTEGER NOT NULL DEFAULT 0,
  score           NUMERIC(5,2) NOT NULL DEFAULT 0,
  UNIQUE(session_id, subtest_id)
);

-- 10. FORUM POSTS
CREATE TABLE forum_posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES profiles(id),
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  subtest_id   UUID REFERENCES subtests(id) ON DELETE SET NULL,
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE, -- KRUSIAL untuk Moderasi
  is_locked    BOOLEAN NOT NULL DEFAULT FALSE, -- KRUSIAL untuk Moderasi
  is_answered  BOOLEAN NOT NULL DEFAULT FALSE, -- KRUSIAL untuk Moderasi
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FORUM COMMENTS
CREATE TABLE forum_comments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES & SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE try_out_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_subtest_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Options Public View (Column-level security)
CREATE VIEW options_public AS
SELECT id, question_id, label, content FROM options;

-- Try-out sessions
CREATE POLICY "sessions_select_own" ON try_out_sessions FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "sessions_insert_own" ON try_out_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_update_own" ON try_out_sessions FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Session answers
CREATE POLICY "answers_select_own" ON session_answers FOR SELECT USING (EXISTS (SELECT 1 FROM try_out_sessions WHERE id = session_id AND user_id = auth.uid()) OR is_admin());
CREATE POLICY "answers_insert_own" ON session_answers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM try_out_sessions WHERE id = session_id AND user_id = auth.uid()));

-- Subtest scores
CREATE POLICY "subtest_scores_select_own" ON session_subtest_scores FOR SELECT USING (EXISTS (SELECT 1 FROM try_out_sessions WHERE id = session_id AND user_id = auth.uid()) OR is_admin());

-- Forum Posts
CREATE POLICY "forum_posts_select" ON forum_posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "forum_posts_insert" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_posts_update_own" ON forum_posts FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "forum_posts_delete_own" ON forum_posts FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Forum Comments
CREATE POLICY "forum_comments_select" ON forum_comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "forum_comments_insert" ON forum_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_comments_delete_own" ON forum_comments FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- SUPABASE RPC: calculate_score()
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_score(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_total_correct INTEGER := 0;
  v_total_questions INTEGER := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM try_out_sessions WHERE id = p_session_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO session_subtest_scores (session_id, subtest_id, total_questions, correct_count, score)
  SELECT
    p_session_id,
    q.subtest_id,
    COUNT(sa.id) AS total_questions,
    COUNT(CASE WHEN o.is_correct = TRUE THEN 1 END) AS correct_count,
    ROUND(COUNT(CASE WHEN o.is_correct = TRUE THEN 1 END)::NUMERIC / NULLIF(COUNT(sa.id), 0) * 100, 2) AS score
  FROM session_answers sa
  JOIN questions q ON sa.question_id = q.id
  LEFT JOIN options o ON sa.option_id = o.id
  WHERE sa.session_id = p_session_id
  GROUP BY q.subtest_id
  ON CONFLICT (session_id, subtest_id) DO UPDATE
  SET correct_count = EXCLUDED.correct_count, score = EXCLUDED.score;

  SELECT SUM(correct_count), SUM(total_questions)
  INTO v_total_correct, v_total_questions
  FROM session_subtest_scores WHERE session_id = p_session_id;

  UPDATE try_out_sessions
  SET status = 'submitted', submitted_at = NOW(),
      score = ROUND(v_total_correct::NUMERIC / NULLIF(v_total_questions, 0) * 100, 2)
  WHERE id = p_session_id;

  SELECT jsonb_build_object(
    'total_score', ROUND(v_total_correct::NUMERIC / NULLIF(v_total_questions, 0) * 100, 2),
    'correct_count', v_total_correct,
    'total_questions', v_total_questions,
    'subtest_scores', jsonb_agg(jsonb_build_object('subtest_id', subtest_id, 'score', score, 'correct', correct_count, 'total', total_questions))
  ) INTO v_result FROM session_subtest_scores WHERE session_id = p_session_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DB TRIGGERS: Proteksi Moderasi Forum
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_student_moderation()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin' THEN
    IF (TG_OP = 'UPDATE') THEN
      IF NEW.is_pinned IS DISTINCT FROM OLD.is_pinned OR
         NEW.is_locked IS DISTINCT FROM OLD.is_locked OR
         NEW.is_answered IS DISTINCT FROM OLD.is_answered THEN
        RAISE EXCEPTION 'Hanya admin yang dapat mengubah status moderasi forum';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_prevent_student_moderation
BEFORE UPDATE ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION prevent_student_moderation();