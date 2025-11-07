-- Create sections table for class sections within levels
CREATE TABLE IF NOT EXISTS public.sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id uuid REFERENCES public.levels(id) ON DELETE CASCADE NOT NULL,
  section_name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(level_id, section_name)
);

-- Enable Row Level Security
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sections
-- Allow all authenticated users to view sections
CREATE POLICY "Allow authenticated users to view sections"
  ON public.sections
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert sections
CREATE POLICY "Only admins can insert sections"
  ON public.sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update sections
CREATE POLICY "Only admins can update sections"
  ON public.sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete sections
CREATE POLICY "Only admins can delete sections"
  ON public.sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX idx_sections_level_id ON public.sections(level_id);

-- Add comment
COMMENT ON TABLE public.sections IS 'Class sections within academic levels (e.g., Section A, B, C)';
