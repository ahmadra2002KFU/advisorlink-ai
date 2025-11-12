import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Analytics Function: Identify At-Risk Students
 * Identifies students who are at risk based on GPA, attendance, and trend analysis
 */
export async function identifyAtRiskStudents(args: any, context: any): Promise<any> {
  const { riskLevel = 'all', limit = 20 } = args;
  const { advisorId } = context;

  console.log(`[identifyAtRiskStudents] Identifying at-risk students for advisor ${advisorId}, risk level: ${riskLevel}`);

  try {
    // Get all students assigned to this advisor
    const students = db.prepare(`
      SELECT
        s.id as student_id,
        s.student_id as student_number,
        u.full_name,
        u.email,
        s.gpa,
        s.attendance,
        l.level_name,
        sec.section_name,
        d.department_name
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      JOIN departments d ON s.department_id = d.id
      WHERE aa.advisor_id = ?
      ORDER BY s.gpa ASC, s.attendance ASC
    `).all(advisorId) as any[];

    if (students.length === 0) {
      return {
        success: false,
        message: 'No students assigned to you. Please contact administration.'
      };
    }

    // Analyze each student and determine risk level
    const atRiskStudents: any[] = [];

    for (const student of students) {
      const gpa = parseFloat(student.gpa);
      const attendance = parseFloat(student.attendance);

      // Get GPA trend (last 3 semesters)
      const gpaHistory = db.prepare(`
        SELECT semester, gpa, recorded_at
        FROM student_gpa_history
        WHERE student_id = ?
        ORDER BY recorded_at DESC
        LIMIT 3
      `).all(student.student_id) as any[];

      let gpaTrend = 'stable';
      let gpaChange = 0;

      if (gpaHistory.length >= 2) {
        gpaHistory.reverse();
        const firstGPA = parseFloat(gpaHistory[0].gpa);
        const lastGPA = parseFloat(gpaHistory[gpaHistory.length - 1].gpa);
        gpaChange = lastGPA - firstGPA;
        const avgChangePerSemester = gpaChange / (gpaHistory.length - 1);

        if (avgChangePerSemester < -0.05) {
          gpaTrend = 'declining';
        } else if (avgChangePerSemester > 0.05) {
          gpaTrend = 'improving';
        }
      }

      // Get attendance trend (last 3 months)
      const attendanceHistory = db.prepare(`
        SELECT month, attendance_percentage, recorded_at
        FROM student_attendance_history
        WHERE student_id = ?
        ORDER BY recorded_at DESC
        LIMIT 3
      `).all(student.student_id) as any[];

      let attendanceTrend = 'stable';
      let attendanceChange = 0;

      if (attendanceHistory.length >= 2) {
        attendanceHistory.reverse();
        const firstAttendance = parseFloat(attendanceHistory[0].attendance_percentage);
        const lastAttendance = parseFloat(attendanceHistory[attendanceHistory.length - 1].attendance_percentage);
        attendanceChange = lastAttendance - firstAttendance;
        const avgChangePerMonth = attendanceChange / (attendanceHistory.length - 1);

        if (avgChangePerMonth < -3) {
          attendanceTrend = 'declining';
        } else if (avgChangePerMonth > 3) {
          attendanceTrend = 'improving';
        }
      }

      // Determine risk level based on multiple factors
      let studentRiskLevel = 'none';
      const riskFactors: string[] = [];
      const recommendations: string[] = [];
      let riskScore = 0;

      // GPA-based risk (weight: 40 points)
      if (gpa < 2.0) {
        riskScore += 40;
        riskFactors.push('Critical GPA (below 2.0) - academic probation risk');
        recommendations.push('URGENT: Schedule immediate academic intervention meeting');
        recommendations.push('Develop academic improvement plan with specific goals');
      } else if (gpa < 2.5) {
        riskScore += 30;
        riskFactors.push('Low GPA (below 2.5) - at-risk status');
        recommendations.push('Schedule meeting to discuss academic challenges');
        recommendations.push('Consider tutoring or study skills workshop');
      } else if (gpa < 3.0) {
        riskScore += 15;
        riskFactors.push('Below average GPA (below 3.0)');
        recommendations.push('Encourage participation in study groups');
      }

      // Attendance-based risk (weight: 30 points)
      if (attendance < 60) {
        riskScore += 30;
        riskFactors.push('Critical attendance (below 60%) - course completion at risk');
        recommendations.push('URGENT: Meet to identify attendance barriers');
        recommendations.push('Discuss transportation, health, or personal issues');
      } else if (attendance < 70) {
        riskScore += 20;
        riskFactors.push('Low attendance (below 70%)');
        recommendations.push('Address attendance issues promptly');
        recommendations.push('Identify and remove barriers to attendance');
      } else if (attendance < 80) {
        riskScore += 10;
        riskFactors.push('Below optimal attendance (below 80%)');
        recommendations.push('Monitor attendance patterns');
      }

      // Trend-based risk (weight: 30 points)
      if (gpaTrend === 'declining') {
        riskScore += 15;
        riskFactors.push(`Declining GPA trend (${gpaChange.toFixed(2)} change over ${gpaHistory.length} semesters)`);
        recommendations.push('Investigate causes of academic decline');
      }

      if (attendanceTrend === 'declining') {
        riskScore += 15;
        riskFactors.push(`Declining attendance trend (${attendanceChange.toFixed(1)}% change over ${attendanceHistory.length} months)`);
        recommendations.push('Address attendance decline immediately');
      }

      // Get last contact date
      const lastContact = db.prepare(`
        SELECT created_at
        FROM messages
        WHERE (sender_id = ? AND receiver_id = (SELECT user_id FROM students WHERE id = ?))
           OR (sender_id = (SELECT user_id FROM students WHERE id = ?) AND receiver_id = ?)
        ORDER BY created_at DESC
        LIMIT 1
      `).get(context.userId, student.student_id, student.student_id, context.userId) as any;

      // No recent contact (weight: 10 points)
      if (!lastContact) {
        riskScore += 10;
        riskFactors.push('No communication record with advisor');
        recommendations.push('Establish initial contact and build rapport');
      } else {
        const daysSinceContact = Math.floor((Date.now() - new Date(lastContact.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceContact > 30) {
          riskScore += 5;
          riskFactors.push(`No contact in ${daysSinceContact} days`);
          recommendations.push('Schedule check-in meeting soon');
        }
      }

      // Determine overall risk level based on score
      if (riskScore >= 50) {
        studentRiskLevel = 'high';
      } else if (riskScore >= 30) {
        studentRiskLevel = 'medium';
      } else if (riskScore >= 15) {
        studentRiskLevel = 'low';
      } else {
        studentRiskLevel = 'none';
        continue; // Skip students with no risk
      }

      // Filter by requested risk level
      if (riskLevel !== 'all' && studentRiskLevel !== riskLevel) {
        continue;
      }

      // Add general recommendations based on risk level
      if (studentRiskLevel === 'high') {
        recommendations.push('⚠️ HIGH PRIORITY: Immediate intervention required');
        recommendations.push('Document all interactions and support provided');
        recommendations.push('Consider referral to counseling or support services');
      } else if (studentRiskLevel === 'medium') {
        recommendations.push('Monitor progress weekly');
        recommendations.push('Provide ongoing encouragement and resources');
      } else if (studentRiskLevel === 'low') {
        recommendations.push('Check in bi-weekly');
        recommendations.push('Proactive support to prevent escalation');
      }

      atRiskStudents.push({
        student: {
          name: student.full_name,
          studentId: student.student_number,
          email: student.email,
          level: student.level_name,
          section: student.section_name,
          department: student.department_name
        },
        metrics: {
          gpa: parseFloat(gpa.toFixed(2)),
          attendance: parseFloat(attendance.toFixed(1)),
          gpaTrend: gpaTrend,
          gpaChange: parseFloat(gpaChange.toFixed(2)),
          attendanceTrend: attendanceTrend,
          attendanceChange: parseFloat(attendanceChange.toFixed(1))
        },
        risk: {
          level: studentRiskLevel,
          score: riskScore,
          factors: riskFactors
        },
        recommendations: recommendations
      });
    }

    // Sort by risk score (highest first)
    atRiskStudents.sort((a, b) => b.risk.score - a.risk.score);

    // Apply limit
    const limitedStudents = atRiskStudents.slice(0, limit);

    // Generate summary
    const summary = {
      totalAssignedStudents: students.length,
      totalAtRiskStudents: atRiskStudents.length,
      highRisk: atRiskStudents.filter(s => s.risk.level === 'high').length,
      mediumRisk: atRiskStudents.filter(s => s.risk.level === 'medium').length,
      lowRisk: atRiskStudents.filter(s => s.risk.level === 'low').length,
      displayedStudents: limitedStudents.length
    };

    // Generate overall insights
    const insights: string[] = [];

    if (summary.highRisk > 0) {
      insights.push(`⚠️ URGENT: ${summary.highRisk} student(s) at HIGH RISK requiring immediate intervention.`);
    }

    if (summary.mediumRisk > 0) {
      insights.push(`${summary.mediumRisk} student(s) at MEDIUM RISK - proactive support recommended.`);
    }

    if (summary.lowRisk > 0) {
      insights.push(`${summary.lowRisk} student(s) at LOW RISK - monitor regularly.`);
    }

    if (summary.totalAtRiskStudents === 0) {
      insights.push('✅ No at-risk students identified among your assigned students.');
      insights.push('Continue regular monitoring and proactive engagement.');
    } else {
      const atRiskPercentage = ((summary.totalAtRiskStudents / summary.totalAssignedStudents) * 100).toFixed(1);
      insights.push(`${atRiskPercentage}% of your assigned students (${summary.totalAtRiskStudents}/${summary.totalAssignedStudents}) are at risk.`);

      if (parseFloat(atRiskPercentage) > 30) {
        insights.push('Consider developing a systematic intervention plan for at-risk students.');
      }
    }

    return {
      success: true,
      summary: summary,
      atRiskStudents: limitedStudents,
      insights: insights,
      message: `Identified ${summary.totalAtRiskStudents} at-risk student(s) out of ${summary.totalAssignedStudents} assigned students. High: ${summary.highRisk}, Medium: ${summary.mediumRisk}, Low: ${summary.lowRisk}.`
    };
  } catch (error: any) {
    console.error('[identifyAtRiskStudents] Error:', error);
    return {
      success: false,
      message: 'An error occurred while identifying at-risk students. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const identifyAtRiskStudentsDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'identifyAtRiskStudents',
    description: 'Identify students who are at risk of academic failure or dropping out based on multiple factors: low GPA (< 2.5), poor attendance (< 70%), declining trends, and lack of advisor contact. Returns ranked list with risk scores, specific factors, and tailored intervention recommendations for each student.',
    parameters: {
      type: 'object',
      properties: {
        riskLevel: {
          type: 'string',
          enum: ['all', 'high', 'medium', 'low'],
          description: 'Filter by risk level: "high" (critical intervention needed), "medium" (proactive support), "low" (monitor), or "all" (default: all levels).'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of at-risk students to return (default: 20). Students are ranked by risk score.'
        }
      },
      required: []
    }
  }
};
