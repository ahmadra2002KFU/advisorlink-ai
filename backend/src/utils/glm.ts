import OpenAI from 'openai';

const GLM_API_KEY = process.env.GLM_API_KEY || '';
const GLM_BASE_URL = 'https://api.z.ai/api/paas/v4/';

// Initialize OpenAI client with GLM endpoint
const client = new OpenAI({
  apiKey: GLM_API_KEY,
  baseURL: GLM_BASE_URL
});

interface StudentContext {
  // Student-specific (optional)
  studentId?: string;
  sectionName?: string;
  gpa?: string;
  attendance?: string;
  courses?: string[];

  // Advisor-specific (optional)
  advisorId?: string;
  email?: string;
  specialization?: string;
  studentCount?: number;

  // Common (required)
  fullName: string;
  levelName: string;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FunctionHandler {
  (args: any, context: any): Promise<any>;
}

export type FunctionHandlerMap = Record<string, FunctionHandler>;

/**
 * Call GLM-4.6 API with OpenAI SDK
 * Supports function calling and chat history
 */
export async function callGLMAPI(
  message: string,
  studentContext: StudentContext,
  faqs: FAQ[],
  advisorName: string,
  chatHistory: ChatMessage[] = [],
  tools?: OpenAI.Chat.ChatCompletionTool[],
  functionHandlers?: FunctionHandlerMap,
  context?: any
): Promise<string> {
  try {
    console.log('[GLM] Starting API call');
    console.log('[GLM] Tools available:', tools?.length || 0);

    // Build system instruction
    const systemMessage = buildSystemInstruction(
      studentContext,
      faqs,
      advisorName,
      tools
    );

    // Format messages for OpenAI format
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      ...chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // First API call
    console.log('[GLM] Making initial API call...');
    let response = await client.chat.completions.create({
      model: 'glm-4.5-air',
      messages: messages,
      tools: tools,
      temperature: 0.7,
      max_tokens: 2048,
      // Disable thinking mode for direct responses
      // @ts-ignore - GLM-specific parameter
      extra_body: {
        chat_template_kwargs: {
          enable_thinking: false
        }
      }
    });

    let choice = response.choices[0];
    console.log('[GLM] Response finish_reason:', choice.finish_reason);

    // Handle function calls
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      console.log(`[GLM] Model requested ${choice.message.tool_calls.length} function call(s)`);

      // Add assistant message with tool calls
      messages.push(choice.message as any);

      // Execute all tool calls
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type !== 'function') continue;

        // Type assertion for function tool calls
        const functionName = (toolCall as any).function.name;
        const functionArgs = JSON.parse((toolCall as any).function.arguments);

        const handler = functionHandlers?.[functionName];

        if (handler) {
          try {
            console.log(`[GLM] Executing function: ${functionName}`, functionArgs);
            const result = await handler(functionArgs, context);
            console.log(`[GLM] Function ${functionName} returned:`, result);

            // Add function result
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            });
          } catch (error: any) {
            console.error(`[GLM] Function ${functionName} error:`, error.message);
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: error.message })
            });
          }
        } else {
          console.warn(`[GLM] No handler found for function: ${functionName}`);
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: 'Function not implemented' })
          });
        }
      }

      // Second API call with function results
      console.log('[GLM] Making second API call with function results...');
      response = await client.chat.completions.create({
        model: 'glm-4.5-air',
        messages: messages,
        tools: tools,
        temperature: 0.7,
        max_tokens: 2048,
        // @ts-ignore
        extra_body: {
          chat_template_kwargs: {
            enable_thinking: false
          }
        }
      });

      choice = response.choices[0];
      console.log('[GLM] Final response finish_reason:', choice.finish_reason);
    }

    // Return final response
    const finalResponse = choice.message.content || 'No response generated';
    console.log('[GLM] API call completed successfully');
    return finalResponse;
  } catch (error: any) {
    console.error('[GLM] API error:', error.response?.data || error.message);
    console.error('[GLM] Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw new Error('Failed to get AI response from GLM');
  }
}

/**
 * Build system instruction for GLM
 * Similar to Gemini format but optimized for GLM-4.6
 */
function buildSystemInstruction(
  studentContext: StudentContext,
  faqs: FAQ[],
  advisorName: string,
  tools?: OpenAI.Chat.ChatCompletionTool[]
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
    studentContext.courses && studentContext.courses.length > 0
      ? studentContext.courses.join(', ')
      : 'No courses enrolled';

  // Build function capabilities section if tools are available
  let functionCapabilities = '';
  if (tools && tools.length > 0) {
    const functionList = tools
      .filter((tool): tool is OpenAI.Chat.ChatCompletionTool & { type: 'function' } => tool.type === 'function')
      .map((tool) => {
        return `  - **${(tool as any).function.name}**: ${(tool as any).function.description}`;
      })
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

  // Build context section based on user type
  let contextSection = '';
  let roleDescription = '';
  let instructions = '';

  if (studentContext.studentId) {
    // Student context
    roleDescription = 'You are an academic advisor assistant for the College.\nHelp students with academic questions using the FAQ database, their personal information, and available database functions.';
    contextSection = `## Student Context
- **Student ID**: ${studentContext.studentId}
- **Name**: ${studentContext.fullName}
- **Current Level**: ${studentContext.levelName}
- **Section**: ${studentContext.sectionName}
- **GPA**: ${studentContext.gpa}
- **Enrolled Courses**: ${coursesText}
- **Attendance**: ${studentContext.attendance}%
- **Assigned Advisor**: ${advisorName}`;

    instructions = `## Instructions
- **Primary Focus**: Base your responses on the provided FAQs whenever applicable
- **Database Queries**: When students ask for specific details (schedules, contacts, locations), use the available functions to retrieve accurate information
- **Personalization**: Use the student's specific situation (level, GPA, courses, attendance) to provide tailored advice
- **Referrals**: If a question requires human judgment, is outside the FAQs/functions, or involves sensitive academic matters (probation, failing grades, appeals), recommend the student contact their advisor: ${advisorName}
- **Scope**: Stay within academic advising - don't provide medical, legal, or personal counseling
- **Tone**: Be helpful, friendly, encouraging, and supportive`;
  } else if (studentContext.advisorId) {
    // Advisor context
    roleDescription = 'You are an AI assistant for academic advisors.\nHelp advisors with student management, insights, and administrative tasks using the available database functions.';
    contextSection = `## Advisor Context
- **Advisor Name**: ${studentContext.fullName}
- **Email**: ${studentContext.email}
- **Level**: ${studentContext.levelName}
- **Specialization**: ${studentContext.specialization}
- **Assigned Students**: ${studentContext.studentCount}`;

    instructions = `## Instructions
- **Primary Focus**: Assist advisors with student-related queries and management tasks
- **Database Queries**: Use the available functions to retrieve student data, performance metrics, and administrative information
- **Insights**: Provide data-driven insights about students' academic performance and progress
- **Recommendations**: Offer actionable recommendations for student support and intervention
- **Scope**: Focus on academic advising, student management, and data analysis
- **Tone**: Be professional, efficient, and data-focused`;
  }

  return `${roleDescription}

${contextSection}
${functionCapabilities}
## Available FAQs
${faqText}

${instructions}

## Response Style
- Use clear, professional language
- Keep responses under 200 words unless detailed explanation is needed
- Use bullet points for lists to improve readability
- Be encouraging and positive while being realistic
- If you reference a specific policy or deadline, cite the relevant FAQ
- When presenting function results, format them in a user-friendly way

Remember: You're a helpful assistant with access to real-time data. Provide accurate information and actionable insights.`;
}

