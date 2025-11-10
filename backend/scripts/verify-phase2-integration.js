"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
const dotenv_1 = __importDefault(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
dotenv_1.default.config();
const results = [];
// ============================================
// 1. Verify academic_thresholds Table
// ============================================
function verifyAcademicThresholds() {
    console.log('\n📊 Verifying academic_thresholds table...');
    console.log('─'.repeat(80));
    try {
        // Check if table exists
        const tableExists = database_1.db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='academic_thresholds'
    `).get();
        if (!tableExists) {
            console.log('   ❌ academic_thresholds table does not exist');
            return {
                category: 'Database - academic_thresholds',
                passed: false,
                message: 'Table does not exist'
            };
        }
        // Check record count
        const count = database_1.db.prepare('SELECT COUNT(*) as count FROM academic_thresholds').get();
        const hasCorrectCount = count.count === 5;
        // Get all thresholds
        const thresholds = database_1.db.prepare(`
      SELECT honor_type, min_gpa, max_gpa
      FROM academic_thresholds
      ORDER BY min_gpa DESC
    `).all();
        console.log(`   ✓ Table exists`);
        console.log(`   ✓ Record count: ${count.count}${hasCorrectCount ? ' (Expected: 5)' : ' (WARNING: Expected 5)'}`);
        console.log('\n   Thresholds:');
        thresholds.forEach(t => {
            console.log(`   • ${t.honor_type}: ${t.min_gpa.toFixed(2)} - ${t.max_gpa.toFixed(2)}`);
        });
        const expectedTypes = ['highest_honors', 'high_honors', 'honors', 'dean_list', 'academic_probation'];
        const actualTypes = thresholds.map(t => t.honor_type);
        const hasAllTypes = expectedTypes.every(type => actualTypes.includes(type));
        const passed = hasCorrectCount && hasAllTypes;
        const message = passed
            ? '✅ academic_thresholds table verified'
            : '⚠️ academic_thresholds table exists but may have issues';
        return {
            category: 'Database - academic_thresholds',
            passed,
            message,
            details: thresholds.map(t => `${t.honor_type}: ${t.min_gpa} - ${t.max_gpa}`)
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            category: 'Database - academic_thresholds',
            passed: false,
            message: `Error: ${error.message}`
        };
    }
}
// ============================================
// 2. Verify Function Handlers Registration
// ============================================
function verifyFunctionHandlers() {
    console.log('\n🔧 Verifying function handlers registration...');
    console.log('─'.repeat(80));
    try {
        const aiControllerPath = path.join(__dirname, '../src/controllers/aiController.ts');
        const content = fs.readFileSync(aiControllerPath, 'utf-8');
        // Check for functionHandlers constant
        const hasFunctionHandlers = content.includes('const functionHandlers');
        console.log(`   ${hasFunctionHandlers ? '✓' : '❌'} functionHandlers constant defined`);
        // Expected functions
        const expectedFunctions = [
            // Phase 1: Student functions (5)
            'getCourseSchedule',
            'getAdvisorContactInfo',
            'getStudentAdvisorInfo',
            'searchFacilities',
            'getStaffContact',
            // Phase 2: Advisor functions (5)
            'getAdvisorStudentList',
            'getHighestGPAStudent',
            'getHonorStudents',
            'getStudentsByGPA',
            'getLastStudentContact'
        ];
        const foundFunctions = [];
        const missingFunctions = [];
        console.log('\n   Checking function registrations:');
        expectedFunctions.forEach(fn => {
            const isRegistered = content.includes(`${fn},`) || content.includes(`${fn} `);
            if (isRegistered) {
                foundFunctions.push(fn);
                console.log(`   ✓ ${fn}`);
            }
            else {
                missingFunctions.push(fn);
                console.log(`   ❌ ${fn} (MISSING)`);
            }
        });
        console.log(`\n   Found: ${foundFunctions.length}/10 functions`);
        console.log(`   Phase 1 (Student): ${foundFunctions.filter(f => expectedFunctions.slice(0, 5).includes(f)).length}/5`);
        console.log(`   Phase 2 (Advisor): ${foundFunctions.filter(f => expectedFunctions.slice(5).includes(f)).length}/5`);
        const passed = foundFunctions.length === 10;
        const message = passed
            ? '✅ All 10 functions registered'
            : `⚠️ Only ${foundFunctions.length}/10 functions registered`;
        return {
            category: 'Function Handlers',
            passed,
            message,
            details: missingFunctions.length > 0 ? [`Missing: ${missingFunctions.join(', ')}`] : undefined
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            category: 'Function Handlers',
            passed: false,
            message: `Error: ${error.message}`
        };
    }
}
// ============================================
// 3. Verify Context Detection Logic
// ============================================
function verifyContextDetection() {
    console.log('\n🎯 Verifying context detection logic...');
    console.log('─'.repeat(80));
    try {
        const aiControllerPath = path.join(__dirname, '../src/controllers/aiController.ts');
        const content = fs.readFileSync(aiControllerPath, 'utf-8');
        // Check for student context
        const hasStudentContext = content.includes('userType === \'student\'');
        console.log(`   ${hasStudentContext ? '✓' : '❌'} Student context detection`);
        // Check for advisor context
        const hasAdvisorContext = content.includes('userType === \'advisor\'');
        console.log(`   ${hasAdvisorContext ? '✓' : '❌'} Advisor context detection`);
        // Check for student function declarations
        const hasStudentFunctions = content.includes('studentFunctionDeclarations');
        console.log(`   ${hasStudentFunctions ? '✓' : '❌'} Student function declarations`);
        // Check for advisor function declarations
        const hasAdvisorFunctions = content.includes('advisorFunctionDeclarations');
        console.log(`   ${hasAdvisorFunctions ? '✓' : '❌'} Advisor function declarations`);
        // Check for context object with advisorId
        const hasAdvisorIdInContext = content.includes('advisorId:');
        console.log(`   ${hasAdvisorIdInContext ? '✓' : '❌'} advisorId in context`);
        // Check for context object with studentId
        const hasStudentIdInContext = content.includes('studentId:');
        console.log(`   ${hasStudentIdInContext ? '✓' : '❌'} studentId in context`);
        const passed = hasStudentContext && hasAdvisorContext &&
            hasStudentFunctions && hasAdvisorFunctions &&
            hasAdvisorIdInContext && hasStudentIdInContext;
        const message = passed
            ? '✅ Context detection logic properly implemented'
            : '⚠️ Context detection logic incomplete';
        return {
            category: 'Context Detection',
            passed,
            message
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            category: 'Context Detection',
            passed: false,
            message: `Error: ${error.message}`
        };
    }
}
// ============================================
// 4. Verify Cross-Context Support
// ============================================
function verifyCrossContextSupport() {
    console.log('\n🔄 Verifying cross-context support...');
    console.log('─'.repeat(80));
    try {
        const aiControllerPath = path.join(__dirname, '../src/controllers/aiController.ts');
        const content = fs.readFileSync(aiControllerPath, 'utf-8');
        // Check if advisors get both student and advisor functions
        const advisorSection = content.substring(content.indexOf('userType === \'advisor\''), content.indexOf('userType === \'student\''));
        const hasCrossContext = advisorSection.includes('studentFunctionDeclarations') &&
            advisorSection.includes('advisorFunctionDeclarations');
        console.log(`   ${hasCrossContext ? '✓' : '❌'} Advisors have access to both student and advisor functions`);
        // Check if spread operator is used to combine functions
        const hasSpreadOperator = advisorSection.includes('[...studentFunctionDeclarations, ...advisorFunctionDeclarations]') ||
            advisorSection.includes('...studentFunctionDeclarations') &&
                advisorSection.includes('...advisorFunctionDeclarations');
        console.log(`   ${hasSpreadOperator ? '✓' : '❌'} Functions combined using spread operator`);
        // Check that students only get student functions
        const studentSection = content.substring(content.indexOf('userType === \'student\''), content.length);
        const studentsOnlyGetStudentFunctions = studentSection.includes('availableFunctions = studentFunctionDeclarations');
        console.log(`   ${studentsOnlyGetStudentFunctions ? '✓' : '❌'} Students only get student functions`);
        const passed = hasCrossContext && hasSpreadOperator && studentsOnlyGetStudentFunctions;
        const message = passed
            ? '✅ Cross-context support properly implemented'
            : '⚠️ Cross-context support incomplete';
        return {
            category: 'Cross-Context Support',
            passed,
            message,
            details: [
                `Advisors get both contexts: ${hasCrossContext}`,
                `Students get student context only: ${studentsOnlyGetStudentFunctions}`
            ]
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            category: 'Cross-Context Support',
            passed: false,
            message: `Error: ${error.message}`
        };
    }
}
// ============================================
// 5. Verify Database Schema for Advisor Functions
// ============================================
function verifyDatabaseSchema() {
    console.log('\n🗄️ Verifying database schema for advisor functions...');
    console.log('─'.repeat(80));
    try {
        const requiredTables = [
            'advisor_assignments',
            'students',
            'advisors',
            'conversations',
            'ai_chat_history',
            'levels',
            'sections'
        ];
        const existingTables = [];
        const missingTables = [];
        console.log('   Checking required tables:');
        requiredTables.forEach(table => {
            const exists = database_1.db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name=?
      `).get(table);
            if (exists) {
                existingTables.push(table);
                console.log(`   ✓ ${table}`);
            }
            else {
                missingTables.push(table);
                console.log(`   ❌ ${table} (MISSING)`);
            }
        });
        console.log(`\n   Found: ${existingTables.length}/${requiredTables.length} tables`);
        const passed = missingTables.length === 0;
        const message = passed
            ? '✅ All required tables exist'
            : `⚠️ Missing tables: ${missingTables.join(', ')}`;
        return {
            category: 'Database Schema',
            passed,
            message,
            details: missingTables.length > 0 ? [`Missing: ${missingTables.join(', ')}`] : undefined
        };
    }
    catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return {
            category: 'Database Schema',
            passed: false,
            message: `Error: ${error.message}`
        };
    }
}
// ============================================
// MAIN VERIFICATION EXECUTION
// ============================================
console.log('\n========================================');
console.log('  PHASE 2 INTEGRATION VERIFICATION');
console.log('========================================');
// Run all verifications
results.push(verifyAcademicThresholds());
results.push(verifyFunctionHandlers());
results.push(verifyContextDetection());
results.push(verifyCrossContextSupport());
results.push(verifyDatabaseSchema());
// ============================================
// SUMMARY REPORT
// ============================================
console.log('\n========================================');
console.log('  VERIFICATION SUMMARY');
console.log('========================================\n');
const totalChecks = results.length;
const passedChecks = results.filter(r => r.passed).length;
const failedChecks = totalChecks - passedChecks;
console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks} ✅`);
console.log(`Failed: ${failedChecks} ${failedChecks > 0 ? '❌' : ''}`);
console.log(`Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
console.log('\n📋 Verification Results:\n');
results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.category}: ${status}`);
    console.log(`   ${result.message}`);
    if (result.details) {
        result.details.forEach(detail => {
            console.log(`   • ${detail}`);
        });
    }
    console.log('');
});
console.log('========================================');
if (passedChecks === totalChecks) {
    console.log('  ✅ ALL VERIFICATIONS PASSED!');
    console.log('  Phase 2 is fully integrated.');
}
else {
    console.log('  ⚠️ SOME VERIFICATIONS FAILED');
    console.log('  Please review the issues above.');
}
console.log('========================================\n');
// Exit with error code if any checks failed
if (failedChecks > 0) {
    process.exit(1);
}
