
-- Create badges table
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Trophy',
  criteria_type text NOT NULL,
  criteria_value integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
ON public.badges FOR SELECT
TO authenticated
USING (true);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
ON public.user_badges FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
ON public.user_badges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add is_active to profiles for admin disable feature
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Seed default badges
INSERT INTO public.badges (key, name, description, icon, criteria_type, criteria_value) VALUES
  ('first_script', 'Primeiro Roteiro', 'Criou seu primeiro roteiro', 'FileText', 'scripts_count', 1),
  ('scripts_10', 'Roteirista', 'Criou 10 roteiros', 'FileText', 'scripts_count', 10),
  ('first_simulation', 'Primeira Simulação', 'Completou sua primeira simulação', 'ChatCircle', 'simulations_count', 1),
  ('simulations_5', 'Simulador Expert', 'Completou 5 simulações', 'ChatCircle', 'simulations_count', 5),
  ('first_video', 'Primeiro Vídeo', 'Analisou seu primeiro vídeo', 'VideoCamera', 'videos_count', 1),
  ('videos_5', 'Videomaker', 'Analisou 5 vídeos', 'VideoCamera', 'videos_count', 5),
  ('first_patient', 'Primeiro Paciente', 'Cadastrou seu primeiro paciente', 'Crosshair', 'patients_count', 1),
  ('patients_10', 'Clínica Lotada', 'Cadastrou 10 pacientes', 'Crosshair', 'patients_count', 10),
  ('streak_3', 'Constância', 'Manteve streak de 3 dias', 'Lightning', 'streak', 3),
  ('streak_7', 'Disciplinado', 'Manteve streak de 7 dias', 'Lightning', 'streak', 7),
  ('streak_30', 'Imparável', 'Manteve streak de 30 dias', 'Lightning', 'streak', 30),
  ('score_90', 'Alta Performance', 'Obteve score acima de 90 em qualquer módulo', 'Star', 'high_score', 90);
