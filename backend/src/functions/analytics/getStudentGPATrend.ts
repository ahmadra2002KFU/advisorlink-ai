import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Analytics Function: Get Student GPA Trend
 * Analyzes GPA progression over time to identify trends
 */
export async function getStudentGPATrend(args: any, context: any): Promise<any> {
  const { studentName, semesters = 6 } = args;
  const { advisorId } = context;

  console.log(`[getStudentGPATrend] Analyzing GPA trend for student: "${studentName}" (${semesters} semesters)`);

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
        s.gpa as current_gpa
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

    // Get GPA history
    const gpaHistory = db.prepare(`
      SELECT semester, gpa, recorded_at
      FROM student_gpa_history
      WHERE student_id = ?
      ORDER BY recorded_at DESC
      LIMIT ?
    `).all(student.student_id, semesters) as any[];

    if (gpaHistory.length === 0) {
      return {
        success: false,
        message: `No historical GPA data found for ${student.full_name}. Historical tracking may not be available for this student yet.`
      };
    }

    // Reverse to chronological order
    gpaHistory.reverse();

    // Calculate trend
    const firstGPA = parseFloat(gpaHistory[0].gpa);
    const lastGPA = parseFloat(gpaHistory[gpaHistory.length - 1].gpa);
    const gpaChange = lastGPA - firstGPA;
    const avgChangePerSemester = gpaHistory.length > 1 ? gpaChange / (gpaHistory.length - 1) : 0;

    // Determine trend type
    let trendType: string;
    let trendDescription: string;

    if (avgChangePerSemester > 0.05) {
      trendType = 'improving';
      trendDescription = 'Strong upward trend - student is making consistent progress';
    } else if (avgChangePerSemester > 0.02) {
      trendType = 'slightly_improving';
      trendDescription = 'Moderate improvement - student showing positive growth';
    } else if (avgChangePerSemester < -0.05) {
      trendType = 'declining';
      trendDescription = 'Declining trend - immediate intervention recommended';
    } else if (avgChangePerSemester < -0.02) {
      trendType = 'slightly_declining';
      trendDescription = 'Slight decline - monitor closely and provide support';
    } else {
      trendType = 'stable';
      trendDescription = 'Stable performance - maintaining consistent GPA';
    }

    // Predict next semester GPA (simple linear projection)
    const predictedNextGPA = Math.max(0.0, Math.min(4.0, lastGPA + avgChangePerSemester));

    // Calculate statistics
    const allGPAs = gpaHistory.map(h => parseFloat(h.gpa));
    const avgGPA = allGPAs.reduce((sum, gpa) => sum + gpa, 0) / allGPAs.length;
    const maxGPA = Math.max(...allGPAs);
    const minGPA = Math.min(...allGPAs);
    const gpaRange = maxGPA - minGPA;

    // Generate insights
    const insights: string[] = [];

    if (trendType === 'improving' || trendType === 'slightly_improving') {
      insights.push(`${student.full_name} has improved their GPA by ${gpaChange.toFixed(2)} points over ${gpaHistory.length} semesters.`);
      insights.push(`Average improvement per semester: ${avgChangePerSemester.toFixed(3)} points.`);
      insights.push('Positive momentum - encourage continued effort and recognize achievements.');
    } else if (trendType === 'declining' || trendType === 'slightly_declining') {
      insights.push(`${student.full_name}'s GPA has dropped by ${Math.abs(gpaChange).toFixed(2)} points over ${gpaHistory.length} semesters.`);
      insights.push(`Average decline per semester: ${Math.abs(avgChangePerSemester).toFixed(3)} points.`);
      insights.push('Intervention needed - schedule meeting to identify challenges and create support plan.');

      if (lastGPA < 2.0) {
        insights.push('⚠️ CRITICAL: Current GPA below 2.0 - academic probation risk.');
      } else if (lastGPA < 2.5) {
        insights.push('⚠️ WARNING: Current GPA below 2.5 - at-risk status.');
      }
    } else {
      insights.push(`${student.full_name} has maintained a stable GPA around ${avgGPA.toFixed(2)} over ${gpaHistory.length} semesters.`);
      insights.push('Consistency is good - consider strategies to help student reach higher potential.');
    }

    if (gpaRange > 0.5) {
      insights.push(`High GPA variability (range: ${gpaRange.toFixed(2)}) - investigate factors causing fluctuations.`);
    }

    return {
      success: true,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        email: student.email,
        level: student.level_name,
        section: student.section_name,
        currentGPA: parseFloat(student.current_gpa).toFixed(2)
      },
      trend: {
        type: trendType,
        description: trendDescription,
        totalChange: parseFloat(gpaChange.toFixed(2)),
        avgChangePerSemester: parseFloat(avgChangePerSemester.toFixed(3)),
        semestersAnalyzed: gpaHistory.length
      },
      statistics: {
        currentGPA: parseFloat(lastGPA.toFixed(2)),
        averageGPA: parseFloat(avgGPA.toFixed(2)),
        highestGPA: parseFloat(maxGPA.toFixed(2)),
        lowestGPA: parseFloat(minGPA.toFixed(2)),
        gpaRange: parseFloat(gpaRange.toFixed(2))
      },
      prediction: {
        nextSemesterGPA: parseFloat(predictedNextGPA.toFixed(2)),
        confidence: gpaHistory.length >= 4 ? 'medium' : 'low',
        note: 'Prediction based on linear trend projection'
      },
      history: gpaHistory.map(h => ({
        semester: h.semester,
        gpa: parseFloat(h.gpa).toFixed(2),
        date: h.recorded_at
      })),
      insights: insights,
      message: `Analyzed ${gpaHistory.length} semesters of GPA data for ${student.full_name}. Trend: ${trendType}.`
    };
  } catch (error: any) {
    console.error('[getStudentGPATrend] Error:', error);
    return {
      success: false,
      message: 'An error occurred while analyzing GPA trend. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getStudentGPATrendDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getStudentGPATrend',
    description: 'Analyze a student\'s GPA progression over time to identify trends (improving, declining, stable). Returns historical GPA data, trend analysis, statistics, predictions, and actionable insights for advisors.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student to analyze (e.g., "John Smith" or "Smith"). Fuzzy matching supported.'
        },
        semesters: {
          type: 'number',
          description: 'Number of past semesters to analyze (default: 6). Maximum recommended: 8 semesters.'
        }
      },
      required: ['studentName']
    }
  }
};
