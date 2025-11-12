import { Request, Response } from 'express';
import { db } from '../config/database';
import { callGLMAPI, FunctionHandlerMap } from '../utils/glm';
import OpenAI from 'openai';

// ============================================
// IMPORT STUDENT FUNCTIONS (Phase 1)
// ============================================
import {
  getCourseSchedule,
  getCourseScheduleDeclaration,
  getAdvisorContactInfo,
  getAdvisorContactInfoDeclaration,
  getStudentAdvisorInfo,
  getStudentAdvisorInfoDeclaration,
  searchFacilities,
  searchFacilitiesDeclaration,
  getStaffContact,
  getStaffContactDeclaration
} from '../functions/student';

// ============================================
// IMPORT ADVISOR FUNCTIONS (Phase 2)
// ============================================
import {
  getAdvisorStudentList,
  getAdvisorStudentListDeclaration,
  getHighestGPAStudent,
  getHighestGPAStudentDeclaration,
  getHonorStudents,
  getHonorStudentsDeclaration,
  getStudentsByGPA,
  getStudentsByGPADeclaration,
  getLastStudentContact,
  getLastStudentContactDeclaration
} from '../functions/advisor';

// ============================================
// IMPORT ANALYTICS FUNCTIONS (Phase 3.2)
// ============================================
import {
  getStudentGPATrend,
  getStudentGPATrendDeclaration,
  getAttendanceTrend,
  getAttendanceTrendDeclaration,
  getStudentPerformanceComparison,
  getStudentPerformanceComparisonDeclaration,
  identifyAtRiskStudents,
  identifyAtRiskStudentsDeclaration,
  getPredictiveStudentSuccess,
  getPredictiveStudentSuccessDeclaration
} from '../functions/analytics';

// ============================================
// IMPORT ALERT FUNCTIONS (Phase 3.4)
// ============================================
import {
  getAdvisorAlerts,
  getAdvisorAlertsDeclaration,
  createAutomatedAlert,
  createAutomatedAlertDeclaration,
  dismissAlert,
  dismissAlertDeclaration
} from '../functions/alerts';

// ============================================
// IMPORT COURSE INTELLIGENCE FUNCTIONS (Phase 3.3 / Sprint 2)
// ============================================
import {
  getCourseRecommendations,
  getCourseRecommendationsDeclaration,
  checkCourseEligibility,
  checkCourseEligibilityDeclaration,
  getGraduationPathway,
  getGraduationPathwayDeclaration,
  getCourseDifficultyPrediction,
  getCourseDifficultyPredictionDeclaration
} from '../functions/courses';

// ============================================
// FUNCTION DECLARATIONS FOR GLM-4.6 AI
// ============================================

// STUDENT FUNCTION DECLARATIONS (Phase 1) - 5 functions
const studentFunctionDeclarations: OpenAI.Chat.ChatCompletionTool[] = [
  getCourseScheduleDeclaration,
  getAdvisorContactInfoDeclaration,
  getStudentAdvisorInfoDeclaration,
  searchFacilitiesDeclaration,
  getStaffContactDeclaration
];

// ADVISOR FUNCTION DECLARATIONS (Phase 2) - 5 functions
const advisorFunctionDeclarations: OpenAI.Chat.ChatCompletionTool[] = [
  getAdvisorStudentListDeclaration,
  getHighestGPAStudentDeclaration,
  getHonorStudentsDeclaration,
  getStudentsByGPADeclaration,
  getLastStudentContactDeclaration
];

// ANALYTICS FUNCTION DECLARATIONS (Phase 3.2) - 5 functions
const analyticsFunctionDeclarations: OpenAI.Chat.ChatCompletionTool[] = [
  getStudentGPATrendDeclaration,
  getAttendanceTrendDeclaration,
  getStudentPerformanceComparisonDeclaration,
  identifyAtRiskStudentsDeclaration,
  getPredictiveStudentSuccessDeclaration
];

// ALERT FUNCTION DECLARATIONS (Phase 3.4) - 3 functions
const alertFunctionDeclarations: OpenAI.Chat.ChatCompletionTool[] = [
  getAdvisorAlertsDeclaration,
  createAutomatedAlertDeclaration,
  dismissAlertDeclaration
];

// COURSE INTELLIGENCE FUNCTION DECLARATIONS (Phase 3.3 / Sprint 2) - 4 functions
const courseFunctionDeclarations: OpenAI.Chat.ChatCompletionTool[] = [
  getCourseRecommendationsDeclaration,
  checkCourseEligibilityDeclaration,
  getGraduationPathwayDeclaration,
  getCourseDifficultyPredictionDeclaration
];

// ============================================
// FUNCTION HANDLER REGISTRY
// ============================================
const functionHandlers: FunctionHandlerMap = {
  // Phase 1: Student functions (5 functions)
  getCourseSchedule,
  getAdvisorContactInfo,
  getStudentAdvisorInfo,
  searchFacilities,
  getStaffContact,
  // Phase 2: Advisor functions (5 functions)
  getAdvisorStudentList,
  getHighestGPAStudent,
  getHonorStudents,
  getStudentsByGPA,
  getLastStudentContact,
  // Phase 3.2: Analytics functions (5 functions)
  getStudentGPATrend,
  getAttendanceTrend,
  getStudentPerformanceComparison,
  identifyAtRiskStudents,
  getPredictiveStudentSuccess,
  // Phase 3.4: Alert functions (3 functions)
  getAdvisorAlerts,
  createAutomatedAlert,
  dismissAlert,
  // Phase 3.3: Course intelligence functions (4 functions)
  getCourseRecommendations,
  checkCourseEligibility,
  getGraduationPathway,
  getCourseDifficultyPrediction
};

// ============================================
// CHAT ENDPOINT
// ============================================

export async function chatWithAI(req: Request, res: Response) {
  try {
    const { message, chatHistory = [], selectedStudentId } = req.body;
    const userId = req.user?.userId;
    const userType = req.user?.userType; // 'student' | 'advisor' | 'admin'

    console.log(`[chatWithAI] User ID: ${userId}, User Type: ${userType}`);
    if (selectedStudentId) {
      console.log(`[chatWithAI] Selected Student ID: ${selectedStudentId}`);
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get all FAQs (used by both students and advisors)
    const faqs = db.prepare(
      'SELECT question, answer, category FROM faqs ORDER BY category'
    ).all() as any[];

    let context: any = {};
    let userContext: any = {};
    let availableFunctions: OpenAI.Chat.ChatCompletionTool[] = [];
    let advisorName = 'your academic advisor';

    // ============================================
    // ADVISOR CONTEXT (Phase 2)
    // ============================================
    if (userType === 'advisor') {
      console.log('[chatWithAI] Detected ADVISOR user');

      // Get advisor data
      const advisorData = db.prepare(`
        SELECT
          a.id as advisor_id,
          a.level_id,
          a.specialization,
          u.full_name,
          u.email,
          l.level_name,
          l.level_number
        FROM advisors a
        JOIN users u ON a.user_id = u.id
        JOIN levels l ON a.level_id = l.id
        WHERE a.user_id = ?
      `).get(userId) as any;

      if (!advisorData) {
        return res.status(404).json({ error: 'Advisor profile not found' });
      }

      // Get advisor's student count
      const studentCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM advisor_assignments
        WHERE advisor_id = ?
      `).get(advisorData.advisor_id) as any;

      // Context for function execution (advisor context)
      context = {
        advisorId: advisorData.advisor_id,
        userId: userId,
        userType: 'advisor',
        advisorData: advisorData
      };

      // CROSS-CONTEXT: Advisors get ALL functions (student + advisor + analytics + alerts + courses)
      availableFunctions = [
        ...studentFunctionDeclarations,
        ...advisorFunctionDeclarations,
        ...analyticsFunctionDeclarations,
        ...alertFunctionDeclarations,
        ...courseFunctionDeclarations
      ];

      // ============================================
      // ADVISOR WITH SELECTED STUDENT
      // ============================================
      if (selectedStudentId) {
        console.log(`[chatWithAI] Advisor selected student ID: ${selectedStudentId}`);

        // Get the selected student's data
        const selectedStudent = db.prepare(`
          SELECT
            s.*,
            u.full_name,
            l.level_name,
            sec.section_name
          FROM students s
          JOIN users u ON s.user_id = u.id
          JOIN levels l ON s.level_id = l.id
          JOIN sections sec ON s.section_id = sec.id
          WHERE s.id = ?
        `).get(selectedStudentId) as any;

        if (!selectedStudent) {
          return res.status(404).json({ error: 'Selected student not found' });
        }

        // Get selected student's courses
        const studentCourses = db.prepare(
          'SELECT course_name FROM student_courses WHERE student_id = ?'
        ).all(selectedStudent.id) as any[];

        const courseNames = studentCourses.map((c: any) => c.course_name);

        // Build student context for LLM (advisor is asking about this student)
        userContext = {
          studentId: selectedStudent.student_id,
          fullName: selectedStudent.full_name,
          levelName: selectedStudent.level_name,
          sectionName: selectedStudent.section_name,
          gpa: selectedStudent.gpa?.toString() || 'N/A',
          attendance: selectedStudent.attendance_percentage?.toString() || 'N/A',
          courses: courseNames
        };

        // Set advisor name to indicate this is advisor-to-student context
        advisorName = `${advisorData.full_name} (advisor)`;

        console.log(`[chatWithAI] Context: Advisor ${advisorData.full_name} asking about student ${selectedStudent.full_name}`);
        console.log(`[chatWithAI] Student has ${courseNames.length} courses`);
        console.log(`[chatWithAI] Available functions: ${availableFunctions.length} (all functions)`);

      // ============================================
      // ADVISOR WITHOUT SELECTED STUDENT (General queries)
      // ============================================
      } else {
        // No student selected - use advisor context
        userContext = {
          advisorId: advisorData.advisor_id,
          fullName: advisorData.full_name,
          email: advisorData.email,
          levelName: advisorData.level_name,
          levelNumber: advisorData.level_number,
          specialization: advisorData.specialization || 'General',
          studentCount: studentCount?.count || 0
        };

        console.log(`[chatWithAI] Advisor ${advisorData.full_name} has ${studentCount?.count || 0} students`);
        console.log(`[chatWithAI] Available functions: ${availableFunctions.length} (student + advisor)`);
      }

    // ============================================
    // STUDENT CONTEXT (Phase 1)
    // ============================================
    } else if (userType === 'student') {
      console.log('[chatWithAI] Detected STUDENT user');

      // Get student data
      const studentData = db.prepare(
        `SELECT
          s.*,
          u.full_name,
          l.level_name,
          sec.section_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN levels l ON s.level_id = l.id
        JOIN sections sec ON s.section_id = sec.id
        WHERE s.user_id = ?`
      ).get(userId) as any;

      if (!studentData) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Get enrolled courses
      const courses = db.prepare(
        'SELECT course_name FROM student_courses WHERE student_id = ?'
      ).all(studentData.id) as any[];

      const courseNames = courses.map((c: any) => c.course_name);

      // Get advisor
      const assignment = db.prepare(
        `SELECT
          a.id,
          u.full_name as advisor_name
        FROM advisor_assignments aa
        JOIN advisors a ON aa.advisor_id = a.id
        JOIN users u ON a.user_id = u.id
        WHERE aa.student_id = ?`
      ).get(studentData.id) as any;

      advisorName = assignment ? assignment.advisor_name : 'your academic advisor';

      // Context for student
      context = {
        studentId: studentData.id,
        userId: userId,
        userType: 'student',
        studentData: studentData
      };

      userContext = {
        studentId: studentData.student_id,
        fullName: studentData.full_name,
        levelName: studentData.level_name,
        sectionName: studentData.section_name,
        gpa: studentData.gpa?.toString() || 'N/A',
        attendance: studentData.attendance_percentage?.toString() || 'N/A',
        courses: courseNames
      };

      // Students get student functions + course intelligence functions
      availableFunctions = [
        ...studentFunctionDeclarations,
        ...courseFunctionDeclarations
      ];

      console.log(`[chatWithAI] Student ${studentData.full_name} with ${courses.length} courses`);
      console.log(`[chatWithAI] Available functions: ${availableFunctions.length} (student only)`);

    // ============================================
    // ADMIN OR UNKNOWN USER TYPE
    // ============================================
    } else {
      console.log(`[chatWithAI] Unsupported user type: ${userType}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'AI chat is only available for students and advisors.'
      });
    }

    // Call GLM-4.6 API with function calling support
    const aiResponse = await callGLMAPI(
      message,
      userContext,
      faqs,
      advisorName,
      chatHistory,
      availableFunctions,
      functionHandlers,
      context
    );

    // Save to AI chat history (only for students)
    if (userType === 'student' && context.studentId) {
      db.prepare(
        'INSERT INTO ai_chat_history (student_id, user_message, ai_response) VALUES (?, ?, ?)'
      ).run(context.studentId, message, aiResponse);
    }

    return res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      userType: userType
    });
  } catch (error: any) {
    console.error('[chatWithAI] Error:', error);
    return res.status(500).json({
      error: 'Failed to get AI response',
      message: error.message || 'Please try again or contact support'
    });
  }
}

export async function getAIChatHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    const student = db.prepare(
      'SELECT id FROM students WHERE user_id = ?'
    ).get(userId) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const history = db.prepare(
      'SELECT * FROM ai_chat_history WHERE student_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(student.id) as any[];

    return res.json(history);
  } catch (error) {
    console.error('Get AI chat history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
