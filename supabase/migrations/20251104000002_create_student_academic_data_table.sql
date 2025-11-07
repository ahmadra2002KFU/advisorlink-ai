-- Create student_academic_data table for academic performance tracking
CREATE TABLE IF NOT EXISTS public.student_academic_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  gpa decimal(3,2) CHECK (gpa >= 0 AND gpa <= 4.00),
  enrolled_courses jsonb DEFAULT '[]'::jsonb,
  attendance_percentage decimal(5,2) CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.student_academic_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_academic_data
-- Students can view their own academic data
CREATE POLICY "Students can view their own academic data"
  ON public.student_academic_data
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
  );

-- Advisors can view academic data of their assigned students
CREATE POLICY "Advisors can view assigned students academic data"
  ON public.student_academic_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.advisors a
      JOIN public.advisor_assignments aa ON a.id = aa.advisor_id
      WHERE a.user_id = auth.uid()
        AND aa.student_id = student_academic_data.student_id
    )
  );

-- Admins can view all academic data
CREATE POLICY "Admins can view all academic data"
  ON public.student_academic_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert academic data
CREATE POLICY "Only admins can insert academic data"
  ON public.student_academic_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update academic data
CREATE POLICY "Only admins can update academic data"
  ON public.student_academic_data
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete academic data
CREATE POLICY "Only admins can delete academic data"
  ON public.student_academic_data
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX idx_student_academic_data_student_id ON public.student_academic_data(student_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_student_academic_data_updated_at
  BEFORE UPDATE ON public.student_academic_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.student_academic_data IS 'Academic performance data for students (GPA, courses, attendance)';
