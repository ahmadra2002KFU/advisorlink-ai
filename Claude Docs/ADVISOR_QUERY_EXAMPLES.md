# Advisor Query Examples
## Real-World Questions Advisors Can Ask Gemini AI

This document shows example questions advisors can ask the AI assistant and how they map to the 5 implemented functions.

---

## Function 1: getAdvisorStudentList

**Natural Language Queries:**
1. "Show me all my students"
2. "List all students assigned to me"
3. "Who are my advisees?"
4. "Give me a complete list of students I advise"
5. "How many students do I have?"
6. "Show me my student roster"
7. "List all students in my advisory group"

**Expected AI Response:**
```
You have 15 students assigned to you. Here's the complete list:

**Level 1 - Section A:**
- John Smith (STU001) - GPA: 3.45, Attendance: 92.5%
- Sarah Johnson (STU015) - GPA: 3.67, Attendance: 95.0%

**Level 1 - Section B:**
- Mike Davis (STU032) - GPA: 2.98, Attendance: 88.3%

**Level 2 - Section A:**
- Jane Doe (STU045) - GPA: 3.95, Attendance: 97.2%
...
```

---

## Function 2: getHighestGPAStudent

**Natural Language Queries:**
1. "Who has the highest GPA among my students?"
2. "Who is my best student?"
3. "Show me the top performing student"
4. "Which student has the best grades?"
5. "Who is the student with the highest grade point average?"
6. "Tell me about my highest achieving student"

**Expected AI Response:**
```
Jane Doe (STU045) has the highest GPA among your students with a 3.95 GPA.

**Student Details:**
- Name: Jane Doe
- Student ID: STU045
- Email: jane.doe@university.edu
- Level: Level 2
- Section: B
- GPA: 3.95
- Attendance: 97.2%

Jane is performing exceptionally well and would be a great candidate for academic honors and scholarships.
```

---

## Function 3: getHonorStudents

**Natural Language Queries:**
1. "Show me all honor students"
2. "List students eligible for honors"
3. "Who qualifies for cum laude?"
4. "Show me students with high honors"
5. "List all students with GPA above 3.5"
6. "Who are my summa cum laude students?"
7. "Show honor students with GPA above 3.75"
8. "List students eligible for dean's list"

**With Optional minGPA Parameter:**
- "Show honor students with GPA above 3.8"
- "List students with at least 3.7 GPA"

**Expected AI Response (Default minGPA=3.5):**
```
Found 8 honor students with GPA >= 3.50 among your advisees:

**Highest Honors (Summa Cum Laude) - GPA >= 3.90:**
✓ Jane Doe (STU045) - GPA: 3.95, Level 2, Section B
✓ Alex Chen (STU067) - GPA: 3.92, Level 3, Section A

**High Honors (Magna Cum Laude) - GPA 3.75-3.89:**
✓ Sarah Johnson (STU015) - GPA: 3.85, Level 1, Section A
✓ Emily Rodriguez (STU089) - GPA: 3.78, Level 2, Section C
✓ David Kim (STU102) - GPA: 3.76, Level 3, Section B

**Honors (Cum Laude) - GPA 3.50-3.74:**
✓ Michael Brown (STU123) - GPA: 3.67, Level 1, Section B
✓ Lisa Wang (STU145) - GPA: 3.58, Level 2, Section A
✓ James Wilson (STU167) - GPA: 3.52, Level 3, Section C

Summary: 2 highest honors, 3 high honors, 3 honors
```

**Expected AI Response (minGPA=3.8):**
```
Found 3 honor students with GPA >= 3.80:

**Highest Honors (Summa Cum Laude):**
✓ Jane Doe (STU045) - GPA: 3.95
✓ Alex Chen (STU067) - GPA: 3.92

**High Honors (Magna Cum Laude):**
✓ Sarah Johnson (STU015) - GPA: 3.85

All three students are performing at an exceptional level and should be recognized for their academic achievements.
```

---

## Function 4: getStudentsByGPA

### Use Case A: At-Risk Students (Below Threshold)

**Natural Language Queries:**
1. "Show me students with GPA below 2.0"
2. "List students at risk of academic probation"
3. "Who is struggling academically?"
4. "Find students with low grades"
5. "Show me students with GPA under 2.5"
6. "List students who need academic intervention"
7. "Which students have GPA below 3.0?"

**Expected AI Response (threshold=2.0, comparison="below"):**
```
Found 3 students with GPA below 2.00:

**At-Risk Students:**
⚠️ Bob Wilson (STU123) - GPA: 1.95, Level 1, Section C, Attendance: 78.3%
⚠️ Tom Garcia (STU156) - GPA: 1.87, Level 2, Section B, Attendance: 72.1%
⚠️ Kevin Lee (STU178) - GPA: 1.76, Level 1, Section A, Attendance: 68.9%

These students are at risk of academic probation and may need immediate intervention. Consider scheduling one-on-one meetings to discuss:
- Study habits and time management
- Tutoring resources
- Course load reduction
- Academic support services
```

### Use Case B: High Performers (Above Threshold)

**Natural Language Queries:**
1. "Show me students with GPA above 3.5"
2. "List high-performing students"
3. "Who has a GPA over 3.8?"
4. "Find students with excellent grades"
5. "Show me top students with GPA above 3.7"

**Expected AI Response (threshold=3.5, comparison="above"):**
```
Found 5 students with GPA above 3.50:

**High Performers:**
⭐ Jane Doe (STU045) - GPA: 3.95, Level 2, Section B
⭐ Alex Chen (STU067) - GPA: 3.92, Level 3, Section A
⭐ Sarah Johnson (STU015) - GPA: 3.85, Level 1, Section A
⭐ Emily Rodriguez (STU089) - GPA: 3.78, Level 2, Section C
⭐ Michael Brown (STU123) - GPA: 3.67, Level 1, Section B

These students are excelling academically. Consider recommending them for:
- Leadership opportunities
- Research assistant positions
- Peer tutoring programs
- Scholarship applications
- Honors program enrollment
```

---

## Function 5: getLastStudentContact

**Natural Language Queries:**
1. "When did I last talk to Sarah Johnson?"
2. "Find my last contact with John Smith"
3. "When was my last conversation with Jane Doe?"
4. "Show me the last time I contacted Mike Davis"
5. "When did I last communicate with student STU045?"
6. "Find the last interaction with Emily Rodriguez"

**With Partial Names:**
- "When did I last talk to Smith?" (finds any student with "Smith" in name)
- "Find last contact with Sarah" (fuzzy matches)
- "Show last conversation with Rodriguez"

**Expected AI Response (With Contact History):**
```
Last contact with Jane Doe was 2 days ago via Advisor-Student Conversation.

**Student Information:**
- Name: Jane Doe
- Student ID: STU045
- Email: jane.doe@university.edu
- Level: Level 2
- Section: B

**Last Contact Details:**
- Type: Advisor-Student Conversation
- Date: November 7, 2025, 02:30 PM
- Time Since: 2 days ago

Would you like to review the conversation history or send a follow-up message?
```

**Expected AI Response (No Contact History):**
```
No contact history found for John Smith (STU123).

**Student Information:**
- Name: John Smith
- Student ID: STU123
- Email: john.smith@university.edu
- Level: Level 1
- Section: A

This student has not initiated any conversations or AI chats yet. You may want to reach out to introduce yourself and offer support, especially since they're in their first level.
```

**Expected AI Response (AI Chat Contact):**
```
Last contact with Mike Davis was 5 hours ago via AI Chat Session.

**Student Information:**
- Name: Mike Davis
- Student ID: STU032
- Email: mike.davis@university.edu
- Level: Level 1
- Section: B

**Last Contact Details:**
- Type: AI Chat Session (Student used AI assistant)
- Date: November 9, 2025, 09:45 AM
- Time Since: 5 hours ago

Note: This was an AI chat session, not a direct conversation with you. The student may have been seeking general information. Consider checking in to see if they need personal guidance.
```

---

## Cross-Context Examples

Advisors can ask BOTH student questions AND advisor questions in the same conversation:

### Example Conversation 1:
**Advisor:** "What is the registration deadline?"
**AI:** "Course registration for the upcoming semester closes on November 30, 2025..."

**Advisor:** "Thanks! Now show me which of my students have GPA below 2.5"
**AI:** "Found 4 students with GPA below 2.50..."

### Example Conversation 2:
**Advisor:** "Where is the computer lab?"
**AI:** "The main computer lab is located in the Engineering Building, Room 204..."

**Advisor:** "Good to know. Who is my highest GPA student?"
**AI:** "Jane Doe (STU045) has the highest GPA among your students with a 3.95 GPA..."

### Example Conversation 3:
**Advisor:** "How do students apply for financial aid?"
**AI:** "Students can apply for financial aid through the Financial Aid Office..."

**Advisor:** "Got it. Now show me all my honor students"
**AI:** "Found 8 honor students with GPA >= 3.50 among your advisees..."

---

## Complex Multi-Step Queries

### Scenario 1: Preparing for Advisory Meetings
**Advisor:** "Show me all my students"
**AI:** [Lists all 15 students]

**Advisor:** "Now show me which students have GPA below 2.0"
**AI:** [Lists 3 at-risk students]

**Advisor:** "When did I last talk to Bob Wilson?"
**AI:** "Last contact with Bob Wilson was 3 weeks ago..."

**Advisor:** "I should reach out. What resources are available for struggling students?"
**AI:** "The Academic Success Center offers free tutoring..."

### Scenario 2: Honors Recommendations
**Advisor:** "List all honor students with GPA above 3.75"
**AI:** [Lists 5 students in high honors and highest honors]

**Advisor:** "Who has the highest GPA?"
**AI:** "Jane Doe (STU045) has the highest GPA with 3.95..."

**Advisor:** "When did I last talk to Jane?"
**AI:** "Last contact with Jane Doe was 2 days ago..."

**Advisor:** "Good, I recently discussed scholarship opportunities with her."

### Scenario 3: Identifying Support Needs
**Advisor:** "Show students with attendance below 80%"
**AI:** [Uses student context functions if available, or provides general guidance]

**Advisor:** "Show me students with GPA below 2.5"
**AI:** [Lists at-risk students with low GPAs]

**Advisor:** "Are there overlaps between low attendance and low GPA?"
**AI:** [Analyzes and provides insights based on the data]

---

## Edge Cases and Error Handling

### Case 1: Student Not Found
**Advisor:** "When did I last talk to xyz123?"
**AI:** "No student found matching 'xyz123' among your assigned students. Please check the name and try again."

### Case 2: No Honor Students
**Advisor:** "Show honor students with GPA above 3.9"
**AI:** "No honor students found with GPA >= 3.90 among your assigned students. The highest GPA in your group is 3.85."

### Case 3: Invalid GPA Threshold
**Advisor:** "Show students with GPA below 5.0"
**AI:** "Invalid GPA threshold. Please provide a value between 0.0 and 4.0."

### Case 4: No Students Assigned
**Advisor:** "Show me all my students"
**AI:** "No students are currently assigned to you. Please contact the administration if this seems incorrect."

### Case 5: Fuzzy Name Matching
**Advisor:** "When did I last talk to Sarah?"
**AI:** "Found multiple students matching 'Sarah':
- Sarah Johnson (STU015)
- Sarah Williams (STU067)

Last contact with Sarah Johnson was 1 week ago via Advisor-Student Conversation."

---

## Best Practices for Advisors

### 1. Regular Check-ins
```
- "Show me students with GPA below 2.5" (weekly)
- "List students I haven't contacted in 2+ weeks" (when available)
- "Show honor students" (monthly for recognition)
```

### 2. Proactive Intervention
```
- "Which students are at risk of probation?"
- "Show me students with attendance issues"
- "Find students who might need support"
```

### 3. Performance Tracking
```
- "Who is my highest GPA student?"
- "List students with improving GPAs" (when trend tracking available)
- "Show students eligible for dean's list"
```

### 4. Resource Allocation
```
- "Show students who might benefit from tutoring"
- "List students who could be peer tutors"
- "Find students eligible for leadership programs"
```

### 5. Communication Management
```
- "When did I last talk to [student name]?"
- "Show students I need to follow up with"
- "Find students who recently contacted me"
```

---

## Query Tips

1. **Be Specific:** "Show students with GPA below 2.0" is better than "Show bad students"

2. **Use Natural Language:** The AI understands conversational queries like "Who's my best student?"

3. **Combine Queries:** You can ask follow-up questions to drill down into data

4. **Use Partial Names:** "Find last contact with Smith" works for fuzzy matching

5. **Ask for Context:** You can ask both advisor and general student questions

6. **Request Explanations:** "Why is this student at risk?" triggers AI analysis

---

**All queries are processed through Gemini AI with function calling to retrieve real-time data from the database.**
