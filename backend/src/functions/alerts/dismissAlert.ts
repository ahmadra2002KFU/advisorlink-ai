import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Alert Function: Dismiss Alert
 * Marks an alert as dismissed (resolved) with optional reason
 */
export async function dismissAlert(args: any, context: any): Promise<any> {
  const { alertId, reason, markAsRead = true } = args;
  const { advisorId } = context;

  console.log(`[dismissAlert] Dismissing alert ${alertId} for advisor ${advisorId}`);

  try {
    // Verify the alert exists and belongs to this advisor
    const alert = db.prepare(`
      SELECT
        a.id as alert_id,
        a.alert_type,
        a.severity,
        a.title,
        a.message,
        a.is_read,
        a.is_dismissed,
        a.created_at,
        s.student_id as student_number,
        u.full_name as student_name,
        u.email as student_email
      FROM advisor_alerts a
      LEFT JOIN students s ON a.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE a.id = ? AND a.advisor_id = ?
    `).get(alertId, advisorId) as any;

    if (!alert) {
      return {
        success: false,
        message: `Alert ID ${alertId} not found or does not belong to you.`
      };
    }

    if (alert.is_dismissed === 1) {
      return {
        success: false,
        message: `Alert ID ${alertId} has already been dismissed.`
      };
    }

    // Update alert to mark as dismissed
    const updateQuery = markAsRead
      ? `UPDATE advisor_alerts
         SET is_dismissed = 1, is_read = 1, dismissed_at = datetime('now')
         WHERE id = ? AND advisor_id = ?`
      : `UPDATE advisor_alerts
         SET is_dismissed = 1, dismissed_at = datetime('now')
         WHERE id = ? AND advisor_id = ?`;

    db.prepare(updateQuery).run(alertId, advisorId);

    // If a reason was provided, we could store it (would need to add dismissed_reason column in future)
    // For now, we'll just log it
    if (reason) {
      console.log(`[dismissAlert] Alert ${alertId} dismissed with reason: ${reason}`);
    }

    // Get updated counts for this advisor
    const alertCounts = db.prepare(`
      SELECT
        COUNT(*) as total_active,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count,
        SUM(CASE WHEN severity = 'high' AND is_read = 0 THEN 1 ELSE 0 END) as unread_high
      FROM advisor_alerts
      WHERE advisor_id = ? AND is_dismissed = 0
    `).get(advisorId) as any;

    return {
      success: true,
      dismissedAlert: {
        alertId: alert.alert_id,
        type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        student: alert.student_number ? {
          name: alert.student_name,
          studentId: alert.student_number,
          email: alert.student_email
        } : null,
        dismissedAt: new Date().toISOString(),
        dismissReason: reason || null
      },
      remainingAlerts: {
        totalActive: alertCounts.total_active || 0,
        unread: alertCounts.unread_count || 0,
        unreadHigh: alertCounts.unread_high || 0
      },
      message: `Alert dismissed successfully. ${alertCounts.total_active || 0} active alert(s) remaining (${alertCounts.unread_count || 0} unread, ${alertCounts.unread_high || 0} high-priority).`
    };
  } catch (error: any) {
    console.error('[dismissAlert] Error:', error);
    return {
      success: false,
      message: 'An error occurred while dismissing the alert. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const dismissAlertDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'dismissAlert',
    description: 'Mark an alert as dismissed (resolved) once the issue has been addressed or the alert is no longer relevant. Optionally provide a reason for dismissal. Dismissed alerts are removed from the active alerts list but remain in the database for record-keeping.',
    parameters: {
      type: 'object',
      properties: {
        alertId: {
          type: 'number',
          description: 'The unique ID of the alert to dismiss. Get this from getAdvisorAlerts response.'
        },
        reason: {
          type: 'string',
          description: 'Optional reason for dismissing the alert (e.g., "Issue resolved after meeting with student", "Student GPA improved", "False alarm").'
        },
        markAsRead: {
          type: 'boolean',
          description: 'Also mark the alert as read when dismissing (default: true).'
        }
      },
      required: ['alertId']
    }
  }
};
