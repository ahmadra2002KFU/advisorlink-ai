# 🚀 PHASE 3 - Advanced Analytics & Intelligence Features

**Status:** 📋 **PLANNING STAGE**
**Prerequisites:** Phase 1 ✅ Complete | Phase 2 ✅ Complete
**Estimated Duration:** 3-4 weeks with parallel subagents
**Target Features:** 15-20 new AI functions + Analytics Dashboard + Automation

---

## 🎯 Phase 3 Objectives

Build an **intelligent analytics and automation layer** that provides:
1. **Predictive insights** for student success
2. **Automated interventions** for at-risk students
3. **Performance trend analysis** over time
4. **Bulk operations** for advisors
5. **Admin intelligence** for system-wide insights
6. **Course recommendation engine**
7. **Automated reporting**

---

## 📊 Current State (Phases 1 & 2 Complete)

### ✅ What We Have:
- **10 AI Functions** (5 student + 5 advisor)
- **Real-time database queries** via function calling
- **Cross-context access** (advisors can use all functions)
- **331 seeded users** with full academic data
- **1,508 course enrollments** with grades and attendance
- **Performance:** Sub-millisecond queries (0.17-1.11ms)

### 🎯 What Phase 3 Adds:
- **15+ new AI functions** for analytics and automation
- **Time-series analysis** (track changes over semesters)
- **Predictive models** (identify at-risk students early)
- **Automated alerts** (email/SMS notifications)
- **Bulk operations** (mass actions on student groups)
- **Visual analytics** (charts, graphs, dashboards)
- **Export capabilities** (CSV, PDF reports)

---

## 🗂️ Phase 3 Sub-Phases

### Phase 3.1: Database Schema Enhancements
### Phase 3.2: Student Performance Trends (5 functions)
### Phase 3.3: Course Recommendation Engine (4 functions)
### Phase 3.4: Automated Alerts & Notifications (3 functions)
### Phase 3.5: Admin Intelligence Functions (6 functions)
### Phase 3.6: Bulk Operations & Reporting (4 functions)
### Phase 3.7: Visual Analytics Dashboard
### Phase 3.8: Testing & Documentation

---

## 📋 Phase 3.1: Database Schema Enhancements

### New Tables to Create:

#### 1. **student_gpa_history**
Track GPA changes over time for trend analysis.

```sql
CREATE TABLE student_gpa_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  gpa REAL NOT NULL,
  semester TEXT NOT NULL,           -- 'Fall 2024', 'Spring 2025', etc.
  recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX idx_gpa_history_student ON student_gpa_history(student_id);
CREATE INDEX idx_gpa_history_semester ON student_gpa_history(semester);
```

#### 2. **student_attendance_history**
Track attendance changes over time.

```sql
CREATE TABLE student_attendance_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  attendance_percentage REAL NOT NULL,
  month TEXT NOT NULL,              -- 'January 2025', 'February 2025', etc.
  recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX idx_attendance_history_student ON student_attendance_history(student_id);
CREATE INDEX idx_attendance_history_month ON student_attendance_history(month);
```

#### 3. **advisor_alerts**
Store automated alerts for advisors.

```sql
CREATE TABLE advisor_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  advisor_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  alert_type TEXT NOT NULL,         -- 'gpa_drop', 'low_attendance', 'no_contact', etc.
  severity TEXT NOT NULL,           -- 'low', 'medium', 'high', 'critical'
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  is_dismissed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  read_at TEXT,
  dismissed_at TEXT,
  FOREIGN KEY (advisor_id) REFERENCES advisors(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX idx_alerts_advisor ON advisor_alerts(advisor_id);
CREATE INDEX idx_alerts_student ON advisor_alerts(student_id);
CREATE INDEX idx_alerts_type ON advisor_alerts(alert_type);
CREATE INDEX idx_alerts_unread ON advisor_alerts(is_read, advisor_id);
```

#### 4. **course_prerequisites**
Track course prerequisites for recommendations.

```sql
CREATE TABLE course_prerequisites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_code TEXT NOT NULL,
  prerequisite_code TEXT NOT NULL,
  minimum_grade TEXT,               -- 'C+', 'B', etc.
  is_strict INTEGER DEFAULT 1,      -- 1 = required, 0 = recommended
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_code, prerequisite_code)
);

CREATE INDEX idx_prereq_course ON course_prerequisites(course_code);
CREATE INDEX idx_prereq_prerequisite ON course_prerequisites(prerequisite_code);
```

#### 5. **course_catalog**
Full course catalog for recommendations.

```sql
CREATE TABLE course_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_code TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  department TEXT NOT NULL,
  level INTEGER NOT NULL,           -- 1-5
  credit_hours INTEGER NOT NULL,
  description TEXT,
  instructor_name TEXT,
  instructor_email TEXT,
  max_enrollment INTEGER,
  current_enrollment INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  semester_offered TEXT,            -- 'Fall', 'Spring', 'Both', 'Summer'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_catalog_code ON course_catalog(course_code);
CREATE INDEX idx_catalog_level ON course_catalog(level);
CREATE INDEX idx_catalog_department ON course_catalog(department);
CREATE INDEX idx_catalog_active ON course_catalog(is_active);
```

#### 6. **student_course_recommendations**
Store AI-generated course recommendations.

```sql
CREATE TABLE student_course_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_code TEXT NOT NULL,
  recommendation_reason TEXT,
  confidence_score REAL,            -- 0.0 to 1.0
  semester TEXT NOT NULL,           -- Target semester
  is_viewed INTEGER DEFAULT 0,
  is_enrolled INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_code) REFERENCES course_catalog(course_code)
);

CREATE INDEX idx_recommendations_student ON student_course_recommendations(student_id);
CREATE INDEX idx_recommendations_viewed ON student_course_recommendations(is_viewed, student_id);
```

#### 7. **system_reports**
Store generated reports.

```sql
CREATE TABLE system_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_type TEXT NOT NULL,        -- 'gpa_trends', 'at_risk_students', 'honor_roll', etc.
  generated_by INTEGER NOT NULL,    -- user_id
  report_data TEXT NOT NULL,        -- JSON
  file_path TEXT,                   -- If exported to file
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_by) REFERENCES users(id)
);

CREATE INDEX idx_reports_type ON system_reports(report_type);
CREATE INDEX idx_reports_generated_by ON system_reports(generated_by);
```

### Database Migration Timeline:
- **Day 1:** Create migration files
- **Day 2:** Seed sample historical data (3-6 months of GPA/attendance history)
- **Day 3:** Populate course catalog and prerequisites

---

## 🎓 Phase 3.2: Student Performance Trends Functions

**Goal:** Track and analyze student performance over time.

### Function 1: `getStudentGPATrend`

**Purpose:** Get GPA history and calculate trend (improving/declining/stable)

**Parameters:**
- `studentName` (optional) - Search by name, defaults to current student
- `semesters` (optional) - Number of semesters to analyze, default: 4

**Returns:**
```typescript
{
  success: true,
  student: "Mustafa Ibrahim",
  currentGPA: 3.99,
  history: [
    { semester: "Fall 2024", gpa: 3.95, change: null },
    { semester: "Spring 2024", gpa: 3.87, change: +0.08 },
    { semester: "Fall 2023", gpa: 3.82, change: +0.05 },
    { semester: "Spring 2023", gpa: 3.75, change: +0.07 }
  ],
  trend: "improving",              // 'improving', 'declining', 'stable'
  averageChange: +0.067,
  prediction: 4.0,                 // Predicted next semester GPA
  summary: "GPA has improved by 0.24 points over 4 semesters"
}
```

**SQL Query:**
```sql
SELECT
  gh.semester,
  gh.gpa,
  LAG(gh.gpa) OVER (ORDER BY gh.recorded_at) as previous_gpa
FROM student_gpa_history gh
JOIN students s ON gh.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE s.id = ?
ORDER BY gh.recorded_at DESC
LIMIT ?
```

### Function 2: `getAttendanceTrend`

**Purpose:** Track attendance changes over time

**Parameters:**
- `studentName` (optional) - Search by name
- `months` (optional) - Number of months to analyze, default: 6

**Returns:**
```typescript
{
  success: true,
  student: "Ahmed Al-Rashid",
  currentAttendance: 74.3,
  history: [
    { month: "November 2024", attendance: 74.3, change: -2.1 },
    { month: "October 2024", attendance: 76.4, change: -3.5 },
    { month: "September 2024", attendance: 79.9, change: +1.2 }
  ],
  trend: "declining",
  averageChange: -1.47,
  alert: "Attendance declining for 2 consecutive months",
  riskLevel: "medium"
}
```

### Function 3: `getStudentPerformanceComparison`

**Purpose:** Compare student to level/section averages

**Parameters:**
- `comparisonType` - 'level' | 'section' | 'department'
- `metric` - 'gpa' | 'attendance' | 'both'

**Returns:**
```typescript
{
  success: true,
  student: {
    name: "Mustafa Ibrahim",
    gpa: 3.99,
    attendance: 74.3
  },
  comparison: {
    levelAverage: 2.85,
    sectionAverage: 2.92,
    departmentAverage: 2.78
  },
  ranking: {
    inLevel: "1 of 60 students",
    inSection: "1 of 20 students",
    percentile: "100th percentile"
  },
  summary: "Mustafa ranks #1 in Level 1 with a GPA 1.14 points above average"
}
```

### Function 4: `identifyAtRiskStudents`

**Purpose:** Proactively identify students who need intervention

**Parameters:**
- `criteria` (optional) - 'gpa' | 'attendance' | 'both' | 'trend'
- `riskLevel` (optional) - 'all' | 'high' | 'medium' | 'low'

**Returns:**
```typescript
{
  success: true,
  totalAtRisk: 15,
  byRiskLevel: {
    high: 5,      // GPA < 2.0 OR attendance < 60%
    medium: 6,    // GPA 2.0-2.5 OR attendance 60-70%
    low: 4        // Declining trend
  },
  students: [
    {
      name: "Layla Al-Mansoori",
      studentId: "S1A002",
      gpa: 2.17,
      attendance: 78.5,
      riskFactors: ["Low GPA", "GPA declining for 2 semesters"],
      riskLevel: "high",
      recommendation: "Immediate advisor intervention recommended"
    }
  ]
}
```

### Function 5: `getPredictiveStudentSuccess`

**Purpose:** Use simple predictive model to forecast student outcomes

**Parameters:**
- `studentName` (optional) - Defaults to current student
- `forecastSemesters` (optional) - Number of semesters ahead, default: 2

**Returns:**
```typescript
{
  success: true,
  student: "Omar Al-Nasser",
  currentGPA: 3.52,
  currentAttendance: 82.1,
  prediction: {
    nextSemesterGPA: 3.58,
    probabilityOfHonors: 0.85,
    graduationGPA: 3.65,
    riskOfProbation: 0.02,
    confidenceScore: 0.78
  },
  factors: {
    positive: ["Consistent GPA improvement", "Above-average attendance"],
    negative: ["No major concerns"],
    recommendations: ["Continue current trajectory", "Consider honor thesis"]
  }
}
```

---

## 📚 Phase 3.3: Course Recommendation Engine Functions

**Goal:** AI-powered course suggestions based on prerequisites, interests, and performance.

### Function 6: `getCourseRecommendations`

**Purpose:** Recommend courses for next semester

**Parameters:**
- `semester` - Target semester ('Fall 2025', 'Spring 2025')
- `preferences` (optional) - 'easy_A' | 'challenging' | 'interest' | 'graduation_path'
- `maxCourses` (optional) - Max recommendations, default: 5

**Returns:**
```typescript
{
  success: true,
  student: "Aisha Al-Sabah",
  targetSemester: "Fall 2025",
  recommendations: [
    {
      courseCode: "CS301",
      courseName: "Advanced Algorithms",
      reason: "Prerequisite completed (CS201 with A), strong GPA in CS courses",
      difficulty: "high",
      expectedGrade: "A-",
      confidenceScore: 0.89,
      instructor: "Dr. Mohammed Al-Thani",
      availableSeats: 15
    },
    {
      courseCode: "MATH205",
      courseName: "Linear Algebra",
      reason: "Required for CS major, complements algorithm study",
      difficulty: "medium",
      expectedGrade: "B+",
      confidenceScore: 0.82,
      instructor: "Dr. Fatima Al-Rashid",
      availableSeats: 25
    }
  ],
  prerequisitesCheck: {
    completed: ["CS101", "CS201", "MATH101"],
    missing: [],
    recommended: ["MATH205 before CS401"]
  }
}
```

**SQL Query:**
```sql
-- Find courses student is eligible for
SELECT
  cc.course_code,
  cc.course_name,
  cc.credit_hours,
  cc.instructor_name,
  cc.max_enrollment - cc.current_enrollment as available_seats
FROM course_catalog cc
LEFT JOIN course_prerequisites cp ON cc.course_code = cp.course_code
LEFT JOIN student_courses sc ON cp.prerequisite_code = sc.course_code
  AND sc.student_id = ?
WHERE cc.level = ?
  AND cc.is_active = 1
  AND cc.semester_offered IN (?, 'Both')
  AND NOT EXISTS (
    SELECT 1 FROM student_courses
    WHERE student_id = ? AND course_code = cc.course_code
  )
GROUP BY cc.course_code
HAVING COUNT(cp.prerequisite_code) = COUNT(sc.course_code)
LIMIT ?
```

### Function 7: `checkCourseEligibility`

**Purpose:** Check if student meets prerequisites for a specific course

**Parameters:**
- `courseCode` - Course to check
- `studentName` (optional) - Defaults to current student

**Returns:**
```typescript
{
  success: true,
  course: "CS401 - Machine Learning",
  isEligible: false,
  prerequisites: {
    required: [
      { code: "CS301", name: "Advanced Algorithms", completed: true, grade: "A" },
      { code: "MATH205", name: "Linear Algebra", completed: false, grade: null },
      { code: "STAT201", name: "Statistics", completed: true, grade: "B+" }
    ],
    recommended: [
      { code: "CS350", name: "Data Structures", completed: true, grade: "A-" }
    ]
  },
  missingPrerequisites: ["MATH205"],
  canTakeConcurrently: ["MATH205"],
  recommendation: "Complete MATH205 this semester, then enroll in CS401 next semester"
}
```

### Function 8: `getGraduationPathway`

**Purpose:** Show courses needed to graduate

**Parameters:**
- `major` (optional) - Defaults to student's major
- `targetGraduation` (optional) - 'May 2025', 'December 2025', etc.

**Returns:**
```typescript
{
  success: true,
  student: "Hassan Al-Khalil",
  major: "Computer Science",
  currentProgress: {
    completedCredits: 90,
    requiredCredits: 120,
    percentComplete: 75
  },
  remainingCourses: {
    required: [
      { code: "CS401", name: "Machine Learning", credits: 3, semester: "Fall 2025" },
      { code: "CS450", name: "Senior Project", credits: 6, semester: "Spring 2026" }
    ],
    electives: [
      { code: "Any CS 300+", credits: 9, semester: "Fall 2025 - Spring 2026" }
    ]
  },
  semesterPlan: [
    {
      semester: "Fall 2025",
      courses: ["CS401", "CS420", "MATH301"],
      totalCredits: 9,
      feasible: true
    },
    {
      semester: "Spring 2026",
      courses: ["CS450", "CS Elective", "Gen Ed"],
      totalCredits: 12,
      feasible: true
    }
  ],
  estimatedGraduation: "May 2026",
  onTrack: true
}
```

### Function 9: `getCourseDifficultyPrediction`

**Purpose:** Predict how difficult a course will be for a specific student

**Parameters:**
- `courseCode` - Course to analyze
- `studentName` (optional) - Defaults to current student

**Returns:**
```typescript
{
  success: true,
  course: "CS401 - Machine Learning",
  student: "Mustafa Ibrahim",
  difficultyPrediction: {
    difficulty: "medium",
    expectedGrade: "A-",
    expectedWorkload: "15 hours/week",
    successProbability: 0.92,
    confidenceScore: 0.85
  },
  reasoning: {
    strengths: [
      "Strong performance in prerequisite CS301 (Grade: A)",
      "High GPA in math courses (3.95 average)",
      "Good attendance record (91.2%)"
    ],
    challenges: [
      "Heavy programming workload",
      "Instructor known for difficult exams"
    ]
  },
  historicalData: {
    averageGrade: "B+",
    passRate: 87.5,
    dropRate: 5.2
  },
  recommendation: "Highly recommended - strong fit based on your background"
}
```

---

## 🚨 Phase 3.4: Automated Alerts & Notifications Functions

**Goal:** Proactive notifications for advisors and students.

### Function 10: `getAdvisorAlerts`

**Purpose:** Get unread alerts for advisor

**Parameters:**
- `severity` (optional) - 'all' | 'critical' | 'high' | 'medium' | 'low'
- `includeRead` (optional) - Boolean, default: false

**Returns:**
```typescript
{
  success: true,
  advisor: "Hamza Abdullah",
  unreadCount: 8,
  alerts: [
    {
      id: 1,
      student: "Layla Al-Mansoori",
      type: "gpa_drop",
      severity: "high",
      message: "GPA dropped from 2.45 to 2.17 (-0.28 points) this semester",
      recommendation: "Schedule intervention meeting",
      createdAt: "2025-11-08 14:23:00",
      isRead: false
    },
    {
      id: 2,
      student: "Hassan Al-Khalil",
      type: "low_attendance",
      severity: "medium",
      message: "Attendance below 75% threshold (currently 71.2%)",
      recommendation: "Send attendance reminder",
      createdAt: "2025-11-07 09:15:00",
      isRead: false
    },
    {
      id: 3,
      student: "Ahmed Al-Rashid",
      type: "no_contact",
      severity: "low",
      message: "No contact with advisor for 30 days",
      recommendation: "Send check-in message",
      createdAt: "2025-11-06 10:00:00",
      isRead: false
    }
  ],
  summary: {
    critical: 0,
    high: 3,
    medium: 3,
    low: 2
  }
}
```

**SQL Query:**
```sql
SELECT
  aa.id,
  aa.alert_type,
  aa.severity,
  aa.message,
  aa.created_at,
  u.full_name as student_name,
  s.student_id
FROM advisor_alerts aa
JOIN students s ON aa.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE aa.advisor_id = ?
  AND aa.is_dismissed = 0
  AND (? = 1 OR aa.is_read = 0)
  AND (? = 'all' OR aa.severity = ?)
ORDER BY
  CASE aa.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  aa.created_at DESC
```

### Function 11: `createAutomatedAlert`

**Purpose:** Generate alert based on student data (called by system cron job)

**Parameters:**
- `studentId` - Student to analyze
- `checkTypes` - Array of checks to perform

**Returns:**
```typescript
{
  success: true,
  alertsCreated: 2,
  alerts: [
    {
      type: "gpa_drop",
      severity: "high",
      message: "GPA dropped below 2.5 threshold"
    },
    {
      type: "attendance_warning",
      severity: "medium",
      message: "Attendance declining for 2 consecutive months"
    }
  ]
}
```

**Alert Generation Logic:**
```typescript
// Pseudo-code for alert generation
function generateAlerts(student) {
  const alerts = [];

  // Check 1: GPA Drop
  if (student.currentGPA < 2.5 && student.previousGPA >= 2.5) {
    alerts.push({
      type: 'gpa_drop',
      severity: 'high',
      message: `GPA dropped below 2.5 threshold (now ${student.currentGPA})`
    });
  }

  // Check 2: Low Attendance
  if (student.attendance < 75) {
    alerts.push({
      type: 'low_attendance',
      severity: student.attendance < 60 ? 'critical' : 'medium',
      message: `Attendance below threshold: ${student.attendance}%`
    });
  }

  // Check 3: No Contact
  const daysSinceContact = getDaysSinceLastContact(student);
  if (daysSinceContact > 30) {
    alerts.push({
      type: 'no_contact',
      severity: daysSinceContact > 60 ? 'medium' : 'low',
      message: `No contact with advisor for ${daysSinceContact} days`
    });
  }

  // Check 4: Declining Trend
  if (student.gpaTrend === 'declining' && student.trendMonths >= 2) {
    alerts.push({
      type: 'declining_performance',
      severity: 'medium',
      message: 'GPA declining for 2+ consecutive semesters'
    });
  }

  return alerts;
}
```

### Function 12: `dismissAlert`

**Purpose:** Mark alert as dismissed

**Parameters:**
- `alertId` - Alert to dismiss
- `dismissReason` (optional) - Why dismissed

**Returns:**
```typescript
{
  success: true,
  alertId: 5,
  dismissedAt: "2025-11-09 16:30:00"
}
```

---

## 📊 Phase 3.5: Admin Intelligence Functions

**Goal:** System-wide analytics for admins.

### Function 13: `getSystemWideStatistics`

**Purpose:** Comprehensive system statistics

**Parameters:**
- `timeRange` (optional) - 'week' | 'month' | 'semester' | 'year'
- `includeHistorical` (optional) - Boolean, default: false

**Returns:**
```typescript
{
  success: true,
  timeRange: "current_semester",
  users: {
    total: 331,
    admins: 1,
    advisors: 30,
    students: 300,
    activeThisWeek: 245
  },
  academic: {
    averageGPA: 2.85,
    honorStudents: 45,
    atRiskStudents: 23,
    onProbation: 8
  },
  engagement: {
    conversations: 50,
    messagesExchanged: 234,
    aiChatSessions: 156,
    averageResponseTime: "2.5 hours"
  },
  courses: {
    totalEnrollments: 1508,
    averageLoadPerStudent: 5.03,
    mostPopular: "Introduction to Computer Science (CS101)",
    highestGradeAverage: "English Literature (ENG201) - 3.45"
  },
  trends: {
    gpaChange: +0.05,          // Compared to last semester
    attendanceChange: -2.3,    // Percentage points
    alertsGenerated: 45,
    interventionsCompleted: 32
  }
}
```

### Function 14: `getDepartmentPerformance`

**Purpose:** Compare performance across departments

**Parameters:**
- `metric` - 'gpa' | 'enrollment' | 'completion_rate' | 'satisfaction'
- `sortBy` (optional) - 'best' | 'worst' | 'alphabetical'

**Returns:**
```typescript
{
  success: true,
  metric: "gpa",
  departments: [
    {
      department: "Computer Science",
      averageGPA: 3.12,
      studentCount: 120,
      honorStudents: 18,
      atRiskStudents: 8,
      ranking: 1
    },
    {
      department: "Mathematics",
      averageGPA: 2.98,
      studentCount: 80,
      honorStudents: 12,
      atRiskStudents: 6,
      ranking: 2
    }
  ]
}
```

### Function 15: `getAdvisorPerformance`

**Purpose:** Evaluate advisor effectiveness

**Parameters:**
- `advisorId` (optional) - Specific advisor, default: all
- `metrics` - Array of metrics to include

**Returns:**
```typescript
{
  success: true,
  advisors: [
    {
      name: "Hamza Abdullah",
      assignedStudents: 10,
      averageStudentGPA: 2.92,
      studentsImproved: 6,
      studentsDeclined: 2,
      responseTime: "1.2 hours",
      messagesPerStudent: 8.5,
      satisfactionScore: 4.3,
      alertsHandled: 15,
      interventionSuccessRate: 85.7,
      ranking: 3
    }
  ]
}
```

### Function 16: `getEnrollmentTrends`

**Purpose:** Analyze enrollment patterns over time

**Parameters:**
- `timeRange` - 'semester' | 'year' | '5years'
- `groupBy` - 'level' | 'department' | 'course'

**Returns:**
```typescript
{
  success: true,
  timeRange: "5years",
  trend: "increasing",
  totalEnrollmentChange: "+12.5%",
  data: [
    { period: "Fall 2020", enrollment: 1200, change: null },
    { period: "Spring 2021", enrollment: 1250, change: +4.2 },
    { period: "Fall 2021", enrollment: 1280, change: +2.4 },
    { period: "Spring 2022", enrollment: 1305, change: +2.0 }
  ],
  predictions: {
    nextSemester: 1380,
    nextYear: 1420,
    confidence: 0.82
  }
}
```

### Function 17: `getCourseSuccessRates`

**Purpose:** Identify courses with high/low success rates

**Parameters:**
- `sortBy` - 'success_rate' | 'failure_rate' | 'drop_rate'
- `limit` (optional) - Number of courses, default: 10

**Returns:**
```typescript
{
  success: true,
  sortBy: "failure_rate",
  courses: [
    {
      courseCode: "MATH301",
      courseName: "Advanced Calculus",
      successRate: 62.5,       // % with C or better
      failureRate: 22.8,       // % with D or F
      dropRate: 14.7,          // % who dropped
      averageGrade: "C+",
      enrollmentCount: 80,
      instructor: "Dr. Ahmed Al-Thani",
      recommendation: "High failure rate - consider support workshops"
    }
  ]
}
```

### Function 18: `getRetentionAnalysis`

**Purpose:** Analyze student retention rates

**Parameters:**
- `cohort` - 'Fall 2020', 'Spring 2021', etc.
- `includeReasons` - Boolean, default: false

**Returns:**
```typescript
{
  success: true,
  cohort: "Fall 2023",
  originalCount: 75,
  currentCount: 68,
  retentionRate: 90.7,
  breakdown: {
    graduated: 0,
    stillEnrolled: 68,
    transferred: 4,
    dropped: 3,
    unknown: 0
  },
  atRiskInCohort: 8,
  comparisonToAverage: "+5.2% better than historical average"
}
```

---

## 🎯 Phase 3.6: Bulk Operations & Reporting Functions

**Goal:** Mass actions and export capabilities.

### Function 19: `sendBulkMessage`

**Purpose:** Send message to multiple students

**Parameters:**
- `recipientFilter` - { type: 'honor_students' | 'at_risk' | 'all' | 'custom', criteria: {...} }
- `message` - Message text
- `dryRun` (optional) - Boolean, default: false (just show who would receive)

**Returns:**
```typescript
{
  success: true,
  dryRun: false,
  recipientCount: 15,
  recipients: [
    { name: "Mustafa Ibrahim", studentId: "S1A001", reason: "Honor student (GPA: 3.99)" },
    { name: "Tariq Al-Sabah", studentId: "S1A011", reason: "Honor student (GPA: 3.93)" }
  ],
  messagesSent: 15,
  messagesFailed: 0,
  estimatedDeliveryTime: "5 minutes"
}
```

### Function 20: `generateStudentReport`

**Purpose:** Generate comprehensive student report

**Parameters:**
- `studentName` - Student to report on
- `sections` - Array of sections to include
- `format` - 'summary' | 'detailed' | 'export'

**Returns:**
```typescript
{
  success: true,
  student: "Mustafa Ibrahim",
  reportGenerated: "2025-11-09 17:00:00",
  sections: {
    personalInfo: {
      studentId: "S1A001",
      email: "s1a001@student.mentorlink.com",
      level: 1,
      section: "A",
      advisor: "Hamza Abdullah"
    },
    academic: {
      currentGPA: 3.99,
      ranking: "1 of 300",
      honors: "Highest Honors (Summa Cum Laude)",
      completedCredits: 90,
      enrolledCourses: 5
    },
    attendance: {
      current: 74.3,
      trend: "stable",
      compareTo Average: "-12.5% below level average"
    },
    engagement: {
      lastAdvisorContact: "3 days ago",
      aiChatSessions: 12,
      advisorMeetings: 4
    },
    predictions: {
      nextSemesterGPA: 3.99,
      graduationGPA: 3.97,
      successProbability: 0.98
    }
  },
  downloadUrl: "/api/reports/student-123456.pdf"
}
```

### Function 21: `exportStudentList`

**Purpose:** Export filtered student list to CSV/Excel

**Parameters:**
- `filter` - Filter criteria
- `fields` - Array of fields to include
- `format` - 'csv' | 'excel' | 'json'

**Returns:**
```typescript
{
  success: true,
  totalStudents: 300,
  filteredStudents: 45,
  format: "csv",
  fields: ["name", "studentId", "gpa", "level", "advisor"],
  fileSize: "12.5 KB",
  downloadUrl: "/api/exports/students-honor-2025-11-09.csv",
  expiresAt: "2025-11-10 17:00:00"
}
```

### Function 22: `scheduleAutomatedReport`

**Purpose:** Set up recurring reports

**Parameters:**
- `reportType` - Report to generate
- `schedule` - Cron expression or 'daily' | 'weekly' | 'monthly'
- `recipients` - Array of email addresses

**Returns:**
```typescript
{
  success: true,
  reportScheduled: {
    id: 5,
    type: "at_risk_students_weekly",
    schedule: "Every Monday at 9:00 AM",
    recipients: ["hamza.abdullah@mentorlink.com", "admin@mentorlink.com"],
    nextRun: "2025-11-11 09:00:00",
    format: "PDF"
  }
}
```

---

## 📈 Phase 3.7: Visual Analytics Dashboard

### New Frontend Components:

#### 1. **Performance Trends Chart**
- Line chart showing GPA/attendance over time
- Multiple students comparison
- Zoom/pan capabilities

#### 2. **Student Distribution Dashboard**
- Pie chart: Honor students vs At-risk vs Average
- Bar chart: Students by level
- Heatmap: Performance by section

#### 3. **Advisor Effectiveness Dashboard**
- Advisor comparison table
- Response time metrics
- Intervention success rates

#### 4. **Predictive Insights Panel**
- "Students Likely to Drop" list
- "Potential Honor Students" list
- Early warning indicators

#### 5. **Alert Dashboard**
- Real-time alert stream
- Alert severity distribution
- Quick action buttons

### Technology Stack:
- **Charts:** Recharts or Chart.js
- **Tables:** TanStack Table
- **Real-time:** WebSockets (upgrade from polling)
- **Export:** jsPDF, xlsx libraries

---

## 🧪 Phase 3.8: Testing & Documentation

### Testing Strategy:

#### 1. **Unit Tests** (Jest)
```typescript
// Example test
describe('getStudentGPATrend', () => {
  it('should calculate trend correctly', async () => {
    const result = await getStudentGPATrend({ semesters: 4 });
    expect(result.success).toBe(true);
    expect(result.trend).toBeOneOf(['improving', 'declining', 'stable']);
    expect(result.history).toHaveLength(4);
  });
});
```

#### 2. **Integration Tests** (Supertest)
- Test all 22 new functions
- Test function calling from Gemini
- Test database queries

#### 3. **Performance Tests**
- Benchmark query execution times
- Test with 1000+ students
- Stress test alert generation

#### 4. **E2E Tests** (Playwright)
- Test analytics dashboard
- Test bulk operations
- Test report generation

### Documentation to Create:

1. **PHASE_3_IMPLEMENTATION_REPORT.md** - Technical implementation details
2. **PHASE_3_FUNCTION_REFERENCE.md** - All 22 functions documented
3. **ANALYTICS_DASHBOARD_GUIDE.md** - Dashboard usage guide
4. **AUTOMATED_ALERTS_SETUP.md** - Configure alert system
5. **BULK_OPERATIONS_GUIDE.md** - How to use bulk features
6. **PHASE_3_TEST_REPORT.md** - Test results
7. **PHASE_3_API_REFERENCE.md** - API documentation

---

## 📅 Implementation Timeline

### Week 1: Database & Foundation
- **Day 1-2:** Create 7 new database tables
- **Day 3-4:** Seed historical data (GPA/attendance history)
- **Day 5:** Populate course catalog and prerequisites

### Week 2: Performance Trends (Phase 3.2)
- **Day 6-7:** Implement 5 performance trend functions
- **Day 8:** Test functions
- **Day 9:** Create unit tests
- **Day 10:** Documentation

### Week 3: Course Recommendations & Alerts (Phase 3.3-3.4)
- **Day 11-12:** Implement 4 course recommendation functions
- **Day 13-14:** Implement 3 alert functions
- **Day 15:** Test and integrate with frontend

### Week 4: Admin Functions & Bulk Operations (Phase 3.5-3.6)
- **Day 16-17:** Implement 6 admin intelligence functions
- **Day 18-19:** Implement 4 bulk operation functions
- **Day 20:** Integration testing

### Week 5: Visual Dashboard & Final Testing (Phase 3.7-3.8)
- **Day 21-23:** Build analytics dashboard components
- **Day 24-25:** E2E testing
- **Day 26:** Performance optimization
- **Day 27-28:** Documentation and deployment

**Total Time:** ~5 weeks (35 days) with focused development

---

## 🎯 Success Criteria

### Phase 3 will be considered complete when:

1. ✅ All 22 new AI functions implemented and tested
2. ✅ 7 new database tables created and seeded
3. ✅ Historical data populated (6+ months of GPA/attendance)
4. ✅ Alert system generating notifications
5. ✅ Analytics dashboard functional
6. ✅ Bulk operations working (messaging, exports)
7. ✅ Report generation and scheduling working
8. ✅ 100% test coverage on new functions
9. ✅ Performance benchmarks met (<100ms per function)
10. ✅ Complete documentation created

---

## 🔢 Phase 3 Statistics (Projected)

| Metric | Value |
|--------|-------|
| **New AI Functions** | 22 |
| **Total AI Functions** | 32 (10 existing + 22 new) |
| **New Database Tables** | 7 |
| **Total Database Tables** | 20 (13 existing + 7 new) |
| **New API Endpoints** | 15+ |
| **Lines of Code (estimated)** | 5,000+ |
| **Test Cases** | 100+ |
| **Documentation Pages** | 10+ |
| **Development Time** | 5 weeks |

---

## 💡 Phase 3 Value Proposition

### For Students:
- 🎯 **Personalized course recommendations**
- 📊 **Performance trend visibility**
- ⚠️ **Early warning of academic issues**
- 🎓 **Clear graduation pathway**

### For Advisors:
- 🚨 **Proactive alerts for at-risk students**
- 📈 **Data-driven intervention strategies**
- 💬 **Bulk communication tools**
- 📊 **Student comparison analytics**

### For Admins:
- 🏢 **System-wide insights**
- 📊 **Department performance tracking**
- 👥 **Advisor effectiveness metrics**
- 📈 **Enrollment trend analysis**

---

## 🚀 Getting Started with Phase 3

### Prerequisites:
- ✅ Phase 1 Complete (5 student functions)
- ✅ Phase 2 Complete (5 advisor functions)
- ✅ Database with 331 seeded users
- ✅ Working Gemini AI integration

### First Steps:
1. **Review this plan** - Ensure all stakeholders understand scope
2. **Prioritize features** - Decide which sub-phases to implement first
3. **Set up development environment** - Install testing libraries
4. **Create database migrations** - Start with Phase 3.1
5. **Use parallel subagents** - Speed up development

---

## ❓ Questions to Answer Before Starting

1. **Priority:** Which Phase 3 features are most valuable?
   - Performance trends?
   - Course recommendations?
   - Automated alerts?
   - Admin analytics?

2. **Timeline:** Is 5 weeks acceptable or do we need faster?
   - Can use more parallel subagents to speed up

3. **Scope:** Should we implement all 22 functions or start with subset?
   - Could do Phase 3.2 and 3.4 first (trends + alerts)
   - Add others in Phase 4

4. **Infrastructure:** Do we need to add services?
   - Email service (SendGrid, AWS SES)?
   - SMS service (Twilio)?
   - Cron job scheduler?
   - Redis for caching?

---

## 📞 Next Actions

**What would you like to do?**

1. ✅ **Start Phase 3 Implementation** - Begin with Phase 3.1 (database schema)
2. 📋 **Refine the Plan** - Adjust priorities or scope
3. 🎯 **Prioritize Sub-phases** - Choose which features to build first
4. 📊 **Create Mockups** - Design analytics dashboard UI
5. 🧪 **Test Current System** - Complete Phase 2 testing before starting Phase 3

---

**Phase 3 Plan Status:** ✅ **COMPLETE AND READY FOR APPROVAL**

**Waiting for your decision on next steps!** 🚀

---

*Plan created: 2025-11-09 by Claude Code*
*Phase 1 & 2: Complete | Phase 3: Planning Stage*
