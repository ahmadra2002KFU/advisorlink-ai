-- Add section_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL;

-- Create index for section_id
CREATE INDEX IF NOT EXISTS idx_profiles_section_id ON public.profiles(section_id);

-- Create advisor_assignments table
CREATE TABLE IF NOT EXISTS public.advisor_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  advisor_id uuid REFERENCES public.advisors(id) ON DELETE SET NULL,
  level_id uuid REFERENCES public.levels(id) ON DELETE SET NULL,
  section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL,
  assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.advisor_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advisor_assignments
-- Students can view their own assignment
CREATE POLICY "Students can view their own advisor assignment"
  ON public.advisor_assignments
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
  );

-- Advisors can view their assignments
CREATE POLICY "Advisors can view their assignments"
  ON public.advisor_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.advisors a
      WHERE a.user_id = auth.uid()
        AND a.id = advisor_assignments.advisor_id
    )
  );

-- Admins can view all assignments
CREATE POLICY "Admins can view all advisor assignments"
  ON public.advisor_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can manually insert assignments
CREATE POLICY "Only admins can insert advisor assignments"
  ON public.advisor_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update assignments
CREATE POLICY "Only admins can update advisor assignments"
  ON public.advisor_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete assignments
CREATE POLICY "Only admins can delete advisor assignments"
  ON public.advisor_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_advisor_assignments_student_id ON public.advisor_assignments(student_id);
CREATE INDEX idx_advisor_assignments_advisor_id ON public.advisor_assignments(advisor_id);
CREATE INDEX idx_advisor_assignments_level_id ON public.advisor_assignments(level_id);
CREATE INDEX idx_advisor_assignments_section_id ON public.advisor_assignments(section_id);

-- Add comment
COMMENT ON TABLE public.advisor_assignments IS 'Tracks which advisor is assigned to which student';
