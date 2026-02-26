
CREATE TABLE public.instagram_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  ig_user_id TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ig connection" ON public.instagram_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ig connection" ON public.instagram_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ig connection" ON public.instagram_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ig connection" ON public.instagram_connections
  FOR DELETE USING (auth.uid() = user_id);
