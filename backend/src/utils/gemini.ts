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

// Function calling types
export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface FunctionCall {
  name: string;
  args: Record<string, any>;
}

export interface FunctionHandler {
  (args: any, context: any): Promise<any>;
}

export type FunctionHandlerMap = Record<string, FunctionHandler>;

export async function callGeminiAPI(
  message: string,
  studentContext: StudentContext,
  faqs: FAQ[],
  advisorName: string,
  chatHistory: ChatMessage[] = [],
  functionDeclarations?: FunctionDeclaration[],
  functionHandlers?: FunctionHandlerMap,
  context?: any
): Promise<string> {
  try {
    // Build system instruction
    const systemInstruction = buildSystemInstruction(studentContext, faqs, advisorName, functionDeclarations);

    // Format chat history (use any[] to support both text and function calling parts)
    const formattedHistory: any[] = chatHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add current message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Build request body
    const requestBody: any = {
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
    };

    // Add function declarations if provided
    if (functionDeclarations && functionDeclarations.length > 0) {
      requestBody.tools = [
        {
          functionDeclarations: functionDeclarations
        }
      ];
      requestBody.tool_config = {
        function_calling_config: {
          mode: 'AUTO' // Let the model decide when to call functions
        }
      };
    }

    // Call Gemini API
    let response = await axios.post(GEMINI_ENDPOINT, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      }
    });

    const candidate = response.data.candidates?.[0];

    if (!candidate) {
      throw new Error('No response from Gemini API');
    }

    // Check if model wants to call functions
    const functionCalls = candidate.content?.parts?.filter(
      (part: any) => part.functionCall
    );

    if (functionCalls && functionCalls.length > 0 && functionHandlers) {
      console.log(`[Gemini] Model requested ${functionCalls.length} function call(s)`);

      // Execute all function calls
      const functionResults = [];

      for (const part of functionCalls) {
        const fnCall: FunctionCall = part.functionCall;
        const handler = functionHandlers[fnCall.name];

        if (handler) {
          try {
            console.log(`[Gemini] Executing function: ${fnCall.name}`, fnCall.args);
            const result = await handler(fnCall.args, context);
            console.log(`[Gemini] Function ${fnCall.name} returned:`, result);

            functionResults.push({
              functionResponse: {
                name: fnCall.name,
                response: { result }
              }
            });
          } catch (error: any) {
            console.error(`[Gemini] Function ${fnCall.name} error:`, error.message);
            functionResults.push({
              functionResponse: {
                name: fnCall.name,
                response: { error: error.message }
              }
            });
          }
        } else {
          console.warn(`[Gemini] No handler found for function: ${fnCall.name}`);
          functionResults.push({
            functionResponse: {
              name: fnCall.name,
              response: { error: 'Function not implemented' }
            }
          });
        }
      }

      // Add function call and results to history
      formattedHistory.push({
        role: 'model',
        parts: functionCalls
      });

      formattedHistory.push({
        role: 'user',
        parts: functionResults
      });

      // Call Gemini again with function results to get final response
      const finalRequestBody = {
        ...requestBody,
        contents: formattedHistory
      };

      response = await axios.post(GEMINI_ENDPOINT, finalRequestBody, {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      });

      const finalCandidate = response.data.candidates?.[0];
      const aiResponse = finalCandidate?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No text response after function calls');
      }

      return aiResponse;
    }

    // No function calls - return text response directly
    const aiResponse = candidate.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No text response from Gemini API');
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
  advisorName: string,
  functionDeclarations?: FunctionDeclaration[]
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

  // Build function capabilities section if functions are available
  let functionCapabilities = '';
  if (functionDeclarations && functionDeclarations.length > 0) {
    const functionList = functionDeclarations
      .map((fn) => `  - **${fn.name}**: ${fn.description}`)
      .join('\n');

    functionCapabilities = `
## Available Database Functions
You have access to the following functions to retrieve real-time information from the database:

${functionList}

**When to Use Functions:**
- Use functions when the student asks for specific details not available in the context (e.g., class schedules, advisor contacts, building locations)
- Call the appropriate function to get accurate, up-to-date information
- After getting function results, provide a natural, helpful response using that data
- If a function returns no results or an error, acknowledge this and suggest alternatives

`;
  }

  return `You are an academic advisor assistant for the College.
Help students with academic questions using the FAQ database, their personal information, and available database functions.

## Student Context
- **Student ID**: ${studentContext.studentId}
- **Name**: ${studentContext.fullName}
- **Current Level**: ${studentContext.levelName}
- **Section**: ${studentContext.sectionName}
- **GPA**: ${studentContext.gpa}
- **Enrolled Courses**: ${coursesText}
- **Attendance**: ${studentContext.attendance}%
- **Assigned Advisor**: ${advisorName}
${functionCapabilities}
## Available FAQs
${faqText}

## Instructions
- **Primary Focus**: Base your responses on the provided FAQs whenever applicable
- **Database Queries**: When students ask for specific details (schedules, contacts, locations), use the available functions to retrieve accurate information
- **Personalization**: Use the student's specific situation (level, GPA, courses, attendance) to provide tailored advice
- **Referrals**: If a question requires human judgment, is outside the FAQs/functions, or involves sensitive academic matters (probation, failing grades, appeals), recommend the student contact their advisor: ${advisorName}
- **Scope**: Stay within academic advising - don't provide medical, legal, or personal counseling
- **Tone**: Be helpful, friendly, encouraging, and supportive

## Response Style
- Use clear, professional language
- Keep responses under 200 words unless detailed explanation is needed
- Use bullet points for lists to improve readability
- Be encouraging and positive while being realistic
- If you reference a specific policy or deadline, cite the relevant FAQ
- When presenting function results, format them in a user-friendly way

## Examples of Good Responses
- "Based on your current GPA of ${studentContext.gpa}, you're doing well! For graduation requirements..."
- "As a ${studentContext.levelName} student, you should focus on..."
- "Let me check your class schedule for you..." [calls function] "Your Introduction to CS class meets on MWF from 9:45 AM to 11:15 AM in room CL201 at the Computer Lab Center."
- "This is an important matter that requires personalized attention. I recommend scheduling a meeting with your advisor, ${advisorName}, to discuss..."

Remember: You're a helpful first point of contact with access to real-time data, but complex or personal academic matters should always be directed to the human advisor.`;
}
