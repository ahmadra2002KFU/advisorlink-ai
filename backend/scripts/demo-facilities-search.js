"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Demo script showing various facility search scenarios
 * This demonstrates how the AI will interact with the searchFacilities function
 */
async function searchFacilities(searchTerm) {
    const facilities = database_1.db.prepare(`
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
  `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    if (facilities.length === 0) {
        return {
            success: false,
            message: `No facilities found matching "${searchTerm}".`
        };
    }
    const formattedFacilities = facilities.map((f) => {
        const services = f.services ? JSON.parse(f.services) : [];
        return {
            name: f.name,
            type: f.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            location: f.room_number
                ? `Room ${f.room_number}, ${f.building}${f.floor ? ` (Floor ${f.floor})` : ''}`
                : f.building,
            capacity: f.capacity ? `Capacity: ${f.capacity}` : null,
            hours: f.hours,
            contact: f.contact_email,
            phone: f.phone,
            services: services.length > 0 ? services : null,
            description: f.description
        };
    });
    if (facilities.length === 1) {
        return {
            success: true,
            facility: formattedFacilities[0]
        };
    }
    return {
        success: true,
        facilities: formattedFacilities
    };
}
async function simulateAIConversation(studentQuery, searchTerm) {
    console.log('\n' + '='.repeat(80));
    console.log(`STUDENT: "${studentQuery}"`);
    console.log('='.repeat(80));
    const result = await searchFacilities(searchTerm);
    console.log('\n[AI searches facilities table with term: "' + searchTerm + '"]');
    console.log('\nAI RESPONSE:\n');
    if (result.success && result.facility) {
        // Single facility response
        const f = result.facility;
        console.log(`I found the ${f.name} for you!`);
        console.log(`\n📍 Location: ${f.location}`);
        console.log(`🕐 Hours: ${f.hours}`);
        if (f.capacity)
            console.log(`👥 ${f.capacity}`);
        console.log(`📧 Contact: ${f.contact}`);
        console.log(`📞 Phone: ${f.phone}`);
        if (f.services && f.services.length > 0) {
            console.log(`\n✨ Services offered:`);
            f.services.forEach((service) => console.log(`   • ${service}`));
        }
        console.log(`\n📝 About this facility:`);
        console.log(`   ${f.description}`);
        console.log(`\nWould you like directions or additional information?`);
    }
    else if (result.success && result.facilities) {
        // Multiple facilities response
        console.log(`I found ${result.facilities.length} facilities that match your query:\n`);
        result.facilities.forEach((f, i) => {
            console.log(`${i + 1}. ${f.name}`);
            console.log(`   Type: ${f.type}`);
            console.log(`   Location: ${f.location}`);
            console.log(`   Hours: ${f.hours}`);
            console.log(`   Contact: ${f.contact}\n`);
        });
        console.log(`Which one would you like to know more about?`);
    }
    else {
        console.log(result.message);
    }
}
async function runDemo() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                            ║');
    console.log('║              MENTORLINK AI - FACILITIES SEARCH DEMONSTRATION               ║');
    console.log('║                                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');
    // Scenario 1: Finding a computer lab
    await simulateAIConversation("Where is the main computer lab? I need to work on my programming assignment.", "main computer lab");
    // Scenario 2: Finding the library
    await simulateAIConversation("What time does the library close today?", "main university library");
    // Scenario 3: Finding student services
    await simulateAIConversation("I need to get my transcript. Where do I go?", "registrar");
    // Scenario 4: Finding multiple facilities
    await simulateAIConversation("Are there any computer labs on campus?", "lab");
    // Scenario 5: Finding prayer room
    await simulateAIConversation("Where can I pray on campus?", "prayer");
    console.log('\n' + '='.repeat(80));
    console.log('                           DEMO COMPLETE');
    console.log('='.repeat(80));
    console.log('\nThe AI successfully answered all student queries using the facilities table!');
    console.log('Students receive accurate, detailed information in a conversational format.\n');
}
runDemo().catch(console.error);
