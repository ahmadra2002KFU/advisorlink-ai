# Phase 2 Testing Checklist
## Comprehensive Testing Guide for Advisor AI Functions

**Purpose:** Verify all 5 advisor functions work correctly with real data

**Test Account:** advisor.l1.1@mentorlink.com / password123

**Estimated Time:** 30 minutes

---

## Pre-Test Setup

### 1. Database Verification

```bash
cd backend
npx ts-node scripts/verify-academic-thresholds.ts
```

**Expected Output:**
```
✓ academic_thresholds table exists
✓ 5 threshold records found
✓ All indexes created
✓ Trigger functional
```

### 2. Server Status

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Expected:** Server running on port 5000

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Expected:** App running on http://localhost:8080

### 3. Login Verification

1. Navigate to http://localhost:8080
2. Login as: advisor.l1.1@mentorlink.com / password123
3. Verify you see Advisor Dashboard (not Student Dashboard)
4. Navigate to AI Chat

---

## Function Tests

### Test 1: getAdvisorStudentList

**Objective:** Verify complete student list retrieval

**Test Queries:**
```
1. "Show me all my students"
2. "List all students assigned to me"
3. "Who are my advisees?"
4. "How many students do I have?"
```

**Expected Results:**
- [ ] Response shows student count (e.g., "You have 15 students assigned")
- [ ] Students grouped by Level and Section
- [ ] Each student shows: Name, ID, Email, Level, Section, GPA, Attendance
- [ ] Students ordered by: Level → Section → Name
- [ ] No duplicate students
- [ ] All GPAs between 0.0-4.0
- [ ] All attendance percentages between 0-100%
- [ ] Response time < 100ms

**Pass/Fail Criteria:**
- PASS: All students listed with complete data, proper grouping
- FAIL: Missing students, incorrect data, SQL errors

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Total Students: _______
Response Time: _______
Issues Found: _______
```

---

### Test 2: getHighestGPAStudent

**Objective:** Verify top student identification

**Test Queries:**
```
1. "Who has the highest GPA?"
2. "Who is my best student?"
3. "Show me the top performing student"
4. "Which student has the best grades?"
```

**Expected Results:**
- [ ] Response shows single student (not multiple)
- [ ] Student has highest GPA among all listed students
- [ ] Complete student details provided (Name, ID, Email, Level, Section, GPA, Attendance)
- [ ] GPA is 4.0 or close to it
- [ ] Response includes encouraging message
- [ ] Response time < 50ms

**Verification Step:**
Compare highest GPA from Test 1 list with Test 2 result - should match!

**Pass/Fail Criteria:**
- PASS: Correct highest GPA student identified
- FAIL: Wrong student, multiple students, or SQL error

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Student Name: _______
GPA: _______
Matches Test 1?: _______
```

---

### Test 3: getHonorStudents (Default minGPA = 3.5)

**Objective:** Verify honor student categorization

**Test Query:**
```
"Show me all honor students"
```

**Expected Results:**
- [ ] Response shows honor student count (e.g., "Found 8 honor students")
- [ ] Students grouped into 3 categories:
  - [ ] Highest Honors (Summa Cum Laude) - GPA >= 3.90
  - [ ] High Honors (Magna Cum Laude) - GPA >= 3.75
  - [ ] Honors (Cum Laude) - GPA >= 3.50
- [ ] Summary counts correct (e.g., "2 highest honors, 3 high honors, 3 honors")
- [ ] No students with GPA < 3.50 included
- [ ] Students within each category ordered by GPA (highest first)
- [ ] Response time < 150ms

**Pass/Fail Criteria:**
- PASS: Correct categorization, all students >= 3.50
- FAIL: Wrong categories, students < 3.50 included, SQL error

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Total Honor Students: _______
Highest Honors: _______
High Honors: _______
Honors: _______
```

---

### Test 4: getHonorStudents (Custom minGPA)

**Objective:** Verify custom GPA threshold filtering

**Test Queries:**
```
1. "Show honor students with GPA above 3.8"
2. "List students with at least 3.7 GPA"
3. "Show students with GPA above 3.9"
```

**Expected Results:**
- [ ] Only students meeting custom threshold included
- [ ] For minGPA=3.8: Only Highest Honors (3.90+) and some High Honors (3.80-3.89)
- [ ] For minGPA=3.9: Only Highest Honors (3.90+)
- [ ] No students below specified threshold
- [ ] Categories still applied correctly

**Verification:**
```
Query: "Show honor students with GPA above 3.8"
Expected: Students with GPA >= 3.80
Check: All returned students have GPA >= 3.80?
```

**Pass/Fail Criteria:**
- PASS: Only students >= custom threshold shown
- FAIL: Students below threshold included, SQL error

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Custom Threshold: _______
Students Returned: _______
Lowest GPA in Results: _______
```

---

### Test 5: getStudentsByGPA (Below Threshold)

**Objective:** Verify at-risk student identification

**Test Queries:**
```
1. "Show me students with GPA below 2.5"
2. "List students at risk of probation"
3. "Show students with GPA below 2.0"
4. "Find students with GPA under 3.0"
```

**Expected Results:**
- [ ] Response shows count (e.g., "Found 3 students with GPA below 2.50")
- [ ] Category labeled as "At-risk students (below threshold)"
- [ ] Only students with GPA < threshold included
- [ ] Students ordered by GPA ascending (worst first)
- [ ] Helpful intervention suggestions provided
- [ ] Response time < 80ms

**Verification:**
```
Query: "Show students with GPA below 2.5"
Check: All students have GPA < 2.50?
Check: Ordered worst to best?
```

**Pass/Fail Criteria:**
- PASS: Correct filtering, proper ordering
- FAIL: Wrong students included, incorrect ordering, SQL error

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Threshold: _______
Students Below: _______
Lowest GPA: _______
Highest GPA (should be < threshold): _______
```

---

### Test 6: getStudentsByGPA (Above Threshold)

**Objective:** Verify high performer identification

**Test Queries:**
```
1. "Show students with GPA above 3.5"
2. "List high-performing students"
3. "Show students with GPA above 3.7"
```

**Expected Results:**
- [ ] Response shows count (e.g., "Found 5 students with GPA above 3.50")
- [ ] Category labeled as "High performers (above threshold)"
- [ ] Only students with GPA > threshold included
- [ ] Students ordered by GPA descending (best first)
- [ ] Recommendations provided (leadership, scholarships, etc.)
- [ ] Response time < 80ms

**Verification:**
```
Query: "Show students with GPA above 3.5"
Check: All students have GPA > 3.50?
Check: Ordered best to worst?
```

**Pass/Fail Criteria:**
- PASS: Correct filtering, proper ordering
- FAIL: Wrong students included, incorrect ordering, SQL error

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Threshold: _______
Students Above: _______
Highest GPA: _______
Lowest GPA (should be > threshold): _______
```

---

### Test 7: getLastStudentContact (Full Name)

**Objective:** Verify last contact tracking with exact name

**Setup:**
Choose a student name from Test 1 results

**Test Query:**
```
"When did I last talk to [Full Student Name]?"
```

**Example:**
```
"When did I last talk to John Smith?"
```

**Expected Results:**
- [ ] Student found successfully
- [ ] Student information displayed (Name, ID, Email, Level, Section)
- [ ] Contact type shown: "Advisor-Student Conversation" OR "AI Chat Session"
- [ ] Timestamp provided
- [ ] Human-readable "time since" (e.g., "2 days ago")
- [ ] Formatted date shown (e.g., "November 7, 2025, 02:30 PM")
- [ ] Response time < 150ms

**If No Contact:**
- [ ] Clear message: "No contact history found"
- [ ] Student info still displayed
- [ ] Suggestion to reach out provided

**Pass/Fail Criteria:**
- PASS: Student found, contact info accurate
- FAIL: Student not found, SQL error, wrong contact data

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Student Name: _______
Contact Found: YES / NO
Contact Type: _______
Time Since: _______
```

---

### Test 8: getLastStudentContact (Partial Name)

**Objective:** Verify fuzzy name matching

**Test Queries:**
```
1. "When did I last talk to Smith?" (last name only)
2. "Find last contact with Sarah" (first name only)
3. "Show last conversation with John" (partial match)
```

**Expected Results:**
- [ ] Partial name matched to full name
- [ ] Correct student identified (prioritization: exact > starts with > contains)
- [ ] If multiple matches possible, best match selected
- [ ] Rest of response same as Test 7
- [ ] Response time < 150ms

**Verification:**
```
Query: "When did I last talk to Smith?"
Expected: Finds "John Smith" or any student with "Smith" in name
Check: Correct student matched?
```

**Pass/Fail Criteria:**
- PASS: Fuzzy matching works, correct student found
- FAIL: No match found, wrong student matched, SQL error

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Partial Name: _______
Matched To: _______
Multiple Matches?: _______
```

---

### Test 9: getLastStudentContact (No Contact History)

**Objective:** Verify handling of students with no contact

**Setup:**
Identify a new student (likely one with recent enrollment)

**Test Query:**
```
"When did I last talk to [New Student Name]?"
```

**Expected Results:**
- [ ] Student found and identified
- [ ] Clear message: "No contact history found"
- [ ] Student info displayed
- [ ] Helpful suggestion provided (e.g., "reach out to introduce yourself")
- [ ] `hasContact: false` in response structure
- [ ] No errors or crashes

**Pass/Fail Criteria:**
- PASS: Graceful handling, helpful message
- FAIL: Error message, crash, unclear response

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Student Name: _______
Error Handling: Good / Bad
Message Clarity: Clear / Unclear
```

---

### Test 10: Cross-Context Support

**Objective:** Verify advisors can access both student and advisor functions

**Test Sequence:**
```
1. "What is the registration deadline?" ← Student function
2. "Show me all my students" ← Advisor function
3. "Where is the computer lab?" ← Student function
4. "Who has the highest GPA?" ← Advisor function
5. "How do I contact the registrar?" ← Student function
```

**Expected Results:**
- [ ] All 5 queries answered successfully
- [ ] No "function not available" errors
- [ ] Student function queries work (registration, facilities, contacts)
- [ ] Advisor function queries work (student lists, GPA info)
- [ ] Conversation flows naturally
- [ ] Context maintained between queries

**Pass/Fail Criteria:**
- PASS: All queries answered, no errors
- FAIL: Any query fails, function unavailable errors

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Student Functions Working: YES / NO
Advisor Functions Working: YES / NO
Errors Encountered: _______
```

---

### Test 11: Parameter Validation

**Objective:** Verify error handling for invalid parameters

**Invalid GPA Tests:**
```
1. "Show students with GPA below 5.0" (> 4.0)
2. "Show students with GPA below -1" (< 0.0)
3. "Show students with GPA above 10" (> 4.0)
```

**Expected Results:**
- [ ] Error message: "Invalid GPA threshold. Must be between 0.0 and 4.0"
- [ ] No SQL errors
- [ ] No crashes
- [ ] Helpful guidance provided

**Invalid Comparison Tests:**
```
"Show students with GPA xyz 3.0" (invalid comparison)
```

**Expected Results:**
- [ ] Error message: "Invalid comparison type. Use 'below' or 'above'"
- [ ] No SQL errors

**Pass/Fail Criteria:**
- PASS: Graceful error handling, helpful messages
- FAIL: Crashes, SQL errors, unclear messages

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Error Messages Clear: YES / NO
Validation Working: YES / NO
```

---

### Test 12: Performance Benchmarks

**Objective:** Verify acceptable response times

**Test Each Function:**
```
Function 1: getAdvisorStudentList - Target < 100ms
Function 2: getHighestGPAStudent - Target < 50ms
Function 3: getHonorStudents - Target < 150ms
Function 4: getStudentsByGPA - Target < 80ms
Function 5: getLastStudentContact - Target < 150ms
```

**Measurement:**
Use browser DevTools Network tab or check backend logs

**Expected Results:**
- [ ] All functions respond in < 200ms
- [ ] Most functions respond in < 100ms
- [ ] No noticeable lag in UI

**Pass/Fail Criteria:**
- PASS: All queries < 200ms
- FAIL: Consistent queries > 500ms

**Test Result:** ⬜ PASS / ⬜ FAIL

**Performance Notes:**
```
Function 1: _______ms
Function 2: _______ms
Function 3: _______ms
Function 4: _______ms
Function 5: _______ms
Average: _______ms
```

---

### Test 13: Student User Restrictions

**Objective:** Verify students CANNOT access advisor functions

**Setup:**
1. Logout from advisor account
2. Login as student: `s1a001@student.mentorlink.com / password123`
3. Navigate to AI Chat

**Test Queries (Should NOT Work):**
```
1. "Show me all students"
2. "Who has the highest GPA?"
3. "List honor students"
```

**Expected Results:**
- [ ] Functions not available to student
- [ ] Error message or "I don't have access to that information"
- [ ] No student data from other students shown
- [ ] No crashes or SQL errors

**Test Queries (Should Work):**
```
1. "What is my GPA?"
2. "What is the registration deadline?"
3. "Where is the computer lab?"
```

**Expected Results:**
- [ ] Student functions work normally
- [ ] Only student's own data shown
- [ ] General university info accessible

**Pass/Fail Criteria:**
- PASS: Advisor functions blocked, student functions work
- FAIL: Students can access advisor functions

**Test Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
Advisor Functions Blocked: YES / NO
Student Functions Working: YES / NO
Security Issue Found: YES / NO
```

---

### Test 14: Edge Cases

**Objective:** Test unusual scenarios

**Test 14a: Advisor with No Students**
```
Setup: Login as new advisor with no assignments
Query: "Show me all my students"
Expected: "No students are currently assigned to you"
```
- [ ] Test Result: ⬜ PASS / ⬜ FAIL

**Test 14b: No Honor Students**
```
Setup: Use advisor with only low-GPA students (if available)
Query: "Show honor students with GPA above 3.9"
Expected: "No honor students found with GPA >= 3.90"
```
- [ ] Test Result: ⬜ PASS / ⬜ FAIL

**Test 14c: All Students High Performing**
```
Query: "Show students with GPA below 2.0"
Expected: "No students found with GPA below 2.00" (if none exist)
```
- [ ] Test Result: ⬜ PASS / ⬜ FAIL

**Test 14d: Student Not Found**
```
Query: "When did I last talk to XYZ123?"
Expected: "No student found matching 'XYZ123'"
```
- [ ] Test Result: ⬜ PASS / ⬜ FAIL

**Overall Edge Case Result:** ⬜ PASS / ⬜ FAIL

---

### Test 15: Console & Network Inspection

**Objective:** Verify no errors in browser console or network requests

**Steps:**
1. Open Browser DevTools (F12)
2. Check Console tab
3. Check Network tab
4. Run several queries (Tests 1-10)
5. Inspect for errors

**Console Checks:**
- [ ] No JavaScript errors
- [ ] No "Failed to fetch" errors
- [ ] No "TypeError" messages
- [ ] No "undefined" warnings
- [ ] Function call logs present (if logging enabled)

**Network Checks:**
- [ ] All API calls return 200 OK
- [ ] No 400/500 errors
- [ ] Response payloads valid JSON
- [ ] Response times acceptable

**Pass/Fail Criteria:**
- PASS: No console errors, all network requests successful
- FAIL: JavaScript errors, network failures

**Test Result:** ⬜ PASS / ⬜ FAIL

**Issues Found:**
```
Console Errors: _______
Network Errors: _______
Other Issues: _______
```

---

## Summary Report

### Test Results Overview

| Test # | Test Name | Result | Notes |
|--------|-----------|--------|-------|
| 1 | getAdvisorStudentList | ⬜ PASS / ⬜ FAIL | |
| 2 | getHighestGPAStudent | ⬜ PASS / ⬜ FAIL | |
| 3 | getHonorStudents (Default) | ⬜ PASS / ⬜ FAIL | |
| 4 | getHonorStudents (Custom) | ⬜ PASS / ⬜ FAIL | |
| 5 | getStudentsByGPA (Below) | ⬜ PASS / ⬜ FAIL | |
| 6 | getStudentsByGPA (Above) | ⬜ PASS / ⬜ FAIL | |
| 7 | getLastStudentContact (Full) | ⬜ PASS / ⬜ FAIL | |
| 8 | getLastStudentContact (Partial) | ⬜ PASS / ⬜ FAIL | |
| 9 | getLastStudentContact (No Contact) | ⬜ PASS / ⬜ FAIL | |
| 10 | Cross-Context Support | ⬜ PASS / ⬜ FAIL | |
| 11 | Parameter Validation | ⬜ PASS / ⬜ FAIL | |
| 12 | Performance Benchmarks | ⬜ PASS / ⬜ FAIL | |
| 13 | Student Restrictions | ⬜ PASS / ⬜ FAIL | |
| 14 | Edge Cases | ⬜ PASS / ⬜ FAIL | |
| 15 | Console/Network | ⬜ PASS / ⬜ FAIL | |

### Overall Phase 2 Status

**Total Tests:** 15
**Tests Passed:** _______
**Tests Failed:** _______
**Pass Rate:** _______%

**Phase 2 Status:** ⬜ READY FOR PRODUCTION / ⬜ NEEDS FIXES

---

## Critical Issues Found

List any critical issues that must be fixed before production:

```
1.
2.
3.
```

---

## Minor Issues Found

List any minor issues or improvements:

```
1.
2.
3.
```

---

## Recommendations

Based on testing results:

```
1.
2.
3.
```

---

## Tester Information

**Tested By:** _______________________
**Date:** _______________________
**Environment:** Development / Staging / Production
**Backend Version:** _______________________
**Frontend Version:** _______________________
**Database:** SQLite / MySQL

---

## Sign-Off

**Developer:** _______________________  **Date:** _______

**QA Lead:** _______________________  **Date:** _______

**Project Manager:** _______________________  **Date:** _______

---

**Phase 2 Implementation Complete - Ready for Testing**

For issues or questions, refer to:
- `PHASE_2_COMPLETE.md` - Comprehensive documentation
- `ADVISOR_QUICK_START.md` - User guide
- `ADVISOR_FUNCTIONS_SQL_REFERENCE.md` - SQL queries
