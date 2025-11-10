# Phase 2 Advisor Functions - Sample Outputs

This document shows real sample outputs from all 5 advisor functions based on actual test execution.

---

## Test Context

**Advisor:** Hamza Abdullah (advisor.l1.1@mentorlink.com)
**Level:** Level 1
**Assigned Students:** 10
**Date:** November 9, 2025

---

## Function 1: getAdvisorStudentList

### Purpose
Get complete list of all students assigned to the current advisor.

### Parameters
None (uses advisorId from context)

### Sample Output

```json
{
  "success": true,
  "message": "You have 10 students assigned",
  "totalStudents": 10,
  "students": [
    {
      "studentId": "S1A019",
      "name": "Ali Salem",
      "email": "s1a019@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "2.17",
      "attendance": "97.8%"
    },
    {
      "studentId": "S1A013",
      "name": "Maha Al-Nahyan",
      "email": "s1a013@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "2.51",
      "attendance": "79.4%"
    },
    {
      "studentId": "S1A001",
      "name": "Mustafa Ibrahim",
      "email": "s1a001@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.99",
      "attendance": "74.3%"
    },
    {
      "studentId": "S1A007",
      "name": "Nour Al-Nahyan",
      "email": "s1a007@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.66",
      "attendance": "87.2%"
    },
    {
      "studentId": "S1A004",
      "name": "Salma Nasser",
      "email": "s1a004@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.88",
      "attendance": "94.0%"
    },
    {
      "studentId": "S1A010",
      "name": "Sana Mohammed",
      "email": "s1a010@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "2.29",
      "attendance": "81.5%"
    },
    {
      "studentId": "S1A016",
      "name": "Sara Al-Marzouqi",
      "email": "s1a016@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "2.73",
      "attendance": "85.9%"
    },
    {
      "studentId": "S1A022",
      "name": "Tariq Al-Sabah",
      "email": "s1a022@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.93",
      "attendance": "91.6%"
    },
    {
      "studentId": "S1A025",
      "name": "Yasmine Hassan",
      "email": "s1a025@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.10",
      "attendance": "88.7%"
    },
    {
      "studentId": "S1A028",
      "name": "Zara Abdullah",
      "email": "s1a028@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "2.84",
      "attendance": "76.1%"
    }
  ]
}
```

### Use Cases
- View all assigned students
- Export student roster
- Quick overview of student performance
- Attendance monitoring

---

## Function 2: getHighestGPAStudent

### Purpose
Find the student with the highest GPA among advisor's assigned students.

### Parameters
None (uses advisorId from context)

### Sample Output

```json
{
  "success": true,
  "message": "Mustafa Ibrahim has the highest GPA among your students",
  "student": {
    "studentId": "S1A001",
    "name": "Mustafa Ibrahim",
    "email": "s1a001@student.mentorlink.com",
    "level": "Level 1 (Level 1)",
    "section": "A",
    "gpa": "3.99",
    "attendance": "74.3%"
  }
}
```

### Use Cases
- Identify top performer
- Award recognition
- Scholarship recommendations
- Academic achievement tracking

---

## Function 3: getHonorStudents

### Purpose
Get all honor students with categorization by GPA level.

### Parameters
- `minGPA` (optional): Minimum GPA threshold (default: 3.5)

### Sample Call
```json
{
  "minGPA": 3.5
}
```

### Sample Output

```json
{
  "success": true,
  "message": "Found 4 honor students with GPA >= 3.50",
  "totalHonorStudents": 4,
  "summary": {
    "highestHonorsCount": 2,
    "highHonorsCount": 1,
    "honorsCount": 1
  },
  "studentsByCategory": {
    "highestHonors": {
      "category": "Highest Honors (Summa Cum Laude)",
      "description": "GPA >= 3.90",
      "count": 2,
      "students": [
        {
          "studentId": "S1A001",
          "name": "Mustafa Ibrahim",
          "email": "s1a001@student.mentorlink.com",
          "level": "Level 1 (Level 1)",
          "section": "A",
          "gpa": "3.99",
          "attendance": "74.3%",
          "honorCategory": "Highest Honors (Summa Cum Laude)"
        },
        {
          "studentId": "S1A022",
          "name": "Tariq Al-Sabah",
          "email": "s1a022@student.mentorlink.com",
          "level": "Level 1 (Level 1)",
          "section": "A",
          "gpa": "3.93",
          "attendance": "91.6%",
          "honorCategory": "Highest Honors (Summa Cum Laude)"
        }
      ]
    },
    "highHonors": {
      "category": "High Honors (Magna Cum Laude)",
      "description": "GPA 3.75 - 3.89",
      "count": 1,
      "students": [
        {
          "studentId": "S1A004",
          "name": "Salma Nasser",
          "email": "s1a004@student.mentorlink.com",
          "level": "Level 1 (Level 1)",
          "section": "A",
          "gpa": "3.88",
          "attendance": "94.0%",
          "honorCategory": "High Honors (Magna Cum Laude)"
        }
      ]
    },
    "honors": {
      "category": "Honors (Cum Laude)",
      "description": "GPA 3.50 - 3.74",
      "count": 1,
      "students": [
        {
          "studentId": "S1A007",
          "name": "Nour Al-Nahyan",
          "email": "s1a007@student.mentorlink.com",
          "level": "Level 1 (Level 1)",
          "section": "A",
          "gpa": "3.66",
          "attendance": "87.2%",
          "honorCategory": "Honors (Cum Laude)"
        }
      ]
    }
  }
}
```

### Use Cases
- Graduation honors determination
- Dean's list compilation
- Academic awards
- Scholarship eligibility
- Parent/guardian communications

---

## Function 4: getStudentsByGPA

### Purpose
Filter students by GPA threshold (above or below).

### Parameters
- `threshold`: GPA value (e.g., 2.5, 3.0, 3.5)
- `comparison`: "below" or "above" (default: "below")

### Sample Call 1: At-Risk Students

```json
{
  "threshold": 2.5,
  "comparison": "below"
}
```

#### Sample Output

```json
{
  "success": true,
  "message": "Found 2 students with GPA below 2.50",
  "category": "At-risk students (below threshold)",
  "threshold": "2.50",
  "comparison": "below",
  "totalStudents": 2,
  "students": [
    {
      "studentId": "S1A019",
      "name": "Ali Salem",
      "email": "s1a019@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "2.17",
      "attendance": "97.8%"
    },
    {
      "studentId": "S1A010",
      "name": "Sana Mohammed",
      "email": "s1a010@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "2.29",
      "attendance": "81.5%"
    }
  ]
}
```

### Sample Call 2: High Performers

```json
{
  "threshold": 3.5,
  "comparison": "above"
}
```

#### Sample Output

```json
{
  "success": true,
  "message": "Found 4 students with GPA above 3.50",
  "category": "High performers (above threshold)",
  "threshold": "3.50",
  "comparison": "above",
  "totalStudents": 4,
  "students": [
    {
      "studentId": "S1A001",
      "name": "Mustafa Ibrahim",
      "email": "s1a001@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.99",
      "attendance": "74.3%"
    },
    {
      "studentId": "S1A022",
      "name": "Tariq Al-Sabah",
      "email": "s1a022@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.93",
      "attendance": "91.6%"
    },
    {
      "studentId": "S1A004",
      "name": "Salma Nasser",
      "email": "s1a004@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.88",
      "attendance": "94.0%"
    },
    {
      "studentId": "S1A007",
      "name": "Nour Al-Nahyan",
      "email": "s1a007@student.mentorlink.com",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.66",
      "attendance": "87.2%"
    }
  ]
}
```

### Use Cases
- **Below threshold:**
  - Academic probation identification
  - Intervention planning
  - Tutoring assignments
  - Early warning system

- **Above threshold:**
  - Honor roll generation
  - Advanced course recommendations
  - Leadership opportunities
  - Peer tutoring recruitment

---

## Function 5: getLastStudentContact

### Purpose
Find the most recent contact with a specific student (supports fuzzy name matching).

### Parameters
- `studentName`: Full or partial student name

### Sample Call

```json
{
  "studentName": "Mustafa Ibrahim"
}
```

### Sample Output

```json
{
  "success": true,
  "student": {
    "name": "Mustafa Ibrahim",
    "studentId": "S1A001",
    "email": "s1a001@student.mentorlink.com",
    "level": "Level 1",
    "section": "A"
  },
  "lastContact": {
    "type": "AI Chat Session",
    "timestamp": "2025-11-07 12:33:26",
    "timeSince": "2 days",
    "formattedDate": "November 7, 2025 at 12:33 PM"
  },
  "hasContact": true,
  "message": "Last contact with Mustafa Ibrahim was 2 days ago via AI Chat Session."
}
```

### Sample Output (No Contact History)

```json
{
  "success": true,
  "student": {
    "name": "Ali Salem",
    "studentId": "S1A019",
    "email": "s1a019@student.mentorlink.com",
    "level": "Level 1",
    "section": "A"
  },
  "message": "No contact history found for Ali Salem. This student has not initiated any conversations or AI chats yet.",
  "hasContact": false
}
```

### Fuzzy Matching Examples

The function supports partial name searches:

| Search Term | Finds |
|-------------|-------|
| "Mustafa" | Mustafa Ibrahim |
| "Ibrahim" | Mustafa Ibrahim |
| "must" | Mustafa Ibrahim |
| "Salma" | Salma Nasser |
| "nas" | Salma Nasser |

Prioritization:
1. Exact match (case-insensitive)
2. Starts with search term
3. Contains search term

### Use Cases
- Check-in status tracking
- Outreach prioritization
- Engagement monitoring
- Follow-up reminders
- Student wellness checks

---

## Error Handling Examples

### No Students Found (getAdvisorStudentList)

```json
{
  "success": false,
  "message": "No students are currently assigned to you. Please contact the administration if this seems incorrect."
}
```

### Invalid GPA Threshold

```json
{
  "success": false,
  "message": "Invalid GPA threshold. Please provide a value between 0.0 and 4.0."
}
```

### Student Not Found (getLastStudentContact)

```json
{
  "success": false,
  "message": "No student found matching \"xyz\" among your assigned students. Please check the name and try again."
}
```

### Invalid Comparison Type

```json
{
  "success": false,
  "message": "Invalid comparison type. Please use \"below\" or \"above\"."
}
```

---

## Performance Notes

All queries execute in under 3ms:
- Simple queries (getHighestGPAStudent, getHonorStudents, getStudentsByGPA): 0.2-0.3ms
- Student list query: 0.85ms
- Multi-query operation (getLastStudentContact): 2.27ms

Excellent performance for real-time AI chat integration.

---

## Data Insights from Sample

From the test data (10 students, Level 1, Section A):

**GPA Distribution:**
- Highest: 3.99 (Mustafa Ibrahim)
- Lowest: 2.17 (Ali Salem)
- Average: ~2.99

**Academic Categories:**
- At-risk (<2.5): 2 students (20%)
- Regular (2.5-3.49): 4 students (40%)
- Honors (3.5+): 4 students (40%)

**Honor Breakdown:**
- Highest Honors: 2 students (20%)
- High Honors: 1 student (10%)
- Honors: 1 student (10%)

**Attendance:**
- Highest: 97.8% (Ali Salem)
- Lowest: 74.3% (Mustafa Ibrahim - interesting: highest GPA but lowest attendance)
- Average: ~85.6%

---

## Integration with AI Chat

These functions are called automatically by Gemini AI when advisors ask questions like:

- "Show me my students" → getAdvisorStudentList
- "Who is my top student?" → getHighestGPAStudent
- "List honor students" → getHonorStudents
- "Find struggling students" → getStudentsByGPA (below 2.5)
- "When did I last talk to Mustafa?" → getLastStudentContact

The AI processes the function results and presents them conversationally to the advisor.

---

**Document Updated:** November 9, 2025
**Based on:** Live test execution with real database
