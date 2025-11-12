import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Analytics Function: Get Predictive Student Success
 * Predicts student's likelihood of academic success, honors, or probation
 */
export async function getPredictiveStudentSuccess(args: any, context: any): Promise<any> {
  const { studentName } = args;
  const { advisorId } = context;

  console.log(`[getPredictiveStudentSuccess] Predicting success for student: "${studentName}"`);

  try {
    // Find student by fuzzy name match
    const student = db.prepare(`
      SELECT
        s.id as student_id,
        s.student_id as student_number,
        u.full_name,
        u.email,
        s.gpa as current_gpa,
        s.attendance as current_attendance,
        l.level_name,
        l.id as level_id,
        sec.section_name,
        d.department_name
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      JOIN departments d ON s.department_id = d.id
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

    const currentGPA = parseFloat(student.current_gpa);
    const currentAttendance = parseFloat(student.current_attendance);

    // Get GPA trend (last 4 semesters for better prediction)
    const gpaHistory = db.prepare(`
      SELECT semester, gpa, recorded_at
      FROM student_gpa_history
      WHERE student_id = ?
      ORDER BY recorded_at DESC
      LIMIT 4
    `).all(student.student_id) as any[];

    // Get attendance trend (last 4 months)
    const attendanceHistory = db.prepare(`
      SELECT month, attendance_percentage, recorded_at
      FROM student_attendance_history
      WHERE student_id = ?
      ORDER BY recorded_at DESC
      LIMIT 4
    `).all(student.student_id) as any[];

    // Calculate GPA trajectory
    let gpaTrend = 0;
    let gpaVolatility = 0;
    let historicalAvgGPA = currentGPA;

    if (gpaHistory.length >= 2) {
      gpaHistory.reverse();
      const firstGPA = parseFloat(gpaHistory[0].gpa);
      const lastGPA = parseFloat(gpaHistory[gpaHistory.length - 1].gpa);
      gpaTrend = (lastGPA - firstGPA) / (gpaHistory.length - 1); // Average change per semester

      // Calculate volatility (standard deviation)
      const gpas = gpaHistory.map(h => parseFloat(h.gpa));
      historicalAvgGPA = gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length;
      const variance = gpas.reduce((sum, gpa) => sum + Math.pow(gpa - historicalAvgGPA, 2), 0) / gpas.length;
      gpaVolatility = Math.sqrt(variance);
    }

    // Calculate attendance trajectory
    let attendanceTrend = 0;
    let historicalAvgAttendance = currentAttendance;

    if (attendanceHistory.length >= 2) {
      attendanceHistory.reverse();
      const firstAttendance = parseFloat(attendanceHistory[0].attendance_percentage);
      const lastAttendance = parseFloat(attendanceHistory[attendanceHistory.length - 1].attendance_percentage);
      attendanceTrend = (lastAttendance - firstAttendance) / (attendanceHistory.length - 1);

      const attendances = attendanceHistory.map(h => parseFloat(h.attendance_percentage));
      historicalAvgAttendance = attendances.reduce((sum, att) => sum + att, 0) / attendances.length;
    }

    // Predict next semester GPA (linear projection with bounds)
    const predictedGPA = Math.max(0.0, Math.min(4.0, currentGPA + gpaTrend));

    // Calculate success probabilities using weighted factors
    // Factor weights: Current GPA (40%), GPA Trend (25%), Attendance (25%), Volatility (10%)

    // Honors Probability (GPA >= 3.5)
    let honorsProbability = 0;
    if (currentGPA >= 3.5) {
      honorsProbability = 70; // Already honors
      if (gpaTrend > 0) honorsProbability += 20; // Improving
      if (currentAttendance >= 85) honorsProbability += 10; // Good attendance
      if (gpaVolatility < 0.2) honorsProbability = Math.min(100, honorsProbability); // Stable
    } else if (currentGPA >= 3.0) {
      honorsProbability = 40; // Close to honors
      if (gpaTrend > 0.1) honorsProbability += 30; // Strong improvement
      if (currentAttendance >= 85) honorsProbability += 15; // Good attendance
      if (gpaVolatility < 0.2) honorsProbability += 10; // Stable
    } else if (currentGPA >= 2.5 && gpaTrend > 0.15) {
      honorsProbability = 20; // Possible with strong trajectory
      if (currentAttendance >= 85) honorsProbability += 10;
    } else {
      honorsProbability = 5; // Unlikely
    }

    // Academic Probation Probability (GPA < 2.0)
    let probationProbability = 0;
    if (currentGPA < 2.0) {
      probationProbability = 80; // Already at risk
      if (gpaTrend < 0) probationProbability = 95; // Declining
      if (currentAttendance < 60) probationProbability = 100; // Critical
    } else if (currentGPA < 2.5) {
      probationProbability = 40; // At-risk
      if (gpaTrend < -0.1) probationProbability += 30; // Declining
      if (currentAttendance < 70) probationProbability += 20; // Poor attendance
    } else if (currentGPA < 3.0 && gpaTrend < -0.15) {
      probationProbability = 20; // Possible if decline continues
      if (currentAttendance < 75) probationProbability += 15;
    } else {
      probationProbability = 5; // Unlikely
    }

    // Graduation On-Time Probability
    let graduationProbability = 0;
    if (currentGPA >= 3.0 && currentAttendance >= 80) {
      graduationProbability = 85;
      if (gpaTrend >= 0) graduationProbability = 95;
      if (gpaVolatility < 0.2) graduationProbability = Math.min(100, graduationProbability + 5);
    } else if (currentGPA >= 2.5 && currentAttendance >= 75) {
      graduationProbability = 70;
      if (gpaTrend >= 0) graduationProbability += 10;
    } else if (currentGPA >= 2.0 && currentAttendance >= 70) {
      graduationProbability = 50;
      if (gpaTrend > 0.05) graduationProbability += 15;
    } else {
      graduationProbability = 30;
    }

    // Course Success Probability (next semester)
    let courseSuccessProbability = 0;
    if (currentGPA >= 3.5 && currentAttendance >= 85) {
      courseSuccessProbability = 95;
    } else if (currentGPA >= 3.0 && currentAttendance >= 80) {
      courseSuccessProbability = 85;
    } else if (currentGPA >= 2.5 && currentAttendance >= 75) {
      courseSuccessProbability = 70;
    } else if (currentGPA >= 2.0 && currentAttendance >= 70) {
      courseSuccessProbability = 55;
    } else {
      courseSuccessProbability = 35;
    }

    // Adjust for trends
    if (gpaTrend > 0.05) courseSuccessProbability = Math.min(100, courseSuccessProbability + 10);
    if (gpaTrend < -0.05) courseSuccessProbability = Math.max(0, courseSuccessProbability - 15);

    // Calculate confidence score based on data availability
    let confidenceScore = 'low';
    let confidencePercentage = 50;

    if (gpaHistory.length >= 4 && attendanceHistory.length >= 4) {
      confidenceScore = 'high';
      confidencePercentage = 85;
    } else if (gpaHistory.length >= 3 || attendanceHistory.length >= 3) {
      confidenceScore = 'medium';
      confidencePercentage = 70;
    }

    // If low volatility, increase confidence
    if (gpaVolatility < 0.2) {
      confidencePercentage = Math.min(95, confidencePercentage + 10);
      if (confidenceScore === 'medium') confidenceScore = 'high';
    }

    // Generate predictions object
    const predictions = {
      honors: {
        probability: Math.min(100, honorsProbability),
        description: honorsProbability >= 70 ? 'Highly likely to achieve/maintain honors' :
                     honorsProbability >= 40 ? 'Moderate chance of achieving honors' :
                     honorsProbability >= 20 ? 'Possible with sustained improvement' :
                     'Unlikely without significant GPA improvement'
      },
      probation: {
        probability: Math.min(100, probationProbability),
        description: probationProbability >= 70 ? 'High risk - immediate intervention needed' :
                     probationProbability >= 40 ? 'Moderate risk - proactive support required' :
                     probationProbability >= 20 ? 'Low risk - monitor closely' :
                     'Minimal risk of academic probation'
      },
      graduation: {
        probability: Math.min(100, graduationProbability),
        description: graduationProbability >= 80 ? 'On track for on-time graduation' :
                     graduationProbability >= 60 ? 'Likely to graduate with continued effort' :
                     graduationProbability >= 40 ? 'At risk of delay - support needed' :
                     'Significant risk of delayed graduation'
      },
      nextSemesterSuccess: {
        probability: Math.min(100, courseSuccessProbability),
        predictedGPA: parseFloat(predictedGPA.toFixed(2)),
        description: courseSuccessProbability >= 80 ? 'Excellent prognosis for next semester' :
                     courseSuccessProbability >= 65 ? 'Good chance of success' :
                     courseSuccessProbability >= 50 ? 'Moderate success likelihood - support recommended' :
                     'At risk of struggling - intensive support needed'
      }
    };

    // Generate insights and recommendations
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Honors pathway
    if (predictions.honors.probability >= 70) {
      insights.push(`🏆 ${student.full_name} is on an honors track with ${predictions.honors.probability}% probability.`);
      recommendations.push('Encourage advanced coursework or research opportunities');
      recommendations.push('Nominate for academic awards or scholarships');
    } else if (predictions.honors.probability >= 40) {
      insights.push(`📈 ${student.full_name} has a ${predictions.honors.probability}% chance of reaching honors status.`);
      recommendations.push('Set specific GPA improvement goals (target: 3.5+)');
      recommendations.push('Recommend study strategies to boost performance');
    }

    // Probation risk
    if (predictions.probation.probability >= 70) {
      insights.push(`⚠️ CRITICAL: ${predictions.probation.probability}% risk of academic probation.`);
      recommendations.push('URGENT: Develop comprehensive academic improvement plan');
      recommendations.push('Schedule weekly check-ins to monitor progress');
      recommendations.push('Consider reduced course load next semester');
      recommendations.push('Refer to academic support services and tutoring');
    } else if (predictions.probation.probability >= 40) {
      insights.push(`⚠️ WARNING: ${predictions.probation.probability}% risk of academic probation.`);
      recommendations.push('Implement proactive intervention strategies');
      recommendations.push('Connect with peer tutoring resources');
    }

    // Trend insights
    if (gpaTrend > 0.1) {
      insights.push(`Positive trajectory: GPA improving by ${gpaTrend.toFixed(3)} points per semester.`);
      recommendations.push('Acknowledge progress and reinforce successful strategies');
    } else if (gpaTrend < -0.1) {
      insights.push(`Concerning trend: GPA declining by ${Math.abs(gpaTrend).toFixed(3)} points per semester.`);
      recommendations.push('Investigate root causes of academic decline');
      recommendations.push('Address any personal, financial, or health issues');
    }

    // Volatility insights
    if (gpaVolatility > 0.5) {
      insights.push(`High GPA volatility (${gpaVolatility.toFixed(2)}) indicates inconsistent performance.`);
      recommendations.push('Help develop consistent study habits and time management');
      recommendations.push('Identify and address factors causing performance fluctuations');
    }

    // Attendance insights
    if (attendanceTrend < -3) {
      insights.push(`Declining attendance (${Math.abs(attendanceTrend).toFixed(1)}% per month) is a red flag.`);
      recommendations.push('Address attendance barriers immediately');
    }

    // Graduation timeline
    if (predictions.graduation.probability >= 80) {
      insights.push(`✅ ${predictions.graduation.probability}% probability of on-time graduation.`);
    } else if (predictions.graduation.probability < 50) {
      insights.push(`⚠️ Only ${predictions.graduation.probability}% probability of on-time graduation.`);
      recommendations.push('Develop graduation pathway plan with milestones');
      recommendations.push('Consider summer courses to stay on track');
    }

    return {
      success: true,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        email: student.email,
        level: student.level_name,
        section: student.section_name,
        department: student.department_name
      },
      current: {
        gpa: parseFloat(currentGPA.toFixed(2)),
        attendance: parseFloat(currentAttendance.toFixed(1)),
        gpaTrend: gpaTrend > 0 ? 'improving' : gpaTrend < 0 ? 'declining' : 'stable',
        attendanceTrend: attendanceTrend > 0 ? 'improving' : attendanceTrend < 0 ? 'declining' : 'stable'
      },
      predictions: predictions,
      confidence: {
        score: confidenceScore,
        percentage: confidencePercentage,
        note: `Based on ${gpaHistory.length} semesters of GPA data and ${attendanceHistory.length} months of attendance data`
      },
      insights: insights,
      recommendations: recommendations,
      message: `Predictive analysis complete for ${student.full_name}. Confidence: ${confidenceScore} (${confidencePercentage}%). Honors probability: ${predictions.honors.probability}%, Probation risk: ${predictions.probation.probability}%.`
    };
  } catch (error: any) {
    console.error('[getPredictiveStudentSuccess] Error:', error);
    return {
      success: false,
      message: 'An error occurred while predicting student success. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getPredictiveStudentSuccessDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getPredictiveStudentSuccess',
    description: 'Predict a student\'s likelihood of achieving honors, facing academic probation, graduating on time, and succeeding next semester. Uses historical GPA trends, attendance patterns, and performance consistency to generate probability scores with confidence levels and actionable recommendations.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student to analyze (e.g., "John Smith" or "Smith"). Fuzzy matching supported.'
        }
      },
      required: ['studentName']
    }
  }
};
