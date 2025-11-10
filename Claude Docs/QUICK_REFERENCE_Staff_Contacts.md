# Staff Contacts Quick Reference Guide

## Table of Contents
1. [Running Migrations](#running-migrations)
2. [Testing the System](#testing-the-system)
3. [Staff Directory](#staff-directory)
4. [Common Queries](#common-queries)
5. [Troubleshooting](#troubleshooting)

---

## Running Migrations

### Initial Setup (Already Done)
```bash
cd backend
npx tsx scripts/add-staff-contacts.ts
```

### Verify Installation
```bash
npx tsx scripts/verify-staff-contacts-integration.ts
```

### Test Search Functionality
```bash
npx tsx scripts/test-staff-contacts.ts
```

---

## Testing the System

### Start Backend Server
```bash
cd backend
npm run dev
```

### Test AI Function
Send POST request to `/api/ai/chat`:
```json
{
  "message": "I have registration problems, who should I contact?"
}
```

---

## Staff Directory

### Registration Office (3 Staff)
| Name | Role | Email | Phone |
|------|------|-------|-------|
| Fatima Al-Rashid | Registrar | fatima.rashid@mentorlink.edu | +962-6-555-0101 |
| Hassan Al-Mansoori | Assistant Registrar | hassan.mansoori@mentorlink.edu | +962-6-555-0102 |
| Mariam Al-Khalifa | Registration Coordinator | mariam.khalifa@mentorlink.edu | +962-6-555-0103 |

**Keywords:** registration, add/drop, enrollment, transcript, schedule conflict

---

### IT Support (3 Staff)
| Name | Role | Email | Phone |
|------|------|-------|-------|
| Omar Al-Sayed | IT Support Manager | omar.sayed@mentorlink.edu | +962-6-555-0201 |
| Layla Mansour | Tech Support Specialist | layla.mansour@mentorlink.edu | +962-6-555-0202 |
| Youssef Karim | Network Administrator | youssef.karim@mentorlink.edu | +962-6-555-0203 |

**Keywords:** IT, technical, password, login, account, email, network, wifi

---

### Financial Aid (2 Staff)
| Name | Role | Email | Phone |
|------|------|-------|-------|
| Amina Hassan | Financial Aid Director | amina.hassan@mentorlink.edu | +962-6-555-0301 |
| Waleed Ibrahim | Financial Aid Counselor | waleed.ibrahim@mentorlink.edu | +962-6-555-0302 |

**Keywords:** financial, scholarship, payment, tuition, billing, refund

---

### Academic Affairs (2 Staff)
| Name | Role | Email | Phone |
|------|------|-------|-------|
| Dina Al-Sabah | Dean of Academic Affairs | dina.sabah@mentorlink.edu | +962-6-555-0401 |
| Bassam Al-Nahyan | Academic Coordinator | bassam.nahyan@mentorlink.edu | +962-6-555-0402 |

**Keywords:** academic, probation, grade appeal, major change, transfer credits

---

### Student Services (2 Staff)
| Name | Role | Email | Phone |
|------|------|-------|-------|
| Samira Yousef | Student Services Director | samira.yousef@mentorlink.edu | +962-6-555-0501 |
| Huda Salem | Student Life Coordinator | huda.salem@mentorlink.edu | +962-6-555-0502 |

**Keywords:** counseling, wellness, disability, student clubs, activities

---

### Career Services (2 Staff)
| Name | Role | Email | Phone |
|------|------|-------|-------|
| Fahad Nasser | Career Services Director | fahad.nasser@mentorlink.edu | +962-6-555-0601 |
| Salma Mahmoud | Internship Coordinator | salma.mahmoud@mentorlink.edu | +962-6-555-0602 |

**Keywords:** career, job, internship, resume, interview, co-op

---

### Library Services (2 Staff)
| Name | Role | Email | Phone |
|------|------|-------|-------|
| Leena Al-Rahman | Head Librarian | leena.rahman@mentorlink.edu | +962-6-555-0701 |
| Ali Al-Masri | Digital Resources Librarian | ali.masri@mentorlink.edu | +962-6-555-0702 |

**Keywords:** library, research, database, books, citation, resources

---

### International Office (2 Staff)
| Name | Role | Email | Phone |
|------|------|-------|-------|
| Sana Al-Khalil | International Student Advisor | sana.khalil@mentorlink.edu | +962-6-555-0801 |
| Ibrahim Al-Nasser | Study Abroad Coordinator | ibrahim.nasser@mentorlink.edu | +962-6-555-0802 |

**Keywords:** visa, immigration, international, study abroad, travel signature

---

### Facilities Management (2 Staff)
| Name | Role | Email | Phone |
|------|------|-------|-------|
| Reem Al-Said | Facilities Manager | reem.said@mentorlink.edu | +962-6-555-0901 |
| Jamal Hussein | Campus Safety Officer | jamal.hussein@mentorlink.edu | +962-6-555-0902 |

**Keywords:** facilities, parking, maintenance, safety, security, lost and found

---

## Common Queries

### Registration Issues
```
"I need to add a course"
"Drop course after deadline"
"Course is full, how to get in?"
"Registration system error"
"Schedule conflict help"
```
**→ Returns Registration Office staff**

---

### Technical Problems
```
"Forgot my password"
"Can't login to account"
"Email not working"
"LMS access problem"
"WiFi not connecting"
```
**→ Returns IT Support staff**

---

### Financial Questions
```
"How to apply for scholarships?"
"Payment plan setup"
"Tuition deadline extension"
"Refund request"
"Financial aid eligibility"
```
**→ Returns Financial Aid staff**

---

### Academic Issues
```
"On academic probation, what to do?"
"Grade appeal process"
"Want to change my major"
"Transfer credit evaluation"
"Academic integrity issue"
```
**→ Returns Academic Affairs staff**

---

### Career & Internships
```
"Need help with resume"
"Looking for internship"
"Career counseling"
"Job search strategies"
"Interview preparation"
```
**→ Returns Career Services staff**

---

### International Student Matters
```
"Visa renewal help"
"Immigration documents"
"Study abroad programs"
"Travel signature needed"
"International student orientation"
```
**→ Returns International Office staff**

---

## Troubleshooting

### No Results Returned
**Cause:** Query too specific or misspelled
**Solution:** Use more general terms like "registration", "IT", "financial"

### Wrong Staff Returned
**Cause:** Query matches multiple categories
**Solution:** Be more specific: "registration deadline" instead of just "deadline"

### Database Connection Error
**Cause:** Database not accessible
**Solution:**
```bash
cd backend
# Check database exists
ls -la mentorlink.db

# Test connection
npx tsx -e "import {db} from './src/config/database.js'; console.log(db.prepare('SELECT 1').get())"
```

### Function Not Working in AI
**Cause:** Backend server not running or function not registered
**Solution:**
```bash
# Restart backend
cd backend
npm run dev

# Check function is registered
grep -n "getStaffContact" src/controllers/aiController.ts
```

---

## Quick SQL Queries

### View All Staff
```sql
SELECT name, role, email, category FROM staff_contacts ORDER BY category, name;
```

### Count by Category
```sql
SELECT category, COUNT(*) as count FROM staff_contacts GROUP BY category;
```

### Search by Keyword
```sql
SELECT name, role, email
FROM staff_contacts
WHERE responsibilities LIKE '%registration%';
```

### Update Contact Info
```sql
UPDATE staff_contacts
SET email = 'new.email@mentorlink.edu'
WHERE name = 'Staff Name';
```

### Add New Staff
```sql
INSERT INTO staff_contacts (
  name, role, department, email, phone,
  office_location, office_hours, responsibilities, category
) VALUES (
  'New Staff Name',
  'New Role',
  'Department',
  'email@mentorlink.edu',
  '+962-6-555-XXXX',
  'Building, Room XXX',
  'Sunday-Thursday 9:00 AM - 4:00 PM',
  'Handles X, Y, Z responsibilities',
  'category'
);
```

---

## Emergency Contacts

### Campus Security (24/7)
- **Name:** Jamal Hussein - Campus Safety Officer
- **Phone:** +962-6-555-0902
- **Emergency:** 0999
- **Location:** Security Office, Main Gate

---

## File Locations

### Migration Files
```
database/migrations/add_staff_contacts_table.sql
```

### Scripts
```
backend/scripts/add-staff-contacts.ts
backend/scripts/test-staff-contacts.ts
backend/scripts/verify-staff-contacts-integration.ts
```

### Controller
```
backend/src/controllers/aiController.ts
```

### Documentation
```
Claude Docs/Phase_1.3_Staff_Contacts_Implementation.md
Claude Docs/IMPLEMENTATION_SUMMARY_Phase_1.3.md
Claude Docs/QUICK_REFERENCE_Staff_Contacts.md (this file)
```

---

## Support

### For Technical Issues
Contact: Omar Al-Sayed (omar.sayed@mentorlink.edu)

### For System Issues
Check logs:
```bash
cd backend
npm run dev
# Watch console for [getStaffContact] logs
```

### For Data Updates
Modify: `database/migrations/add_staff_contacts_table.sql`
Re-run: `npx tsx scripts/add-staff-contacts.ts`

---

**Last Updated:** November 7, 2025
**Version:** 1.0
**Status:** Production Ready
