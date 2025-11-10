import { Request, Response } from 'express';
import { db } from '../config/database';
import { callGeminiAPI, FunctionDeclaration, FunctionHandlerMap } from '../utils/gemini';

// ============================================
// FUNCTION DECLARATIONS FOR GEMINI AI
// ============================================

// STUDENT FUNCTION DECLARATIONS (Phase 1)
const studentFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'getCourseSchedule',
    description: 'Get the schedule details for a specific course by course name or course code. Returns instructor name, class time, days, room number, building location, and credit hours.',
    parameters: {
      type: 'object',
      properties: {
        courseName: {
          type: 'string',
          description: 'The name or code of the course to search for (e.g., "Introduction to Computer Science" or "CS101")'
        }
      },
      required: ['courseName']
    }
  },
  {
    name: 'getAdvisorContactInfo',
    description: 'Get contact information for an advisor by their assigned level number. Returns advisor name, email, specialization, and availability status.',
    parameters: {
      type: 'object',
      properties: {
        levelNumber: {
          type: 'number',
          description: 'The level number (1-5) for which to find the advisor'
        }
      },
      required: ['levelNumber']
    }
  },
  {
    name: 'getStudentAdvisorInfo',
    description: 'Get the assigned advisor information for the current student. Returns advisor name, email, specialization, and availability status.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'searchFacilities',
    description: 'Search for campus facilities like computer labs, libraries, buildings, or departments. Returns facility name, building, room number, and related information.',
    parameters: {
      type: 'object',
      properties: {
        searchTerm: {
          type: 'string',
          description: 'The facility name or type to search for (e.g., "computer lab", "library", "engineering building")'
        }
      },
      required: ['searchTerm']
    }
  },
  {
    name: 'getStaffContact',
    description: 'Get contact information for university staff members who can help with specific student needs. Searches by issue type, department, or category. Use this when students need help with: registration problems, IT/technical support, financial aid, academic issues, student services, career guidance, library resources, international student matters, or facilities/campus issues.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'What the student needs help with (e.g., "registration problems", "IT support", "financial aid", "academic probation", "visa issues", "career counseling", "library help"). Can also search by staff role or department name.'
        }
      },
      required: ['query']
    }
  }
];

// ADVISOR FUNCTION DECLARATIONS (Phase 2)
const advisorFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'getAdvisorStudentList',
    description: 'Get the complete list of students assigned to the current advisor. Returns student names, emails, levels, sections, GPAs, and attendance information. Ordered by level, section, and name.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'getHighestGPAStudent',
    description: 'Get the student with the highest GPA among those assigned to the current advisor. Returns the top student\'s name, email, level, section, GPA, and attendance.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'getHonorStudents',
    description: 'Get all honor students (students with high GPAs) assigned to the current advisor. Returns students categorized by honor level: Highest Honors (Summa Cum Laude, GPA >= 3.90), High Honors (Magna Cum Laude, GPA >= 3.75), and Honors (Cum Laude, GPA >= 3.50). Optional minimum GPA parameter to filter results.',
    parameters: {
      type: 'object',
      properties: {
        minGPA: {
          type: 'number',
          description: 'Minimum GPA threshold for honor students. Defaults to 3.5 if not specified. Must be between 0.0 and 4.0.'
        }
      }
    }
  },
  {
    name: 'getStudentsByGPA',
    description: 'Get students based on a GPA threshold comparison. Can find students above or below a specific GPA value. Useful for identifying at-risk students (below threshold) or high-performing students (above threshold).',
    parameters: {
      type: 'object',
      properties: {
        threshold: {
          type: 'number',
          description: 'GPA threshold value for comparison (e.g., 2.0, 3.0, 3.5). Must be between 0.0 and 4.0.'
        },
        comparison: {
          type: 'string',
          description: 'Comparison type: "below" to find students with GPA below threshold (at-risk students), or "above" to find students with GPA above threshold (high performers). Defaults to "below".',
          enum: ['below', 'above']
        }
      },
      required: ['threshold']
    }
  },
  {
    name: 'getLastStudentContact',
    description: 'Get the most recent contact information for a specific student by name. Searches both advisor-student chat conversations and AI chat history to find the last interaction. Returns the most recent contact timestamp and type (conversation or AI chat).',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student to search for (e.g., "John Smith" or "Smith"). Fuzzy matching is supported.'
        }
      },
      required: ['studentName']
    }
  }
];

// ============================================
// FUNCTION HANDLER IMPLEMENTATIONS
// ============================================

/**
 * Get course schedule details by course name or code
 */
async function getCourseSchedule(args: any, context: any): Promise<any> {
  const { courseName } = args;
  const { studentId } = context;

  console.log(`[getCourseSchedule] Searching for course: "${courseName}" for student ID: ${studentId}`);

  try {
    // Search in student's enrolled courses with fuzzy matching
    const courses = db.prepare(`
      SELECT
        course_name,
        course_code,
        instructor_name,
        instructor_email,
        class_time,
        class_days,
        room_number,
        building,
        credit_hours,
        current_grade,
        semester,
        department,
        course_description,
        prerequisites
      FROM student_courses
      WHERE student_id = ?
      AND (
        LOWER(course_name) LIKE LOWER(?)
        OR LOWER(course_code) LIKE LOWER(?)
      )
    `).all(studentId, `%${courseName}%`, `%${courseName}%`) as any[];

    if (courses.length === 0) {
      return {
        success: false,
        message: `No course found matching "${courseName}" in your enrolled courses. Please check the course name and try again.`
      };
    }

    if (courses.length === 1) {
      const course = courses[0];
      return {
        success: true,
        course: {
          name: course.course_name,
          code: course.course_code,
          instructor: course.instructor_name,
          instructorEmail: course.instructor_email,
          schedule: `${course.class_days} at ${course.class_time}`,
          location: `Room ${course.room_number}, ${course.building}`,
          credits: course.credit_hours,
          grade: course.current_grade,
          semester: course.semester,
          department: course.department,
          description: course.course_description,
          prerequisites: course.prerequisites
        }
      };
    }

    // Multiple matches found
    return {
      success: true,
      message: `Found ${courses.length} courses matching "${courseName}"`,
      courses: courses.map(c => ({
        name: c.course_name,
        code: c.course_code,
        instructor: c.instructor_name,
        instructorEmail: c.instructor_email,
        schedule: `${c.class_days} at ${c.class_time}`,
        location: `Room ${c.room_number}, ${c.building}`,
        credits: c.credit_hours,
        grade: c.current_grade,
        semester: c.semester
      }))
    };
  } catch (error: any) {
    console.error('[getCourseSchedule] Error:', error);
    return {
      success: false,
      message: 'An error occurred while searching for the course. Please try again.'
    };
  }
}

/**
 * Get advisor contact information by level number
 */
async function getAdvisorContactInfo(args: any, context: any): Promise<any> {
  const { levelNumber } = args;

  console.log(`[getAdvisorContactInfo] Getting advisors for level: ${levelNumber}`);

  try {
    const advisors = db.prepare(`
      SELECT
        u.full_name,
        u.email,
        a.specialization,
        a.is_available,
        CASE WHEN a.is_available = 1 THEN 'Available' ELSE 'Unavailable' END as availability
      FROM advisors a
      JOIN users u ON a.user_id = u.id
      JOIN levels l ON a.level_id = l.id
      WHERE l.level_number = ?
    `).all(levelNumber) as any[];

    if (advisors.length === 0) {
      return {
        success: false,
        message: `No advisors found for level ${levelNumber}. Please contact the admissions office.`
      };
    }

    return {
      success: true,
      advisors: advisors.map(a => ({
        name: a.full_name,
        email: a.email,
        specialization: a.specialization,
        availability: a.availability
      }))
    };
  } catch (error: any) {
    console.error('[getAdvisorContactInfo] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving advisor information. Please try again.'
    };
  }
}

/**
 * Get the student's assigned advisor information
 */
async function getStudentAdvisorInfo(args: any, context: any): Promise<any> {
  const { studentId } = context;

  console.log(`[getStudentAdvisorInfo] Getting advisor for student ID: ${studentId}`);

  try {
    const advisor = db.prepare(`
      SELECT
        u.full_name,
        u.email,
        a.specialization,
        a.is_available,
        CASE WHEN a.is_available = 1 THEN 'Available' ELSE 'Unavailable' END as availability
      FROM advisor_assignments aa
      JOIN advisors a ON aa.advisor_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE aa.student_id = ?
    `).get(studentId) as any;

    if (!advisor) {
      return {
        success: false,
        message: 'No advisor has been assigned to you yet. Please contact the admissions office.'
      };
    }

    return {
      success: true,
      advisor: {
        name: advisor.full_name,
        email: advisor.email,
        specialization: advisor.specialization,
        availability: advisor.availability
      }
    };
  } catch (error: any) {
    console.error('[getStudentAdvisorInfo] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving your advisor information. Please try again.'
    };
  }
}

/**
 * Search for campus facilities including labs, libraries, offices, and services
 */
async function searchFacilities(args: any, context: any): Promise<any> {
  const { searchTerm } = args;

  console.log(`[searchFacilities] Searching for: "${searchTerm}"`);

  try {
    // Search in facilities table with fuzzy matching on name, type, building, and description
    const facilities = db.prepare(`
      SELECT
        name,
        type,
        building,
        room_number,
        floor,
        capacity,
        services,
        hours,
        contact_email,
        phone,
        description
      FROM facilities
      WHERE LOWER(name) LIKE LOWER(?)
         OR LOWER(type) LIKE LOWER(?)
         OR LOWER(building) LIKE LOWER(?)
         OR LOWER(description) LIKE LOWER(?)
      ORDER BY
        CASE
          WHEN LOWER(name) LIKE LOWER(?) THEN 1
          WHEN LOWER(type) LIKE LOWER(?) THEN 2
          WHEN LOWER(building) LIKE LOWER(?) THEN 3
          ELSE 4
        END,
        name
      LIMIT 10
    `).all(
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    ) as any[];

    if (facilities.length === 0) {
      return {
        success: false,
        message: `No facilities found matching "${searchTerm}". Try searching for: computer lab, library, registrar, career center, cafeteria, fitness center, or specific department names like Computer Science, Engineering, or Business.`
      };
    }

    // Format the results for better presentation
    const formattedFacilities = facilities.map((f: any) => {
      const services = f.services ? JSON.parse(f.services) : [];

      return {
        name: f.name,
        type: f.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        location: f.room_number
          ? `Room ${f.room_number}, ${f.building}${f.floor ? ` (Floor ${f.floor})` : ''}`
          : f.building,
        capacity: f.capacity ? `Capacity: ${f.capacity}` : null,
        hours: f.hours,
        contact: f.contact_email,
        phone: f.phone,
        services: services.length > 0 ? services.slice(0, 5).join(', ') + (services.length > 5 ? '...' : '') : null,
        description: f.description ? f.description.substring(0, 200) + (f.description.length > 200 ? '...' : '') : null
      };
    });

    if (facilities.length === 1) {
      const facility = formattedFacilities[0];
      return {
        success: true,
        facility: facility,
        message: `Found: ${facility.name}`
      };
    }

    return {
      success: true,
      message: `Found ${facilities.length} facilities matching "${searchTerm}"`,
      facilities: formattedFacilities
    };
  } catch (error: any) {
    console.error('[searchFacilities] Error:', error);
    return {
      success: false,
      message: 'An error occurred while searching for facilities. Please try again.'
    };
  }
}

/**
 * Get staff contact information by query
 * Searches by role, department, category, or responsibilities
 */
async function getStaffContact(args: any, context: any): Promise<any> {
  const { query } = args;

  console.log(`[getStaffContact] Searching for staff with query: "${query}"`);

  try {
    // Search staff contacts with comprehensive fuzzy matching
    const staff = db.prepare(`
      SELECT
        name,
        role,
        department,
        email,
        phone,
        office_location,
        office_hours,
        responsibilities,
        category
      FROM staff_contacts
      WHERE
        LOWER(role) LIKE LOWER(?)
        OR LOWER(department) LIKE LOWER(?)
        OR LOWER(category) LIKE LOWER(?)
        OR LOWER(responsibilities) LIKE LOWER(?)
      ORDER BY
        CASE
          WHEN LOWER(role) LIKE LOWER(?) THEN 1
          WHEN LOWER(department) LIKE LOWER(?) THEN 2
          WHEN LOWER(category) LIKE LOWER(?) THEN 3
          ELSE 4
        END,
        name
      LIMIT 5
    `).all(
      `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`,
      `%${query}%`, `%${query}%`, `%${query}%`
    ) as any[];

    if (staff.length === 0) {
      return {
        success: false,
        message: `No staff members found matching "${query}". Please try searching for: registration, IT support, financial aid, academic affairs, student services, career services, library, international office, or facilities.`
      };
    }

    if (staff.length === 1) {
      const person = staff[0];
      return {
        success: true,
        contact: {
          name: person.name,
          role: person.role,
          department: person.department,
          email: person.email,
          phone: person.phone,
          office: person.office_location,
          hours: person.office_hours,
          canHelpWith: person.responsibilities
        }
      };
    }

    // Multiple matches found
    return {
      success: true,
      message: `Found ${staff.length} staff members who can help with "${query}"`,
      contacts: staff.map(p => ({
        name: p.name,
        role: p.role,
        department: p.department,
        email: p.email,
        phone: p.phone,
        office: p.office_location,
        hours: p.office_hours,
        canHelpWith: p.responsibilities
      }))
    };
  } catch (error: any) {
    console.error('[getStaffContact] Error:', error);
    return {
      success: false,
      message: 'An error occurred while searching for staff contacts. Please try again.'
    };
  }
}

// ============================================
// ADVISOR FUNCTION HANDLER IMPLEMENTATIONS (Phase 2)
// ============================================

/**
 * Get the complete list of students assigned to the current advisor
 */
async function getAdvisorStudentList(args: any, context: any): Promise<any> {
  const { advisorId } = context;

  console.log(`[getAdvisorStudentList] Getting student list for advisor ID: ${advisorId}`);

  try {
    const students = db.prepare(`
      SELECT
        s.id as student_id,
        s.student_id as student_number,
        u.full_name,
        u.email,
        l.level_number,
        l.level_name,
        sec.section_name,
        s.gpa,
        s.attendance_percentage
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE aa.advisor_id = ?
      ORDER BY l.level_number, sec.section_name, u.full_name
    `).all(advisorId) as any[];

    if (students.length === 0) {
      return {
        success: false,
        message: 'No students are currently assigned to you. Please contact the administration if this seems incorrect.'
      };
    }

    return {
      success: true,
      message: `You have ${students.length} student${students.length !== 1 ? 's' : ''} assigned`,
      totalStudents: students.length,
      students: students.map(s => ({
        studentId: s.student_number,
        name: s.full_name,
        email: s.email,
        level: `${s.level_name} (Level ${s.level_number})`,
        section: s.section_name,
        gpa: s.gpa ? parseFloat(s.gpa).toFixed(2) : 'N/A',
        attendance: s.attendance_percentage ? `${parseFloat(s.attendance_percentage).toFixed(1)}%` : 'N/A'
      }))
    };
  } catch (error: any) {
    console.error('[getAdvisorStudentList] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving your student list. Please try again.'
    };
  }
}

/**
 * Get the student with the highest GPA among advisor's assigned students
 */
async function getHighestGPAStudent(args: any, context: any): Promise<any> {
  const { advisorId } = context;

  console.log(`[getHighestGPAStudent] Finding highest GPA student for advisor ID: ${advisorId}`);

  try {
    const student = db.prepare(`
      SELECT
        s.student_id as student_number,
        u.full_name,
        u.email,
        l.level_number,
        l.level_name,
        sec.section_name,
        s.gpa,
        s.attendance_percentage
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE aa.advisor_id = ? AND s.gpa IS NOT NULL
      ORDER BY s.gpa DESC
      LIMIT 1
    `).get(advisorId) as any;

    if (!student) {
      return {
        success: false,
        message: 'No students with recorded GPAs found in your assigned students.'
      };
    }

    return {
      success: true,
      message: `${student.full_name} has the highest GPA among your students`,
      student: {
        studentId: student.student_number,
        name: student.full_name,
        email: student.email,
        level: `${student.level_name} (Level ${student.level_number})`,
        section: student.section_name,
        gpa: parseFloat(student.gpa).toFixed(2),
        attendance: student.attendance_percentage ? `${parseFloat(student.attendance_percentage).toFixed(1)}%` : 'N/A'
      }
    };
  } catch (error: any) {
    console.error('[getHighestGPAStudent] Error:', error);
    return {
      success: false,
      message: 'An error occurred while finding the highest GPA student. Please try again.'
    };
  }
}

/**
 * Get honor students with GPA categorization
 * Categories: Highest Honors (>= 3.90), High Honors (>= 3.75), Honors (>= 3.50)
 */
async function getHonorStudents(args: any, context: any): Promise<any> {
  const { minGPA = 3.5 } = args;
  const { advisorId } = context;

  console.log(`[getHonorStudents] Finding honor students for advisor ID: ${advisorId} with minGPA: ${minGPA}`);

  try {
    // Validate minGPA parameter
    if (minGPA < 0 || minGPA > 4.0) {
      return {
        success: false,
        message: 'Invalid minimum GPA. Please provide a value between 0.0 and 4.0.'
      };
    }

    const students = db.prepare(`
      SELECT
        s.student_id as student_number,
        u.full_name,
        u.email,
        l.level_number,
        l.level_name,
        sec.section_name,
        s.gpa,
        s.attendance_percentage,
        CASE
          WHEN s.gpa >= 3.90 THEN 'Highest Honors (Summa Cum Laude)'
          WHEN s.gpa >= 3.75 THEN 'High Honors (Magna Cum Laude)'
          WHEN s.gpa >= 3.50 THEN 'Honors (Cum Laude)'
          ELSE 'Not Categorized'
        END as honor_category
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE aa.advisor_id = ? AND s.gpa >= ?
      ORDER BY s.gpa DESC, u.full_name
    `).all(advisorId, minGPA) as any[];

    if (students.length === 0) {
      return {
        success: false,
        message: `No honor students found with GPA >= ${minGPA.toFixed(2)} among your assigned students.`
      };
    }

    // Group students by honor category
    const highestHonors = students.filter(s => parseFloat(s.gpa) >= 3.90);
    const highHonors = students.filter(s => parseFloat(s.gpa) >= 3.75 && parseFloat(s.gpa) < 3.90);
    const honors = students.filter(s => parseFloat(s.gpa) >= 3.50 && parseFloat(s.gpa) < 3.75);

    const formatStudent = (s: any) => ({
      studentId: s.student_number,
      name: s.full_name,
      email: s.email,
      level: `${s.level_name} (Level ${s.level_number})`,
      section: s.section_name,
      gpa: parseFloat(s.gpa).toFixed(2),
      attendance: s.attendance_percentage ? `${parseFloat(s.attendance_percentage).toFixed(1)}%` : 'N/A',
      honorCategory: s.honor_category
    });

    return {
      success: true,
      message: `Found ${students.length} honor student${students.length !== 1 ? 's' : ''} with GPA >= ${minGPA.toFixed(2)}`,
      totalHonorStudents: students.length,
      summary: {
        highestHonorsCount: highestHonors.length,
        highHonorsCount: highHonors.length,
        honorsCount: honors.length
      },
      studentsByCategory: {
        highestHonors: highestHonors.length > 0 ? {
          category: 'Highest Honors (Summa Cum Laude)',
          description: 'GPA >= 3.90',
          count: highestHonors.length,
          students: highestHonors.map(formatStudent)
        } : null,
        highHonors: highHonors.length > 0 ? {
          category: 'High Honors (Magna Cum Laude)',
          description: 'GPA 3.75 - 3.89',
          count: highHonors.length,
          students: highHonors.map(formatStudent)
        } : null,
        honors: honors.length > 0 ? {
          category: 'Honors (Cum Laude)',
          description: 'GPA 3.50 - 3.74',
          count: honors.length,
          students: honors.map(formatStudent)
        } : null
      }
    };
  } catch (error: any) {
    console.error('[getHonorStudents] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving honor students. Please try again.'
    };
  }
}

/**
 * Get students based on GPA threshold comparison
 * Can find students above or below a specific GPA
 */
async function getStudentsByGPA(args: any, context: any): Promise<any> {
  const { threshold, comparison = 'below' } = args;
  const { advisorId } = context;

  console.log(`[getStudentsByGPA] Finding students ${comparison} GPA ${threshold} for advisor ID: ${advisorId}`);

  try {
    // Validate threshold parameter
    if (threshold < 0 || threshold > 4.0) {
      return {
        success: false,
        message: 'Invalid GPA threshold. Please provide a value between 0.0 and 4.0.'
      };
    }

    // Validate comparison parameter
    if (comparison !== 'below' && comparison !== 'above') {
      return {
        success: false,
        message: 'Invalid comparison type. Please use "below" or "above".'
      };
    }

    // Build dynamic WHERE clause based on comparison
    const operator = comparison === 'below' ? '<' : '>';
    const orderDirection = comparison === 'below' ? 'ASC' : 'DESC';

    const students = db.prepare(`
      SELECT
        s.student_id as student_number,
        u.full_name,
        u.email,
        l.level_number,
        l.level_name,
        sec.section_name,
        s.gpa,
        s.attendance_percentage
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE aa.advisor_id = ? AND s.gpa IS NOT NULL AND s.gpa ${operator} ?
      ORDER BY s.gpa ${orderDirection}, u.full_name
    `).all(advisorId, threshold) as any[];

    if (students.length === 0) {
      return {
        success: false,
        message: `No students found with GPA ${comparison} ${threshold.toFixed(2)} among your assigned students.`
      };
    }

    const comparisonLabel = comparison === 'below' ? 'At-risk students (below threshold)' : 'High performers (above threshold)';

    return {
      success: true,
      message: `Found ${students.length} student${students.length !== 1 ? 's' : ''} with GPA ${comparison} ${threshold.toFixed(2)}`,
      category: comparisonLabel,
      threshold: threshold.toFixed(2),
      comparison: comparison,
      totalStudents: students.length,
      students: students.map(s => ({
        studentId: s.student_number,
        name: s.full_name,
        email: s.email,
        level: `${s.level_name} (Level ${s.level_number})`,
        section: s.section_name,
        gpa: parseFloat(s.gpa).toFixed(2),
        attendance: s.attendance_percentage ? `${parseFloat(s.attendance_percentage).toFixed(1)}%` : 'N/A'
      }))
    };
  } catch (error: any) {
    console.error('[getStudentsByGPA] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving students by GPA. Please try again.'
    };
  }
}

/**
 * Get the most recent contact with a student
 * Checks both conversations table and ai_chat_history table
 */
async function getLastStudentContact(args: any, context: any): Promise<any> {
  const { studentName } = args;
  const { advisorId } = context;

  console.log(`[getLastStudentContact] Finding last contact for student "${studentName}" and advisor ID: ${advisorId}`);

  try {
    // Step 1: Find student by fuzzy name match
    const student = db.prepare(`
      SELECT
        s.id as student_id,
        s.student_id as student_number,
        u.full_name,
        u.email,
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

    // Step 2: Check conversations table for last conversation
    const lastConversation = db.prepare(`
      SELECT
        MAX(updated_at) as last_contact_time,
        'conversation' as contact_type
      FROM conversations
      WHERE student_id = ? AND advisor_id = ?
    `).get(student.student_id, advisorId) as any;

    // Step 3: Check ai_chat_history table for last AI chat
    const lastAIChat = db.prepare(`
      SELECT
        MAX(created_at) as last_contact_time,
        'ai_chat' as contact_type
      FROM ai_chat_history
      WHERE student_id = ?
    `).get(student.student_id) as any;

    // Step 4: Determine which contact is most recent
    let mostRecentContact = null;
    let contactType = 'none';
    let contactTime = null;

    if (lastConversation?.last_contact_time && lastAIChat?.last_contact_time) {
      // Both exist, compare timestamps
      const convTime = new Date(lastConversation.last_contact_time).getTime();
      const aiTime = new Date(lastAIChat.last_contact_time).getTime();

      if (convTime >= aiTime) {
        mostRecentContact = lastConversation;
        contactType = 'Advisor-Student Conversation';
        contactTime = lastConversation.last_contact_time;
      } else {
        mostRecentContact = lastAIChat;
        contactType = 'AI Chat Session';
        contactTime = lastAIChat.last_contact_time;
      }
    } else if (lastConversation?.last_contact_time) {
      // Only conversation exists
      mostRecentContact = lastConversation;
      contactType = 'Advisor-Student Conversation';
      contactTime = lastConversation.last_contact_time;
    } else if (lastAIChat?.last_contact_time) {
      // Only AI chat exists
      mostRecentContact = lastAIChat;
      contactType = 'AI Chat Session';
      contactTime = lastAIChat.last_contact_time;
    }

    if (!mostRecentContact || !contactTime) {
      return {
        success: true,
        student: {
          name: student.full_name,
          studentId: student.student_number,
          email: student.email,
          level: student.level_name,
          section: student.section_name
        },
        message: `No contact history found for ${student.full_name}. This student has not initiated any conversations or AI chats yet.`,
        hasContact: false
      };
    }

    // Calculate time since last contact
    const timeSince = calculateTimeSince(contactTime);

    return {
      success: true,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        email: student.email,
        level: student.level_name,
        section: student.section_name
      },
      lastContact: {
        type: contactType,
        timestamp: contactTime,
        timeSince: timeSince,
        formattedDate: new Date(contactTime).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      hasContact: true,
      message: `Last contact with ${student.full_name} was ${timeSince} ago via ${contactType}.`
    };
  } catch (error: any) {
    console.error('[getLastStudentContact] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving student contact information. Please try again.'
    };
  }
}

/**
 * Helper function to calculate human-readable time since a given timestamp
 */
function calculateTimeSince(timestamp: string): string {
  const now = new Date().getTime();
  const past = new Date(timestamp).getTime();
  const diffMs = now - past;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`;
  if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`;
}

// Function handler registry
const functionHandlers: FunctionHandlerMap = {
  // Phase 1: Student functions
  getCourseSchedule,
  getAdvisorContactInfo,
  getStudentAdvisorInfo,
  searchFacilities,
  getStaffContact,
  // Phase 2: Advisor functions
  getAdvisorStudentList,
  getHighestGPAStudent,
  getHonorStudents,
  getStudentsByGPA,
  getLastStudentContact
};

// ============================================
// CHAT ENDPOINT
// ============================================

export async function chatWithAI(req: Request, res: Response) {
  try {
    const { message, chatHistory = [] } = req.body;
    const userId = req.user?.userId;
    const userType = req.user?.userType; // 'student' | 'advisor' | 'admin'

    console.log(`[chatWithAI] User ID: ${userId}, User Type: ${userType}`);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get all FAQs (used by both students and advisors)
    const faqs = db.prepare(
      'SELECT question, answer, category FROM faqs ORDER BY category'
    ).all() as any[];

    let context: any = {};
    let userContext: any = {};
    let availableFunctions: FunctionDeclaration[] = [];
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

      // Context for advisor
      context = {
        advisorId: advisorData.advisor_id,
        userId: userId,
        userType: 'advisor',
        advisorData: advisorData
      };

      userContext = {
        advisorId: advisorData.advisor_id,
        fullName: advisorData.full_name,
        email: advisorData.email,
        levelName: advisorData.level_name,
        levelNumber: advisorData.level_number,
        specialization: advisorData.specialization || 'General',
        studentCount: studentCount?.count || 0
      };

      // CROSS-CONTEXT: Advisors get BOTH advisor functions AND student functions
      availableFunctions = [...studentFunctionDeclarations, ...advisorFunctionDeclarations];

      console.log(`[chatWithAI] Advisor ${advisorData.full_name} has ${studentCount?.count || 0} students`);
      console.log(`[chatWithAI] Available functions: ${availableFunctions.length} (student + advisor)`);

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

      // Students get only student functions
      availableFunctions = studentFunctionDeclarations;

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

    // Call Gemini API with function calling support
    const aiResponse = await callGeminiAPI(
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
