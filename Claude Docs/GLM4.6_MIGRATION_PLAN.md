# GLM4.6 API Migration Plan

**Status:** 🎯 **READY FOR IMPLEMENTATION**
**Date:** 2025-11-10
**API Provider:** Z.AI (https://api.z.ai)

---

## 📋 Executive Summary

We're migrating from **Gemini API** to **GLM4.6 API** due to quota limitations. GLM4.6 offers:
- ✅ OpenAI SDK Compatibility (minimal code changes)
- ✅ Full function calling support
- ✅ Better rate limits
- ✅ Agent-oriented foundation model
- ✅ Cost-effective pricing

---

## 🔍 Research Findings

### GLM4.6 API Details:
- **Endpoint**: `https://api.z.ai/api/paas/v4/chat/completions`
- **Model Name**: `glm-4.6`
- **Authentication**: Bearer token (API Key provided)
- **SDK**: OpenAI Python/Node SDK compatible
- **Function Calling**: ✅ Supported (OpenAI-compatible format)
- **API Key**: `3681d5512fae4bf19fde41c3d22f5d9f.DlZ01jRdyaIdMthL`

### Current Implementation (Gemini):
- File: `backend/src/utils/gemini.ts`
- Uses: Axios for HTTP requests
- Function Calling: Gemini-specific format
- System Instructions: Custom format
- Chat History: Managed manually

---

## 🎯 Migration Strategy

### Approach: Use OpenAI SDK (Recommended)

**Why OpenAI SDK?**
1. Industry-standard, well-maintained
2. GLM4.6 is fully compatible
3. Minimal code changes needed
4. Better error handling and types
5. Future-proof (easy to switch between OpenAI-compatible APIs)

**Implementation Steps:**
1. Install `openai` npm package
2. Create new GLM client utility
3. Convert function declarations to OpenAI format
4. Update controller to use new client
5. Test all Phase 2 functions

---

## 📦 Package Installation

```bash
cd backend
npm install openai
npm install --save-dev @types/node  # Already installed
```

---

## 🏗️ Architecture Comparison

### Current (Gemini):
```typescript
// gemini.ts
export async function callGeminiAPI(
  message: string,
  studentContext: StudentContext,
  faqs: FAQ[],
  advisorName: string,
  chatHistory: ChatMessage[],
  functionDeclarations?: FunctionDeclaration[],  // Gemini format
  functionHandlers?: FunctionHandlerMap,
  context?: any
): Promise<string>
```

### New (GLM4.6):
```typescript
// glm.ts
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GLM_API_KEY,
  baseURL: 'https://api.z.ai/api/paas/v4/'
});

export async function callGLMAPI(
  message: string,
  studentContext: StudentContext,
  faqs: FAQ[],
  advisorName: string,
  chatHistory: ChatMessage[],
  tools?: OpenAI.Chat.ChatCompletionTool[],  // OpenAI format
  functionHandlers?: FunctionHandlerMap,
  context?: any
): Promise<string>
```

---

## 🔄 Function Declaration Format Changes

### Gemini Format (Current):
```typescript
{
  name: "getStudentSchedule",
  description: "Get the student's class schedule",
  parameters: {
    type: "object",
    properties: {
      studentName: {
        type: "string",
        description: "Student name"
      }
    },
    required: ["studentName"]
  }
}
```

### OpenAI/GLM Format (New):
```typescript
{
  type: "function",
  function: {
    name: "getStudentSchedule",
    description: "Get the student's class schedule",
    parameters: {
      type: "object",
      properties: {
        studentName: {
          type: "string",
          description: "Student name"
        }
      },
      required: ["studentName"]
    }
  }
}
```

**Key Difference**: Wrap in `{ type: "function", function: {...} }`

---

## 🔧 Implementation Details

### 1. Create GLM Client (`backend/src/utils/glm.ts`)

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GLM_API_KEY || '',
  baseURL: 'https://api.z.ai/api/paas/v4/'
});

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
    // Build system message
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
    let response = await client.chat.completions.create({
      model: 'glm-4.6',
      messages: messages,
      tools: tools,
      temperature: 0.7,
      max_tokens: 2048
    });

    let choice = response.choices[0];

    // Handle function calls
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      console.log(`[GLM] Model requested ${choice.message.tool_calls.length} function call(s)`);

      // Add assistant message with tool calls
      messages.push(choice.message);

      // Execute all tool calls
      for (const toolCall of choice.message.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        const handler = functionHandlers?.[functionName];

        if (handler) {
          try {
            console.log(`[GLM] Executing: ${functionName}`, functionArgs);
            const result = await handler(functionArgs, context);
            console.log(`[GLM] Result:`, result);

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
        }
      }

      // Second API call with function results
      response = await client.chat.completions.create({
        model: 'glm-4.6',
        messages: messages,
        tools: tools,
        temperature: 0.7,
        max_tokens: 2048
      });

      choice = response.choices[0];
    }

    // Return final response
    return choice.message.content || 'No response generated';
  } catch (error: any) {
    console.error('GLM API error:', error.response?.data || error.message);
    throw new Error('Failed to get AI response from GLM');
  }
}
```

### 2. Update Environment Variables

```bash
# backend/.env
GLM_API_KEY=3681d5512fae4bf19fde41c3d22f5d9f.DlZ01jRdyaIdMthL

# Optional: Keep Gemini as fallback
# GEMINI_API_KEY=...
```

### 3. Update Function Declarations in Controller

```typescript
// In aiController.ts, wrap function declarations:
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getStudentSchedule",
      description: "Get the student's class schedule for a specific date or day",
      parameters: {
        type: "object",
        properties: {
          studentName: {
            type: "string",
            description: "The student's full name (optional, uses current student if not provided)"
          },
          date: {
            type: "string",
            description: "Specific date in YYYY-MM-DD format (optional)"
          }
        }
      }
    }
  }
  // ... other functions
];
```

### 4. Update Controller Import

```typescript
// Change from:
import { callGeminiAPI } from '../utils/gemini';

// To:
import { callGLMAPI } from '../utils/glm';

// Update function call:
const aiResponse = await callGLMAPI(
  message,
  studentContext,
  faqs,
  advisor.full_name,
  chatHistory,
  tools,           // OpenAI-compatible tools
  functionHandlers,
  context
);
```

---

## ✅ Testing Checklist

### Phase 2 Functions to Test:
- [ ] **getStudentSchedule** - Get class schedule
- [ ] **getAdvisorContact** - Get advisor contact info
- [ ] **getFacilityLocation** - Find building/room locations
- [ ] **getStudentInfo** - Get student details
- [ ] **getAtRiskStudents** - List at-risk students
- [ ] **getHonorRollStudents** - List honor students
- [ ] **getAllAdvisorStudents** - Get advisor's student list
- [ ] **getStudentCourses** - Get student course enrollments

### Test Cases:
1. **Simple chat** (no function calling)
   - "Hello, how are you?"
   - "What is my GPA?" (uses context, not function)

2. **Single function call**
   - "What's my class schedule today?"
   - "Where is my advisor's office?"

3. **Multiple function calls**
   - "Show me my schedule and my advisor's contact info"

4. **Error handling**
   - Invalid function arguments
   - Function execution errors
   - API errors

---

## 📊 Expected Performance

### GLM4.6 Characteristics:
- **Speed**: Fast inference (comparable to Gemini)
- **Context Length**: 128K tokens
- **Function Calling**: Reliable and accurate
- **Reasoning**: Built-in thinking mode (can disable with `enable_thinking: false`)

### Rate Limits:
- Check Z.AI dashboard for current limits
- Monitor usage at https://api.z.ai/usage

---

## 🚨 Rollback Plan

If GLM4.6 doesn't work as expected:
1. Keep `gemini.ts` file intact
2. Use environment variable to switch:
   ```typescript
   const AI_PROVIDER = process.env.AI_PROVIDER || 'glm'; // or 'gemini'
   ```
3. Fallback to Gemini if GLM fails

---

## 📝 Implementation Timeline

### Estimated Time: 2-3 hours

1. **Install packages** (5 min)
2. **Create GLM client** (30 min)
3. **Update function declarations** (20 min)
4. **Update controller** (20 min)
5. **Update environment** (5 min)
6. **Testing** (60 min)
7. **Bug fixes** (30 min)

---

## 🎯 Success Criteria

Migration successful when:
- ✅ All Phase 2 functions work with GLM4.6
- ✅ Function calling executes correctly
- ✅ Chat history maintained properly
- ✅ Error handling works as expected
- ✅ Response quality comparable to Gemini
- ✅ No API quota errors

---

## 📚 References

- GLM4.6 Docs: https://docs.z.ai/guides/overview/quick-start
- OpenAI SDK (Node): https://github.com/openai/openai-node
- Context7 GLM-4.5 Docs: /zai-org/glm-4.5
- Z.AI Platform: https://api.z.ai

---

**Ready to implement? Let's start with package installation!** 🚀
