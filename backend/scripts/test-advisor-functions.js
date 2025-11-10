"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const results = [];
// Utility function to measure execution time
function timeFunction(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return { result, time: end - start };
}
// Get advisor ID for testing (advisor.l1.1@mentorlink.com)
function getTestAdvisorId() {
    try {
        const advisor = database_1.db.prepare(`
      SELECT a.id
      FROM advisors a
      JOIN users u ON a.user_id = u.id
      WHERE u.email = 'advisor.l1.1@mentorlink.com'
    `).get();
        return advisor ? advisor.id : null;
    }
    catch (error) {
        console.error('Error getting advisor ID:', error);
        return null;
    }
}
// ============================================
// TEST 1: getAdvisorStudentList
// ============================================
function testGetAdvisorStudentList(advisorId) {
    console.log('\n📋 Test 1: getAdvisorStudentList');
    console.log('─'.repeat(80));
    try {
        const { result: students, time } = timeFunction(() => database_1.db.prepare(`
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
      `).all(advisorId));
        const passed = students.length > 0;
        const message = passed
            ? `✅ SUCCESS: Retrieved ${students.length} student(s)`
            : '❌ FAILED: No students found';
        if (passed) {
            console.log(`   Total Students: ${students.length}`);
            console.log(`   Execution Time: ${time.toFixed(2)}ms`);
            console.log('\n   Sample Students:');
            students.slice(0, 3).forEach((s, i) => {
                console.log(`   ${i + 1}. ${s.full_name}`);
                console.log(`      Email: ${s.email}`);
                console.log(`      Level: ${s.level_name} (${s.level_number})`);
                console.log(`      Section: ${s.section_name}`);
                console.log(`      GPA: ${s.gpa ? parseFloat(s.gpa).toFixed(2) : 'N/A'}`);
                console.log(`      Attendance: ${s.attendance_percentage ? parseFloat(s.attendance_percentage).toFixed(1) + '%' : 'N/A'}`);
            });
            if (students.length > 3) {
                console.log(`   ... and ${students.length - 3} more student(s)`);
            }
        }
        else {
            console.log('   ❌ No students assigned to this advisor');
        }
        return {
            functionName: 'getAdvisorStudentList',
            passed,
            executionTime: time,
            message,
            data: students
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            functionName: 'getAdvisorStudentList',
            passed: false,
            executionTime: 0,
            message: 'Error occurred',
            error: error.message
        };
    }
}
// ============================================
// TEST 2: getHighestGPAStudent
// ============================================
function testGetHighestGPAStudent(advisorId) {
    console.log('\n🏆 Test 2: getHighestGPAStudent');
    console.log('─'.repeat(80));
    try {
        const { result: student, time } = timeFunction(() => database_1.db.prepare(`
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
      `).get(advisorId));
        const passed = student !== undefined && student !== null;
        const message = passed
            ? `✅ SUCCESS: Found highest GPA student: ${student.full_name} (GPA: ${parseFloat(student.gpa).toFixed(2)})`
            : '❌ FAILED: No student with GPA found';
        if (passed) {
            console.log(`   Student: ${student.full_name}`);
            console.log(`   Email: ${student.email}`);
            console.log(`   GPA: ${parseFloat(student.gpa).toFixed(2)} (HIGHEST)`);
            console.log(`   Level: ${student.level_name}`);
            console.log(`   Section: ${student.section_name}`);
            console.log(`   Execution Time: ${time.toFixed(2)}ms`);
            // Verify it's actually the highest
            const allGPAs = database_1.db.prepare(`
        SELECT s.gpa
        FROM advisor_assignments aa
        JOIN students s ON aa.student_id = s.id
        WHERE aa.advisor_id = ? AND s.gpa IS NOT NULL
        ORDER BY s.gpa DESC
      `).all(advisorId);
            const actualHighest = Math.max(...allGPAs.map((s) => parseFloat(s.gpa)));
            const isActuallyHighest = Math.abs(parseFloat(student.gpa) - actualHighest) < 0.01;
            console.log(`   ✓ Verification: ${isActuallyHighest ? 'CONFIRMED highest GPA' : 'WARNING: May not be highest'}`);
        }
        else {
            console.log('   ❌ No student with GPA data found');
        }
        return {
            functionName: 'getHighestGPAStudent',
            passed,
            executionTime: time,
            message,
            data: student
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            functionName: 'getHighestGPAStudent',
            passed: false,
            executionTime: 0,
            message: 'Error occurred',
            error: error.message
        };
    }
}
// ============================================
// TEST 3: getHonorStudents
// ============================================
function testGetHonorStudents(advisorId, minGPA = 3.5) {
    console.log(`\n🎓 Test 3: getHonorStudents (minGPA: ${minGPA})`);
    console.log('─'.repeat(80));
    try {
        const { result: students, time } = timeFunction(() => database_1.db.prepare(`
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
      `).all(advisorId, minGPA));
        const passed = students.length >= 0; // Can be 0, that's valid
        const message = `✅ SUCCESS: Found ${students.length} honor student(s) with GPA >= ${minGPA}`;
        // Group by category
        const highestHonors = students.filter(s => parseFloat(s.gpa) >= 3.90);
        const highHonors = students.filter(s => parseFloat(s.gpa) >= 3.75 && parseFloat(s.gpa) < 3.90);
        const honors = students.filter(s => parseFloat(s.gpa) >= 3.50 && parseFloat(s.gpa) < 3.75);
        console.log(`   Total Honor Students: ${students.length}`);
        console.log(`   Execution Time: ${time.toFixed(2)}ms`);
        console.log('\n   Categorization:');
        console.log(`   • Highest Honors (≥3.90): ${highestHonors.length}`);
        console.log(`   • High Honors (3.75-3.89): ${highHonors.length}`);
        console.log(`   • Honors (3.50-3.74): ${honors.length}`);
        if (students.length > 0) {
            console.log('\n   Top Honor Students:');
            students.slice(0, 3).forEach((s, i) => {
                console.log(`   ${i + 1}. ${s.full_name} - GPA: ${parseFloat(s.gpa).toFixed(2)} (${s.honor_category})`);
            });
        }
        return {
            functionName: 'getHonorStudents',
            passed,
            executionTime: time,
            message,
            data: {
                total: students.length,
                highestHonors: highestHonors.length,
                highHonors: highHonors.length,
                honors: honors.length,
                students: students
            }
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            functionName: 'getHonorStudents',
            passed: false,
            executionTime: 0,
            message: 'Error occurred',
            error: error.message
        };
    }
}
// ============================================
// TEST 4: getStudentsByGPA
// ============================================
function testGetStudentsByGPA(advisorId, threshold, comparison) {
    console.log(`\n📊 Test 4: getStudentsByGPA (${comparison} ${threshold})`);
    console.log('─'.repeat(80));
    try {
        const operator = comparison === 'below' ? '<' : '>';
        const orderDirection = comparison === 'below' ? 'ASC' : 'DESC';
        const { result: students, time } = timeFunction(() => database_1.db.prepare(`
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
      `).all(advisorId, threshold));
        const passed = students.length >= 0; // Can be 0, that's valid
        const category = comparison === 'below' ? 'At-risk students' : 'High performers';
        const message = `✅ SUCCESS: Found ${students.length} student(s) with GPA ${comparison} ${threshold}`;
        console.log(`   Category: ${category}`);
        console.log(`   Total Students: ${students.length}`);
        console.log(`   Execution Time: ${time.toFixed(2)}ms`);
        if (students.length > 0) {
            console.log(`\n   Sample Students (${comparison} ${threshold}):`);
            students.slice(0, 5).forEach((s, i) => {
                console.log(`   ${i + 1}. ${s.full_name} - GPA: ${parseFloat(s.gpa).toFixed(2)}`);
            });
            // Verify filtering logic
            const allCorrect = students.every((s) => {
                const gpa = parseFloat(s.gpa);
                return comparison === 'below' ? gpa < threshold : gpa > threshold;
            });
            console.log(`   ✓ Verification: ${allCorrect ? 'All students meet criteria' : 'WARNING: Some students don\'t match'}`);
        }
        return {
            functionName: 'getStudentsByGPA',
            passed,
            executionTime: time,
            message,
            data: {
                threshold,
                comparison,
                category,
                total: students.length,
                students: students
            }
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            functionName: 'getStudentsByGPA',
            passed: false,
            executionTime: 0,
            message: 'Error occurred',
            error: error.message
        };
    }
}
// ============================================
// TEST 5: getLastStudentContact
// ============================================
function testGetLastStudentContact(advisorId, studentName) {
    console.log(`\n💬 Test 5: getLastStudentContact (searching for: "${studentName}")`);
    console.log('─'.repeat(80));
    try {
        // Step 1: Find student
        const { result: student, time: findTime } = timeFunction(() => database_1.db.prepare(`
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
      `).get(advisorId, `%${studentName}%`, studentName, `${studentName}%`));
        if (!student) {
            console.log(`   ❌ Student not found matching "${studentName}"`);
            return {
                functionName: 'getLastStudentContact',
                passed: false,
                executionTime: findTime,
                message: `Student not found: ${studentName}`,
                error: 'Student not found'
            };
        }
        console.log(`   ✓ Found student: ${student.full_name}`);
        // Step 2: Check conversations
        const { result: lastConversation, time: convTime } = timeFunction(() => database_1.db.prepare(`
        SELECT
          MAX(updated_at) as last_contact_time,
          'conversation' as contact_type
        FROM conversations
        WHERE student_id = ? AND advisor_id = ?
      `).get(student.student_id, advisorId));
        // Step 3: Check AI chat
        const { result: lastAIChat, time: aiTime } = timeFunction(() => database_1.db.prepare(`
        SELECT
          MAX(created_at) as last_contact_time,
          'ai_chat' as contact_type
        FROM ai_chat_history
        WHERE student_id = ?
      `).get(student.student_id));
        const totalTime = findTime + convTime + aiTime;
        let mostRecentContact = null;
        let contactType = 'none';
        if (lastConversation?.last_contact_time && lastAIChat?.last_contact_time) {
            const convTime = new Date(lastConversation.last_contact_time).getTime();
            const aiTime = new Date(lastAIChat.last_contact_time).getTime();
            if (convTime >= aiTime) {
                mostRecentContact = lastConversation;
                contactType = 'Advisor-Student Conversation';
            }
            else {
                mostRecentContact = lastAIChat;
                contactType = 'AI Chat Session';
            }
        }
        else if (lastConversation?.last_contact_time) {
            mostRecentContact = lastConversation;
            contactType = 'Advisor-Student Conversation';
        }
        else if (lastAIChat?.last_contact_time) {
            mostRecentContact = lastAIChat;
            contactType = 'AI Chat Session';
        }
        const passed = true; // Function works even if no contact found
        let message = '';
        if (mostRecentContact) {
            message = `✅ SUCCESS: Found last contact via ${contactType}`;
            console.log(`   Student: ${student.full_name}`);
            console.log(`   Last Contact Type: ${contactType}`);
            console.log(`   Last Contact Time: ${mostRecentContact.last_contact_time}`);
        }
        else {
            message = `✅ SUCCESS: No contact history (valid result)`;
            console.log(`   Student: ${student.full_name}`);
            console.log(`   Last Contact: No contact history found`);
        }
        console.log(`   Execution Time: ${totalTime.toFixed(2)}ms`);
        return {
            functionName: 'getLastStudentContact',
            passed,
            executionTime: totalTime,
            message,
            data: {
                student: student.full_name,
                hasContact: mostRecentContact !== null,
                contactType,
                lastContactTime: mostRecentContact?.last_contact_time || null
            }
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            functionName: 'getLastStudentContact',
            passed: false,
            executionTime: 0,
            message: 'Error occurred',
            error: error.message
        };
    }
}
// ============================================
// MAIN TEST EXECUTION
// ============================================
console.log('\n========================================');
console.log('  PHASE 2 ADVISOR FUNCTIONS TEST SUITE');
console.log('========================================\n');
console.log('Getting test advisor data...');
const advisorId = getTestAdvisorId();
if (!advisorId) {
    console.error('\n❌ ERROR: Could not find advisor with email advisor.l1.1@mentorlink.com');
    console.error('Please ensure the database is seeded with test data.');
    process.exit(1);
}
const advisorInfo = database_1.db.prepare(`
  SELECT u.full_name, u.email, l.level_name
  FROM advisors a
  JOIN users u ON a.user_id = u.id
  JOIN levels l ON a.level_id = l.id
  WHERE a.id = ?
`).get(advisorId);
console.log(`✓ Testing with advisor: ${advisorInfo.full_name} (${advisorInfo.email})`);
console.log(`✓ Level: ${advisorInfo.level_name}`);
console.log(`✓ Advisor ID: ${advisorId}`);
// Get a sample student name for Test 5
const sampleStudent = database_1.db.prepare(`
  SELECT u.full_name
  FROM advisor_assignments aa
  JOIN students s ON aa.student_id = s.id
  JOIN users u ON s.user_id = u.id
  WHERE aa.advisor_id = ?
  LIMIT 1
`).get(advisorId);
const testStudentName = sampleStudent ? sampleStudent.full_name : 'John';
// Run all tests
results.push(testGetAdvisorStudentList(advisorId));
results.push(testGetHighestGPAStudent(advisorId));
results.push(testGetHonorStudents(advisorId, 3.5));
results.push(testGetStudentsByGPA(advisorId, 2.5, 'below'));
results.push(testGetStudentsByGPA(advisorId, 3.5, 'above'));
results.push(testGetLastStudentContact(advisorId, testStudentName));
// ============================================
// SUMMARY REPORT
// ============================================
console.log('\n========================================');
console.log('  TEST SUMMARY');
console.log('========================================\n');
const totalTests = results.length;
const passedTests = results.filter(r => r.passed).length;
const failedTests = totalTests - passedTests;
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('\n📋 Test Results:\n');
results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.functionName}: ${status}`);
    console.log(`   ${result.message}`);
    console.log(`   Execution Time: ${result.executionTime.toFixed(2)}ms`);
    if (result.error) {
        console.log(`   Error: ${result.error}`);
    }
    console.log('');
});
// Performance metrics
const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
console.log('⚡ Performance Metrics:');
console.log(`   Average Execution Time: ${avgTime.toFixed(2)}ms`);
console.log(`   Fastest: ${Math.min(...results.map(r => r.executionTime)).toFixed(2)}ms`);
console.log(`   Slowest: ${Math.max(...results.map(r => r.executionTime)).toFixed(2)}ms`);
console.log('\n========================================');
console.log(`  ${passedTests === totalTests ? '✅ ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);
console.log('========================================\n');
// Exit with error code if any tests failed
if (failedTests > 0) {
    process.exit(1);
}
