import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Alert Function: Get Advisor Alerts
 * Retrieves unread and active alerts for an advisor
 */
export async function getAdvisorAlerts(args: any, context: any): Promise<any> {
  const { severity = 'all', includeRead = false, limit = 50 } = args;
  const { advisorId } = context;

  console.log(`[getAdvisorAlerts] Getting alerts for advisor ${advisorId}, severity: ${severity}, includeRead: ${includeRead}`);

  try {
    // Build query based on filters
    let query = `
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
        u.email as student_email,
        l.level_name,
        sec.section_name
      FROM advisor_alerts a
      LEFT JOIN students s ON a.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN levels l ON s.level_id = l.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      WHERE a.advisor_id = ? AND a.is_dismissed = 0
    `;

    const params: any[] = [advisorId];

    // Filter by read status
    if (!includeRead) {
      query += ` AND a.is_read = 0`;
    }

    // Filter by severity
    if (severity !== 'all') {
      query += ` AND a.severity = ?`;
      params.push(severity);
    }

    // Order by severity (high first) and date (newest first)
    query += `
      ORDER BY
        CASE a.severity
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        a.created_at DESC
      LIMIT ?
    `;
    params.push(limit);

    const alerts = db.prepare(query).all(...params) as any[];

    // Get alert counts by severity
    const alertCounts = db.prepare(`
      SELECT
        severity,
        COUNT(*) as count,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count
      FROM advisor_alerts
      WHERE advisor_id = ? AND is_dismissed = 0
      GROUP BY severity
    `).all(advisorId) as any[];

    // Get alert counts by type
    const alertTypeData = db.prepare(`
      SELECT
        alert_type,
        COUNT(*) as count,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count
      FROM advisor_alerts
      WHERE advisor_id = ? AND is_dismissed = 0
      GROUP BY alert_type
    `).all(advisorId) as any[];

    // Format alerts for response
    const formattedAlerts = alerts.map(alert => ({
      alertId: alert.alert_id,
      type: alert.alert_type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      isRead: alert.is_read === 1,
      student: alert.student_number ? {
        name: alert.student_name,
        studentId: alert.student_number,
        email: alert.student_email,
        level: alert.level_name,
        section: alert.section_name
      } : null,
      createdAt: alert.created_at,
      timeAgo: getTimeAgo(alert.created_at)
    }));

    // Group alerts by type for better organization
    const groupedByType: any = {};
    formattedAlerts.forEach(alert => {
      if (!groupedByType[alert.type]) {
        groupedByType[alert.type] = [];
      }
      groupedByType[alert.type].push(alert);
    });

    // Calculate summary statistics
    const summary = {
      totalAlerts: formattedAlerts.length,
      unreadAlerts: formattedAlerts.filter(a => !a.isRead).length,
      highSeverity: alertCounts.find(c => c.severity === 'high')?.count || 0,
      mediumSeverity: alertCounts.find(c => c.severity === 'medium')?.count || 0,
      lowSeverity: alertCounts.find(c => c.severity === 'low')?.count || 0,
      unreadHigh: alertCounts.find(c => c.severity === 'high')?.unread_count || 0,
      unreadMedium: alertCounts.find(c => c.severity === 'medium')?.unread_count || 0,
      unreadLow: alertCounts.find(c => c.severity === 'low')?.unread_count || 0,
      byType: alertTypeData.reduce((acc: any, item: any) => {
        acc[item.alert_type] = {
          total: item.count,
          unread: item.unread_count
        };
        return acc;
      }, {})
    };

    // Generate insights
    const insights: string[] = [];

    if (summary.unreadHigh > 0) {
      insights.push(`⚠️ URGENT: ${summary.unreadHigh} unread high-severity alert(s) requiring immediate attention.`);
    }

    if (summary.unreadMedium > 0) {
      insights.push(`${summary.unreadMedium} unread medium-severity alert(s) need review.`);
    }

    if (summary.totalAlerts === 0) {
      insights.push('✅ No active alerts - all students appear to be on track.');
    }

    // Alert type insights
    const typeInsights = [];
    if (summary.byType.gpa_drop?.total > 0) {
      typeInsights.push(`${summary.byType.gpa_drop.total} GPA drop alert(s)`);
    }
    if (summary.byType.low_attendance?.total > 0) {
      typeInsights.push(`${summary.byType.low_attendance.total} low attendance alert(s)`);
    }
    if (summary.byType.at_risk?.total > 0) {
      typeInsights.push(`${summary.byType.at_risk.total} at-risk student alert(s)`);
    }

    if (typeInsights.length > 0) {
      insights.push(`Alert breakdown: ${typeInsights.join(', ')}.`);
    }

    return {
      success: true,
      summary: summary,
      alerts: formattedAlerts,
      groupedByType: groupedByType,
      insights: insights,
      message: `Retrieved ${formattedAlerts.length} alert(s). Unread: ${summary.unreadAlerts}, High severity: ${summary.unreadHigh}.`
    };
  } catch (error: any) {
    console.error('[getAdvisorAlerts] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving alerts. Please try again.'
    };
  }
}

/**
 * Helper function to calculate time ago
 */
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
}

// Function declaration for GLM API
export const getAdvisorAlertsDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getAdvisorAlerts',
    description: 'Retrieve active alerts for the advisor, including automated system alerts and manual notifications. Alerts highlight students who need attention due to GPA drops, low attendance, at-risk status, or other concerns. Returns alerts grouped by severity and type with summary statistics.',
    parameters: {
      type: 'object',
      properties: {
        severity: {
          type: 'string',
          enum: ['all', 'high', 'medium', 'low'],
          description: 'Filter alerts by severity level: "high" (urgent action needed), "medium" (attention required), "low" (monitor), or "all" (default: all severities).'
        },
        includeRead: {
          type: 'boolean',
          description: 'Include alerts that have already been read (default: false, show only unread alerts).'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of alerts to return (default: 50).'
        }
      },
      required: []
    }
  }
};
