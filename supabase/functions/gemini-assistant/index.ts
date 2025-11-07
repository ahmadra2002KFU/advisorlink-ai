import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = 'AIzaSyCucNtY7tHAND34lO0IUWiTyjxms8h36H4';
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface RequestBody {
  message: string;
  chatHistory?: ChatMessage[];
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, chatHistory = [], userId }: RequestBody = await req.json();

    if (!message || !userId) {
      throw new Error('Message and userId are required');
    }

    // Initialize Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Fetch student profile with level and section
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select(
        `
        *,
        levels(level_number, name),
        sections(section_name)
      `
      )
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Failed to fetch student profile');
    }

    // Fetch academic data
    const { data: academicData } = await supabaseClient
      .from('student_academic_data')
      .select('*')
      .eq('student_id', userId)
      .single();

    // Fetch advisor assignment
    const { data: assignment } = await supabaseClient
      .from('advisor_assignments')
      .select(
        `
        *,
        advisors(
          user_id,
          profiles(full_name)
        )
      `
      )
      .eq('student_id', userId)
      .single();

    // Fetch all FAQs
    const { data: faqs } = await supabaseClient
      .from('faqs')
      .select('question, answer, category')
      .order('category');

    // Build system instruction with student context
    const systemInstruction = buildSystemInstruction(
      {
        student_id: profile.student_id || 'N/A',
        full_name: profile.full_name || 'Student',
        level_name: profile.levels?.name || 'N/A',
        section_name: profile.sections?.section_name || 'N/A',
        gpa: academicData?.gpa || 'N/A',
        enrolled_courses: academicData?.enrolled_courses || [],
        attendance_percentage: academicData?.attendance_percentage || 'N/A',
      },
      faqs || [],
      {
        name:
          assignment?.advisors?.profiles?.full_name || 'Your academic advisor',
      }
    );

    // Format chat history for Gemini API
    const formattedHistory = chatHistory.map((msg: ChatMessage) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Add current message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Call Gemini API
    const geminiResponse = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: formattedHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.9,
          topK: 40,
        },
      }),
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', geminiData);
      throw new Error(
        geminiData.error?.message || 'Failed to generate AI response'
      );
    }

    const aiResponse =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response. Please try again or contact your advisor.';

    return new Response(
      JSON.stringify({
        response: aiResponse,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in gemini-assistant:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        details:
          'Please try again later or contact your advisor for assistance.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function buildSystemInstruction(
  studentData: any,
  faqs: any[],
  advisorData: any
): string {
  // Format FAQs by category
  const faqsByCategory: Record<string, any[]> = {};
  faqs.forEach((faq) => {
    const category = faq.category || 'General';
    if (!faqsByCategory[category]) {
      faqsByCategory[category] = [];
    }
    faqsByCategory[category].push(faq);
  });

  const faqText = Object.entries(faqsByCategory)
    .map(([category, categoryFaqs]) => {
      const faqList = categoryFaqs
        .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
        .join('\n\n');
      return `### ${category}\n${faqList}`;
    })
    .join('\n\n');

  const coursesText =
    Array.isArray(studentData.enrolled_courses) &&
    studentData.enrolled_courses.length > 0
      ? studentData.enrolled_courses.join(', ')
      : 'No courses enrolled';

  return `You are an academic advisor assistant for the College.
Help students with academic questions using the FAQ database and their personal information.

## Student Context
- **Student ID**: ${studentData.student_id}
- **Name**: ${studentData.full_name}
- **Current Level**: ${studentData.level_name}
- **Section**: ${studentData.section_name}
- **GPA**: ${studentData.gpa}
- **Enrolled Courses**: ${coursesText}
- **Attendance**: ${studentData.attendance_percentage}%
- **Assigned Advisor**: ${advisorData.name}

## Available FAQs
${faqText}

## Instructions
- **Primary Focus**: Base your responses on the provided FAQs whenever applicable
- **Personalization**: Use the student's specific situation (level, GPA, courses, attendance) to provide tailored advice
- **Referrals**: If a question requires human judgment, is outside the FAQs, or involves sensitive academic matters (probation, failing grades, appeals), recommend the student contact their advisor: ${advisorData.name}
- **Scope**: Stay within academic advising - don't provide medical, legal, or personal counseling
- **Tone**: Be helpful, friendly, encouraging, and supportive

## Response Style
- Use clear, professional language
- Keep responses under 200 words unless detailed explanation is needed
- Use bullet points for lists to improve readability
- Be encouraging and positive while being realistic
- If you reference a specific policy or deadline, cite the relevant FAQ

## Examples of Good Responses
- "Based on your current GPA of ${studentData.gpa}, you're doing well! For graduation requirements..."
- "As a ${studentData.level_name} student, you should focus on..."
- "I see you're enrolled in [course]. For questions about prerequisites..."
- "This is an important matter that requires personalized attention. I recommend scheduling a meeting with your advisor, ${advisorData.name}, to discuss..."

Remember: You're a helpful first point of contact, but complex or personal academic matters should always be directed to the human advisor.`;
}
