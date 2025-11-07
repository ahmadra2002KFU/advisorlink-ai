# Database Migration Instructions

## Issue
The Supabase MCP connection is timing out. Migrations need to be applied manually.

## Migrations Created
All migration files are ready in `supabase/migrations/`:
1. `20251104000001_create_sections_table.sql` - Creates sections table
2. `20251104000002_create_student_academic_data_table.sql` - Creates academic data table
3. `20251104000003_create_advisor_assignments_table.sql` - Creates assignments table
4. `20251104000004_create_auto_assign_advisor_function.sql` - Auto-assignment logic
5. `20251104000005_populate_sample_data.sql` - Sample sections and FAQs

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended for MVP)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content **in order** (001, 002, 003, 004, 005)
4. Run each migration one at a time
5. Verify each completes successfully before moving to the next

### Option 2: Supabase CLI
If you have the Supabase CLI set up and linked:
```bash
# Link your project (one-time setup)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push
```

### Option 3: Direct SQL Execution
Use any PostgreSQL client with your Supabase connection string to run the migrations.

## Verification
After applying all migrations, verify:
```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('sections', 'student_academic_data', 'advisor_assignments');

-- Check if sections are populated (should return 15 rows)
SELECT COUNT(*) FROM public.sections;

-- Check if FAQs are populated (should return 25 rows)
SELECT COUNT(*) FROM public.faqs;

-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_auto_assign_advisor';
```

## Next Steps
Once migrations are applied successfully:
1. Generate TypeScript types: `npx supabase gen types typescript --local > src/integrations/supabase/types.ts`
2. Continue with Gemini Edge Function deployment
3. Test the auto-assignment by creating a test student profile

## Troubleshooting
- **Foreign key errors**: Ensure migrations run in order (001 → 005)
- **Policy errors**: Make sure user_roles table exists from previous migrations
- **Duplicate errors**: If rerunning, check for `IF NOT EXISTS` clauses or drop tables first
