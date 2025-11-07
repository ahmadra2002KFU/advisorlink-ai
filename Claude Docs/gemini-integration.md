# Gemini AI Integration Documentation

This document details the integration of Google's Gemini API into MentorLink for personalized academic assistance.

---

## Overview

**Model:** Gemini 2.5 Flash
**API Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
**Authentication:** API Key (x-goog-api-key header)
**Implementation:** Supabase Edge Function

---

## API Configuration

### API Key
```
AIzaSyCucNtY7tHAND34lO0IUWiTyjxms8h36H4
```

### Request Headers
```javascript
{
  'Content-Type': 'application/json',
  'x-goog-api-key': GEMINI_API_KEY
}
```

### Request Payload Structure
```javascript
{
  system_instruction: {
    parts: [
      { text: "System prompt with student context..." }
    ]
  },
  contents: [
    { role: "user", parts: [{ text: "Previous user message" }] },
    { role: "model", parts: [{ text: "Previous AI response" }] },
    { role: "user", parts: [{ text: "Current user message" }] }
  ],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
    topP: 0.9,
    topK: 40
  }
}
```

---

## System Instruction Template

The AI assistant receives personalized context for each student:

```javascript
const buildSystemInstruction = (studentData, faqs, advisorData) => {
  return `You are an academic advisor assistant for [College Name].
Help students with academic questions using the FAQ database and their personal information.

Student Context:
- Student ID: ${studentData.student_id}
- Name: ${studentData.full_name}
- Current Level: ${studentData.level_name}
- Section: ${studentData.section_name}
- GPA: ${studentData.gpa}
- Enrolled Courses: ${studentData.enrolled_courses.join(', ')}
- Attendance: ${studentData.attendance_percentage}%
- Assigned Advisor: ${advisorData.name}

Available FAQs:
${faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

Instructions:
- Base your responses on the provided FAQs when applicable
- Personalize advice using the student's specific situation (level, GPA, courses)
- Be helpful, friendly, and concise
- If a question requires human judgment or is outside FAQs, suggest the student contact their advisor: ${advisorData.name}
- For urgent academic issues (probation, failing grades), always recommend speaking with the advisor
- Stay within academic advising scope - don't provide medical, legal, or personal counseling

Response Style:
- Use clear, professional language
- Keep responses under 200 words unless detailed explanation is needed
- Use bullet points for lists
- Be encouraging and supportive`;
};
```

---

## Edge Function Implementation

### File: `supabase/functions/gemini-assistant/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = 'AIzaSyCucNtY7tHAND34lO0IUWiTyjxms8h36H4';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    const { message, chatHistory = [], userId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Fetch student data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select(`
        *,
        levels(level_number, name),
        sections(section_name)
      `)
      .eq('id', userId)
      .single();

    // Fetch academic data
    const { data: academicData } = await supabaseClient
      .from('student_academic_data')
      .select('*')
      .eq('student_id', userId)
      .single();

    // Fetch advisor assignment
    const { data: assignment } = await supabaseClient
      .from('advisor_assignments')
      .select(`
        *,
        advisors(
          user_id,
          profiles(full_name)
        )
      `)
      .eq('student_id', userId)
      .single();

    // Fetch FAQs
    const { data: faqs } = await supabaseClient
      .from('faqs')
      .select('question, answer, category');

    // Build system instruction
    const systemInstruction = buildSystemInstruction(
      {
        student_id: profile.student_id,
        full_name: profile.full_name,
        level_name: profile.levels.name,
        section_name: profile.sections.section_name,
        gpa: academicData?.gpa || 'N/A',
        enrolled_courses: academicData?.enrolled_courses || [],
        attendance_percentage: academicData?.attendance_percentage || 'N/A'
      },
      faqs || [],
      {
        name: assignment?.advisors?.profiles?.full_name || 'Your academic advisor'
      }
    );

    // Format chat history
    const formattedHistory = chatHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add current message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Gemini API
    const geminiResponse = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: formattedHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.9,
          topK: 40
        }
      })
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      throw new Error(geminiData.error?.message || 'Gemini API error');
    }

    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});

function buildSystemInstruction(studentData: any, faqs: any[], advisorData: any): string {
  const faqText = faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');

  return `You are an academic advisor assistant for the College.
Help students with academic questions using the FAQ database and their personal information.

Student Context:
- Student ID: ${studentData.student_id}
- Name: ${studentData.full_name}
- Current Level: ${studentData.level_name}
- Section: ${studentData.section_name}
- GPA: ${studentData.gpa}
- Enrolled Courses: ${studentData.enrolled_courses.join(', ')}
- Attendance: ${studentData.attendance_percentage}%
- Assigned Advisor: ${advisorData.name}

Available FAQs:
${faqText}

Instructions:
- Base your responses on the provided FAQs when applicable
- Personalize advice using the student's specific situation (level, GPA, courses)
- Be helpful, friendly, and concise
- If a question requires human judgment or is outside FAQs, suggest the student contact their advisor: ${advisorData.name}
- For urgent academic issues (probation, failing grades), always recommend speaking with the advisor
- Stay within academic advising scope

Response Style:
- Use clear, professional language
- Keep responses under 200 words unless detailed explanation is needed
- Use bullet points for lists
- Be encouraging and supportive`;
}
```

---

## Response Format

### Success Response
```javascript
{
  "response": "AI generated text response here..."
}
```

### Error Response
```javascript
{
  "error": "Error message here"
}
```

---

## Frontend Integration (Chat.tsx)

```typescript
const sendMessage = async (message: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  const response = await supabase.functions.invoke('gemini-assistant', {
    body: {
      message: message,
      chatHistory: chatHistory,
      userId: user?.id
    }
  });

  if (response.error) throw response.error;

  return response.data.response;
};
```

---

## Rate Limits and Error Handling

### Gemini API Free Tier Limits:
- **Requests per minute:** 15
- **Requests per day:** 1,500
- **Tokens per minute:** 1,000,000

### Error Handling:
- **429 Too Many Requests:** Show user-friendly message about rate limiting
- **500 Server Error:** Fallback to suggesting user contact advisor
- **Network Error:** Retry mechanism with exponential backoff

---

## Testing Checklist

- [ ] AI responds to basic questions from FAQs
- [ ] AI personalizes responses with student's level and GPA
- [ ] AI references student's enrolled courses when relevant
- [ ] AI suggests contacting advisor for complex issues
- [ ] Chat history maintains context across multiple turns
- [ ] Error handling works for API failures
- [ ] Rate limiting is handled gracefully
- [ ] Student data privacy is maintained (no data leakage)

---

## Future Enhancements (Post-MVP)

- Streaming responses for better UX
- Conversation analytics for admin
- FAQ effectiveness tracking
- Multi-language support (Arabic)
- Voice input/output
- Integration with course catalog
- Proactive advisor recommendations based on student queries

---

This integration provides students with 24/7 access to personalized academic guidance while respecting privacy and maintaining appropriate boundaries.
