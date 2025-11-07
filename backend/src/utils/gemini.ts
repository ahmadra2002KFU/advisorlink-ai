import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface StudentContext {
  studentId: string;
  fullName: string;
  levelName: string;
  sectionName: string;
  gpa: string;
  attendance: string;
  courses: string[];
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function callGeminiAPI(
  message: string,
  studentContext: StudentContext,
  faqs: FAQ[],
  advisorName: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Build system instruction
    const systemInstruction = buildSystemInstruction(studentContext, faqs, advisorName);

    // Format chat history
    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add current message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Gemini API
    const response = await axios.post(
      GEMINI_ENDPOINT,
      {
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
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from Gemini API');
    }

    return aiResponse;
  } catch (error: any) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw new Error('Failed to get AI response');
  }
}

function buildSystemInstruction(
  studentContext: StudentContext,
  faqs: FAQ[],
  advisorName: string
): string {
  // Group FAQs by category
  const faqsByCategory: Record<string, FAQ[]> = {};
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
    studentContext.courses.length > 0
      ? studentContext.courses.join(', ')
      : 'No courses enrolled';

  return `You are an academic advisor assistant for the College.
Help students with academic questions using the FAQ database and their personal information.

## Student Context
- **Student ID**: ${studentContext.studentId}
- **Name**: ${studentContext.fullName}
- **Current Level**: ${studentContext.levelName}
- **Section**: ${studentContext.sectionName}
- **GPA**: ${studentContext.gpa}
- **Enrolled Courses**: ${coursesText}
- **Attendance**: ${studentContext.attendance}%
- **Assigned Advisor**: ${advisorName}

## Available FAQs
${faqText}

## Instructions
- **Primary Focus**: Base your responses on the provided FAQs whenever applicable
- **Personalization**: Use the student's specific situation (level, GPA, courses, attendance) to provide tailored advice
- **Referrals**: If a question requires human judgment, is outside the FAQs, or involves sensitive academic matters (probation, failing grades, appeals), recommend the student contact their advisor: ${advisorName}
- **Scope**: Stay within academic advising - don't provide medical, legal, or personal counseling
- **Tone**: Be helpful, friendly, encouraging, and supportive

## Response Style
- Use clear, professional language
- Keep responses under 200 words unless detailed explanation is needed
- Use bullet points for lists to improve readability
- Be encouraging and positive while being realistic
- If you reference a specific policy or deadline, cite the relevant FAQ

## Examples of Good Responses
- "Based on your current GPA of ${studentContext.gpa}, you're doing well! For graduation requirements..."
- "As a ${studentContext.levelName} student, you should focus on..."
- "I see you're enrolled in [course]. For questions about prerequisites..."
- "This is an important matter that requires personalized attention. I recommend scheduling a meeting with your advisor, ${advisorName}, to discuss..."

Remember: You're a helpful first point of contact, but complex or personal academic matters should always be directed to the human advisor.`;
}
