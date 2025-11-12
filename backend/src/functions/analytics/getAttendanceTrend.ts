import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Analytics Function: Get Attendance Trend
 * Analyzes attendance patterns over time to identify trends and risks
 */
export async function getAttendanceTrend(args: any, context: any): Promise<any> {
  const { studentName, months = 6 } = args;
  const { advisorId } = context;

  console.log(`[getAttendanceTrend] Analyzing attendance trend for student: "${studentName}" (${months} months)`);

  try {
    // Find student by fuzzy name match
    const student = db.prepare(`
      SELECT
        s.id as student_id,
        s.student_id as student_number,
        u.full_name,
        u.email,
        l.level_name,
        sec.section_name,
        s.attendance as current_attendance
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE aa.advisor_id = ? AND LOWER(u.full_name) LIKE LOWER(?)
      ORDER BY
        CASE
          WHEN LOWER(u.full_name) = LOWER(?) THEN 1
          WHEN LOWER(u.full_name) LIKE LOWER(?) THEN 2
          ELSE 3
        END
      LIMIT 1
    `).get(advisorId, `%${studentName}%`, studentName, `${studentName}%`) as any;

    if (!student) {
      return {
        success: false,
        message: `No student found matching "${studentName}" among your assigned students. Please check the name and try again.`
      };
    }

    // Get attendance history
    const attendanceHistory = db.prepare(`
      SELECT month, attendance_percentage, total_days, days_present, days_absent, recorded_at
      FROM student_attendance_history
      WHERE student_id = ?
      ORDER BY recorded_at DESC
      LIMIT ?
    `).all(student.student_id, months) as any[];

    if (attendanceHistory.length === 0) {
      return {
        success: false,
        message: `No historical attendance data found for ${student.full_name}. Historical tracking may not be available for this student yet.`
      };
    }

    // Reverse to chronological order
    attendanceHistory.reverse();

    // Calculate trend
    const firstAttendance = parseFloat(attendanceHistory[0].attendance_percentage);
    const lastAttendance = parseFloat(attendanceHistory[attendanceHistory.length - 1].attendance_percentage);
    const attendanceChange = lastAttendance - firstAttendance;
    const avgChangePerMonth = attendanceHistory.length > 1 ? attendanceChange / (attendanceHistory.length - 1) : 0;

    // Determine trend type
    let trendType: string;
    let trendDescription: string;

    if (avgChangePerMonth > 3) {
      trendType = 'improving';
      trendDescription = 'Strong improvement in attendance - positive trend';
    } else if (avgChangePerMonth > 1) {
      trendType = 'slightly_improving';
      trendDescription = 'Moderate improvement in attendance';
    } else if (avgChangePerMonth < -3) {
      trendType = 'declining';
      trendDescription = 'Declining attendance - intervention needed';
    } else if (avgChangePerMonth < -1) {
      trendType = 'slightly_declining';
      trendDescription = 'Slight decline in attendance - monitor closely';
    } else {
      trendType = 'stable';
      trendDescription = 'Stable attendance pattern';
    }

    // Determine risk level based on current attendance
    let riskLevel: string;
    let riskDescription: string;

    if (lastAttendance < 60) {
      riskLevel = 'high';
      riskDescription = 'CRITICAL: Attendance below 60% - immediate intervention required';
    } else if (lastAttendance < 70) {
      riskLevel = 'medium';
      riskDescription = 'WARNING: Attendance below 70% - at-risk student';
    } else if (lastAttendance < 80) {
      riskLevel = 'low';
      riskDescription = 'CAUTION: Attendance below 80% - monitor situation';
    } else {
      riskLevel = 'none';
      riskDescription = 'Good attendance - no immediate concerns';
    }

    // Calculate statistics
    const allAttendance = attendanceHistory.map(h => parseFloat(h.attendance_percentage));
    const avgAttendance = allAttendance.reduce((sum, att) => sum + att, 0) / allAttendance.length;
    const maxAttendance = Math.max(...allAttendance);
    const minAttendance = Math.min(...allAttendance);
    const attendanceRange = maxAttendance - minAttendance;

    // Calculate total days statistics
    const totalDaysSum = attendanceHistory.reduce((sum, h) => sum + h.total_days, 0);
    const totalDaysPresentSum = attendanceHistory.reduce((sum, h) => sum + h.days_present, 0);
    const totalDaysAbsentSum = attendanceHistory.reduce((sum, h) => sum + h.days_absent, 0);

    // Generate insights
    const insights: string[] = [];

    if (trendType === 'declining' || trendType === 'slightly_declining') {
      insights.push(`${student.full_name}'s attendance has dropped by ${Math.abs(attendanceChange).toFixed(1)}% over ${attendanceHistory.length} months.`);
      insights.push(`Average decline: ${Math.abs(avgChangePerMonth).toFixed(2)}% per month.`);

      if (riskLevel === 'high' || riskLevel === 'medium') {
        insights.push('URGENT: Schedule immediate meeting to discuss attendance issues and identify barriers.');
        insights.push('Consider: personal issues, transportation, health problems, course difficulty, or lack of engagement.');
      }
    } else if (trendType === 'improving' || trendType === 'slightly_improving') {
      insights.push(`${student.full_name}'s attendance has improved by ${attendanceChange.toFixed(1)}% over ${attendanceHistory.length} months.`);
      insights.push(`Average improvement: ${avgChangePerMonth.toFixed(2)}% per month.`);
      insights.push('Positive trend - acknowledge improvement and encourage continued attendance.');
    } else {
      insights.push(`${student.full_name} has maintained consistent attendance around ${avgAttendance.toFixed(1)}% over ${attendanceHistory.length} months.`);
    }

    if (attendanceRange > 20) {
      insights.push(`High variability in attendance (range: ${attendanceRange.toFixed(1)}%) - investigate patterns and causes.`);
    }

    // Check for concerning patterns
    const recentMonths = attendanceHistory.slice(-3);
    const recentAvg = recentMonths.reduce((sum, h) => sum + parseFloat(h.attendance_percentage), 0) / recentMonths.length;

    if (recentAvg < 70 && attendanceHistory.length >= 3) {
      insights.push(`⚠️ Recent 3-month average (${recentAvg.toFixed(1)}%) is concerning - immediate action recommended.`);
    }

    if (lastAttendance < 65) {
      insights.push('⚠️ CRITICAL: Current attendance may impact academic standing and course completion.');
    }

    return {
      success: true,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        email: student.email,
        level: student.level_name,
        section: student.section_name,
        currentAttendance: parseFloat(student.current_attendance).toFixed(1) + '%'
      },
      trend: {
        type: trendType,
        description: trendDescription,
        totalChange: parseFloat(attendanceChange.toFixed(1)),
        avgChangePerMonth: parseFloat(avgChangePerMonth.toFixed(2)),
        monthsAnalyzed: attendanceHistory.length
      },
      risk: {
        level: riskLevel,
        description: riskDescription,
        currentAttendance: parseFloat(lastAttendance.toFixed(1))
      },
      statistics: {
        currentAttendance: parseFloat(lastAttendance.toFixed(1)),
        averageAttendance: parseFloat(avgAttendance.toFixed(1)),
        highestAttendance: parseFloat(maxAttendance.toFixed(1)),
        lowestAttendance: parseFloat(minAttendance.toFixed(1)),
        attendanceRange: parseFloat(attendanceRange.toFixed(1)),
        totalDaysTracked: totalDaysSum,
        totalDaysPresent: totalDaysPresentSum,
        totalDaysAbsent: totalDaysAbsentSum
      },
      history: attendanceHistory.map(h => ({
        month: h.month,
        attendancePercentage: parseFloat(h.attendance_percentage).toFixed(1),
        totalDays: h.total_days,
        daysPresent: h.days_present,
        daysAbsent: h.days_absent,
        date: h.recorded_at
      })),
      insights: insights,
      message: `Analyzed ${attendanceHistory.length} months of attendance data for ${student.full_name}. Trend: ${trendType}, Risk level: ${riskLevel}.`
    };
  } catch (error: any) {
    console.error('[getAttendanceTrend] Error:', error);
    return {
      success: false,
      message: 'An error occurred while analyzing attendance trend. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getAttendanceTrendDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getAttendanceTrend',
    description: 'Analyze a student\'s attendance patterns over time to identify trends (improving, declining, stable) and assess risk level. Returns historical attendance data, trend analysis, risk assessment, statistics, and actionable insights for intervention.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student to analyze (e.g., "John Smith" or "Smith"). Fuzzy matching supported.'
        },
        months: {
          type: 'number',
          description: 'Number of past months to analyze (default: 6). Maximum recommended: 12 months.'
        }
      },
      required: ['studentName']
    }
  }
};
