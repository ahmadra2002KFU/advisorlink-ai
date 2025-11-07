-- Function to automatically assign advisor to new students
CREATE OR REPLACE FUNCTION auto_assign_advisor()
RETURNS TRIGGER AS $$
DECLARE
  assigned_advisor_id uuid;
BEGIN
  -- Only auto-assign for students (those with a level_id and not already assigned)
  IF NEW.level_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.advisor_assignments WHERE student_id = NEW.id
  ) THEN

    -- Find available advisor for student's level with fewest current assignments
    SELECT a.id INTO assigned_advisor_id
    FROM public.advisors a
    WHERE a.level_id = NEW.level_id
      AND a.is_available = true
    ORDER BY (
      SELECT COUNT(*)
      FROM public.advisor_assignments aa
      WHERE aa.advisor_id = a.id
    ) ASC
    LIMIT 1;

    -- Create assignment if advisor found
    IF assigned_advisor_id IS NOT NULL THEN
      INSERT INTO public.advisor_assignments (student_id, advisor_id, level_id, section_id)
      VALUES (NEW.id, assigned_advisor_id, NEW.level_id, NEW.section_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for re-running migration)
DROP TRIGGER IF EXISTS trigger_auto_assign_advisor ON public.profiles;

-- Create trigger to auto-assign advisor after profile creation
CREATE TRIGGER trigger_auto_assign_advisor
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_advisor();

-- Also create trigger for when level_id is updated (student added to a level)
DROP TRIGGER IF EXISTS trigger_auto_assign_advisor_on_level_update ON public.profiles;

CREATE TRIGGER trigger_auto_assign_advisor_on_level_update
  AFTER UPDATE OF level_id ON public.profiles
  FOR EACH ROW
  WHEN (OLD.level_id IS NULL AND NEW.level_id IS NOT NULL)
  EXECUTE FUNCTION auto_assign_advisor();

-- Add comment
COMMENT ON FUNCTION auto_assign_advisor() IS 'Automatically assigns an available advisor with the fewest students to new students based on their level';
