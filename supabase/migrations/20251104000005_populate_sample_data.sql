-- Populate sections for all 5 levels (A, B, C for each level)
INSERT INTO public.sections (level_id, section_name)
SELECT l.id, s.section_name
FROM public.levels l
CROSS JOIN (
  VALUES ('A'), ('B'), ('C')
) AS s(section_name)
ON CONFLICT (level_id, section_name) DO NOTHING;

-- Populate comprehensive FAQs for AI assistant
INSERT INTO public.faqs (question, answer, category) VALUES
  -- Course Registration
  ('How do I register for courses?', 'Course registration opens at the beginning of each semester. Log into the student portal, navigate to "Course Registration," select your desired courses from the available list, and click "Register." Make sure you meet all prerequisites and don''t exceed the credit hour limit for your level.', 'Registration'),

  ('What is the maximum number of credit hours I can take per semester?', 'Students can register for a maximum of 18 credit hours per semester. If you wish to exceed this limit, you need written approval from your academic advisor and the Dean''s office.', 'Registration'),

  ('When is the add/drop deadline?', 'Students can add courses during the first week of the semester and drop courses without penalty during the first two weeks. After that, dropping a course results in a "W" (Withdrawal) on your transcript.', 'Registration'),

  -- Graduation Requirements
  ('What are the graduation requirements for my level?', 'Graduation requirements vary by level and program. Generally, you need to complete all required courses for your major, maintain a minimum GPA of 2.0, complete at least 120 credit hours (varies by program), and pass the comprehensive exam in your final year.', 'Graduation'),

  ('How many credit hours do I need to graduate?', 'Most bachelor''s degree programs require 120-130 credit hours, depending on your major. Check with your academic advisor for your specific program requirements.', 'Graduation'),

  ('Can I graduate early?', 'Yes, if you complete all graduation requirements ahead of schedule. You''ll need approval from your academic advisor and must submit an early graduation petition at least one semester before your intended graduation date.', 'Graduation'),

  -- GPA and Academic Standing
  ('How is my GPA calculated?', 'Your GPA is calculated by dividing the total number of grade points earned by the total number of credit hours attempted. Grade points are calculated by multiplying the credit hours for each course by the grade point value (A=4.0, B=3.0, C=2.0, D=1.0, F=0.0).', 'GPA'),

  ('What is academic probation?', 'Academic probation occurs when your cumulative GPA falls below 2.0. Students on probation have one semester to raise their GPA above 2.0 or face academic suspension. During probation, you may be limited to 12 credit hours per semester.', 'GPA'),

  ('What happens if I fail a course?', 'If you fail a required course, you must retake it. The new grade will replace the old grade in your GPA calculation, but both attempts will appear on your transcript. Failed electives don''t need to be retaken unless required for your degree.', 'GPA'),

  -- Advisor and Support
  ('How do I schedule a meeting with my academic advisor?', 'You can contact your advisor through the MentorLink platform or by email. Advisors typically hold office hours Monday-Thursday from 10 AM to 2 PM. You can also request a meeting at a different time if needed.', 'Advisor'),

  ('What does my academic advisor help me with?', 'Your academic advisor helps with course selection, graduation planning, academic concerns, career guidance, prerequisite clarification, and navigating university policies. They''re your primary contact for all academic matters.', 'Advisor'),

  ('Can I change my academic advisor?', 'Advisor assignments are based on your level and section. If you have a specific concern, contact the Dean''s office to discuss the possibility of reassignment.', 'Advisor'),

  -- Transcripts and Records
  ('How do I request an official transcript?', 'You can request official transcripts through the Registrar''s Office. Submit a transcript request form (available online or in person) with a $10 processing fee. Transcripts are typically processed within 3-5 business days.', 'Transcripts'),

  ('Can I see my unofficial transcript?', 'Yes, you can view and download your unofficial transcript anytime through the student portal under "Academic Records."', 'Transcripts'),

  -- Transfer Credits
  ('Can I transfer credits from another institution?', 'Yes, you can transfer credits from accredited institutions. Submit official transcripts to the Registrar''s Office for evaluation. Generally, courses with a grade of C or higher may transfer, but final decisions are made by the academic department.', 'Transfer'),

  ('How many transfer credits can I apply toward my degree?', 'You can transfer up to 60 credit hours toward a bachelor''s degree. At least 50% of your degree requirements must be completed at this institution.', 'Transfer'),

  -- Prerequisites
  ('What are prerequisites and why do they matter?', 'Prerequisites are courses you must complete before enrolling in advanced courses. They ensure you have the necessary foundation. You cannot register for a course without completing its prerequisites unless you receive a waiver from the instructor.', 'Prerequisites'),

  ('How do I find out the prerequisites for a course?', 'Prerequisites are listed in the course catalog and on the course registration page. You can also ask your academic advisor or check the department website.', 'Prerequisites'),

  -- Exams
  ('When are final exams held?', 'Final exams are held during the last two weeks of each semester according to the published exam schedule. Check the academic calendar or student portal for specific dates and times.', 'Exams'),

  ('What should I do if I have a conflict with an exam schedule?', 'If you have three exams scheduled on the same day or other conflicts, contact your instructors immediately to arrange for a makeup exam. Requests must be made at least two weeks before the exam date.', 'Exams'),

  ('Can I get an extension on an assignment?', 'Extension policies vary by instructor. Contact your professor directly to discuss your situation. Extensions are typically granted only for documented emergencies or extenuating circumstances.', 'Exams'),

  -- General
  ('What is the attendance policy?', 'Attendance policies vary by course and instructor. Generally, missing more than 25% of classes may result in automatic failure. Check your course syllabus for specific attendance requirements.', 'General'),

  ('Can I take courses pass/fail?', 'Yes, you can take up to 12 credit hours of elective courses on a pass/fail basis. Required courses for your major must be taken for a letter grade. Discuss this option with your advisor.', 'General'),

  ('Where can I get tutoring help?', 'The Academic Success Center offers free tutoring for most subjects Monday-Friday from 9 AM to 5 PM. You can also find peer tutors through the student portal or ask your instructor for recommendations.', 'General'),

  ('What should I do if I''m struggling academically?', 'Contact your academic advisor immediately. They can connect you with tutoring services, counseling, time management workshops, and other resources. Don''t wait until it''s too late to seek help.', 'General')
ON CONFLICT DO NOTHING;

-- Note: Sample academic data for students will be added after students are created
-- This can be done manually by admins or through a separate script
COMMENT ON TABLE public.faqs IS 'Contains 25 comprehensive FAQs across 9 categories for the AI assistant';
