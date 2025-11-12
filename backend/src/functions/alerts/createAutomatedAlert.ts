import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Alert Function: Create Automated Alert
 * Generates system alerts based on student performance triggers
 */
export async function createAutomatedAlert(args: any, context: any): Promise<any> {
  const { studentName, alertType, customMessage } = args;
  const { advisorId } = context;

  console.log(`[createAutomatedAlert] Creating alert for student: "${studentName}", type: ${alertType}`);

  try {
    // Find student by fuzzy name match
    const student = db.prepare(`
      SELECT
        s.id as student_id,
        s.student_id as student_number,
        u.full_name,
        u.email,
        s.gpa,
        s.attendance,
        l.level_name,
        sec.section_name
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

    const gpa = parseFloat(student.gpa);
    const attendance = parseFloat(student.attendance);

    // Determine alert parameters based on type
    let severity: string;
    let title: string;
    let message: string;

    switch (alertType) {
      case 'gpa_drop':
        // Check if there's actually a GPA drop
        const gpaHistory = db.prepare(`
          SELECT gpa
          FROM student_gpa_history
          WHERE student_id = ?
          ORDER BY recorded_at DESC
          LIMIT 2
        `).all(student.student_id) as any[];

        if (gpaHistory.length >= 2) {
          const currentGPA = parseFloat(gpaHistory[0].gpa);
          const previousGPA = parseFloat(gpaHistory[1].gpa);
          const drop = previousGPA - currentGPA;

          if (drop < 0.1) {
            return {
              success: false,
              message: `No significant GPA drop detected for ${student.full_name}. Current: ${currentGPA.toFixed(2)}, Previous: ${previousGPA.toFixed(2)}.`
            };
          }

          severity = drop >= 0.5 ? 'high' : drop >= 0.3 ? 'medium' : 'low';
          title = `GPA Drop Alert: ${student.full_name}`;
          message = customMessage || `${student.full_name}'s GPA has dropped by ${drop.toFixed(2)} points (from ${previousGPA.toFixed(2)} to ${currentGPA.toFixed(2)}). Immediate intervention recommended to identify causes and provide support.`;
        } else {
          return {
            success: false,
            message: `Insufficient GPA history to detect drop for ${student.full_name}.`
          };
        }
        break;

      case 'low_attendance':
        if (attendance >= 70) {
          return {
            success: false,
            message: `${student.full_name}'s attendance (${attendance.toFixed(1)}%) is not critically low. Alert not created.`
          };
        }

        severity = attendance < 60 ? 'high' : attendance < 70 ? 'medium' : 'low';
        title = `Low Attendance Alert: ${student.full_name}`;
        message = customMessage || `${student.full_name}'s attendance has fallen to ${attendance.toFixed(1)}%. This puts the student at risk of course failure. Please schedule a meeting to identify and address attendance barriers.`;
        break;

      case 'at_risk':
        // Determine if student is actually at risk
        let riskScore = 0;
        const riskFactors: string[] = [];

        if (gpa < 2.0) {
          riskScore += 40;
          riskFactors.push('GPA below 2.0 (probation risk)');
        } else if (gpa < 2.5) {
          riskScore += 30;
          riskFactors.push('GPA below 2.5');
        }

        if (attendance < 60) {
          riskScore += 30;
          riskFactors.push('Attendance below 60%');
        } else if (attendance < 70) {
          riskScore += 20;
          riskFactors.push('Attendance below 70%');
        }

        if (riskScore < 30) {
          return {
            success: false,
            message: `${student.full_name} does not meet at-risk criteria. GPA: ${gpa.toFixed(2)}, Attendance: ${attendance.toFixed(1)}%.`
          };
        }

        severity = riskScore >= 50 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
        title = `At-Risk Student Alert: ${student.full_name}`;
        message = customMessage || `${student.full_name} has been flagged as at-risk. Risk factors: ${riskFactors.join(', ')}. GPA: ${gpa.toFixed(2)}, Attendance: ${attendance.toFixed(1)}%. Develop intervention plan immediately.`;
        break;

      case 'no_contact':
        // Check last contact
        const lastContact = db.prepare(`
          SELECT created_at
          FROM messages
          WHERE (sender_id = ? AND receiver_id = (SELECT user_id FROM students WHERE id = ?))
             OR (sender_id = (SELECT user_id FROM students WHERE id = ?) AND receiver_id = ?)
          ORDER BY created_at DESC
          LIMIT 1
        `).get(context.userId, student.student_id, student.student_id, context.userId) as any;

        if (!lastContact) {
          severity = 'medium';
          title = `No Contact Established: ${student.full_name}`;
          message = customMessage || `No communication record found with ${student.full_name}. Please reach out to establish initial contact and build advisor-student relationship.`;
        } else {
          const daysSinceContact = Math.floor((Date.now() - new Date(lastContact.created_at).getTime()) / (1000 * 60 * 60 * 24));

          if (daysSinceContact < 30) {
            return {
              success: false,
              message: `Recent contact with ${student.full_name} (${daysSinceContact} days ago). Alert not necessary.`
            };
          }

          severity = daysSinceContact > 60 ? 'high' : 'medium';
          title = `Long Time No Contact: ${student.full_name}`;
          message = customMessage || `No contact with ${student.full_name} in ${daysSinceContact} days. Please schedule a check-in meeting to maintain advisor-student relationship and identify any issues.`;
        }
        break;

      case 'declining_trend':
        // Check for declining GPA trend
        const trendHistory = db.prepare(`
          SELECT gpa, semester
          FROM student_gpa_history
          WHERE student_id = ?
          ORDER BY recorded_at DESC
          LIMIT 3
        `).all(student.student_id) as any[];

        if (trendHistory.length < 3) {
          return {
            success: false,
            message: `Insufficient historical data to determine trend for ${student.full_name}.`
          };
        }

        trendHistory.reverse();
        const firstGPA = parseFloat(trendHistory[0].gpa);
        const lastGPA = parseFloat(trendHistory[trendHistory.length - 1].gpa);
        const trendChange = lastGPA - firstGPA;

        if (trendChange >= -0.1) {
          return {
            success: false,
            message: `No declining trend detected for ${student.full_name}. GPA change: ${trendChange.toFixed(2)}.`
          };
        }

        severity = trendChange <= -0.3 ? 'high' : 'medium';
        title = `Declining Performance Trend: ${student.full_name}`;
        message = customMessage || `${student.full_name}'s GPA has shown a declining trend over ${trendHistory.length} semesters (change: ${trendChange.toFixed(2)} points). From ${firstGPA.toFixed(2)} to ${lastGPA.toFixed(2)}. Investigate root causes and provide intervention.`;
        break;

      case 'academic_probation':
        if (gpa >= 2.0) {
          return {
            success: false,
            message: `${student.full_name}'s GPA (${gpa.toFixed(2)}) is above probation threshold (2.0). Alert not created.`
          };
        }

        severity = 'high';
        title = `Academic Probation Risk: ${student.full_name}`;
        message = customMessage || `URGENT: ${student.full_name}'s GPA (${gpa.toFixed(2)}) is below 2.0, placing them at risk of academic probation. Immediate intervention and academic improvement plan required.`;
        break;

      case 'honors_opportunity':
        if (gpa < 3.3) {
          return {
            success: false,
            message: `${student.full_name}'s GPA (${gpa.toFixed(2)}) does not qualify for honors consideration (3.5+ typically required).`
          };
        }

        severity = 'low';
        title = `Honors Recognition Opportunity: ${student.full_name}`;
        message = customMessage || `${student.full_name} is performing at honors level (GPA: ${gpa.toFixed(2)}). Consider nominating for academic awards, scholarships, or advanced opportunities.`;
        break;

      case 'custom':
        if (!customMessage) {
          return {
            success: false,
            message: 'Custom alert type requires customMessage parameter.'
          };
        }

        severity = 'medium';
        title = `Custom Alert: ${student.full_name}`;
        message = customMessage;
        break;

      default:
        return {
          success: false,
          message: `Invalid alert type: ${alertType}. Valid types: gpa_drop, low_attendance, at_risk, no_contact, declining_trend, academic_probation, honors_opportunity, custom.`
        };
    }

    // Check for duplicate alerts (same student, same type, created in last 7 days)
    const duplicateCheck = db.prepare(`
      SELECT id
      FROM advisor_alerts
      WHERE advisor_id = ? AND student_id = ? AND alert_type = ?
        AND created_at > datetime('now', '-7 days')
        AND is_dismissed = 0
      LIMIT 1
    `).get(advisorId, student.student_id, alertType);

    if (duplicateCheck) {
      return {
        success: false,
        message: `A similar alert for ${student.full_name} (type: ${alertType}) already exists and was created within the last 7 days. Duplicate alert not created.`
      };
    }

    // Create the alert
    const result = db.prepare(`
      INSERT INTO advisor_alerts (advisor_id, student_id, alert_type, severity, title, message, is_read, is_dismissed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, datetime('now'))
    `).run(advisorId, student.student_id, alertType, severity, title, message);

    const alertId = result.lastInsertRowid;

    return {
      success: true,
      alert: {
        alertId: alertId,
        type: alertType,
        severity: severity,
        title: title,
        message: message,
        student: {
          name: student.full_name,
          studentId: student.student_number,
          email: student.email,
          level: student.level_name,
          section: student.section_name
        },
        createdAt: new Date().toISOString()
      },
      message: `Alert created successfully for ${student.full_name}. Severity: ${severity}, Type: ${alertType}.`
    };
  } catch (error: any) {
    console.error('[createAutomatedAlert] Error:', error);
    return {
      success: false,
      message: 'An error occurred while creating the alert. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const createAutomatedAlertDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'createAutomatedAlert',
    description: 'Create an automated alert for a student based on performance triggers. Alert types include: gpa_drop (significant GPA decline), low_attendance (< 70%), at_risk (multiple risk factors), no_contact (no recent communication), declining_trend (consistent GPA decline), academic_probation (GPA < 2.0), honors_opportunity (high achievement), or custom. System validates criteria and prevents duplicate alerts.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student (e.g., "John Smith" or "Smith"). Fuzzy matching supported.'
        },
        alertType: {
          type: 'string',
          enum: ['gpa_drop', 'low_attendance', 'at_risk', 'no_contact', 'declining_trend', 'academic_probation', 'honors_opportunity', 'custom'],
          description: 'The type of alert to create. Each type has automatic validation rules to ensure alert is warranted.'
        },
        customMessage: {
          type: 'string',
          description: 'Optional custom message for the alert. Required if alertType is "custom". Can override default messages for other alert types.'
        }
      },
      required: ['studentName', 'alertType']
    }
  }
};
