"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const tableInfo = database_1.db.prepare("PRAGMA table_info(student_courses)").all();
console.log('\n📊 Complete student_courses table structure:');
console.log('============================================');
console.log(`Total columns: ${tableInfo.length}\n`);
tableInfo.forEach((col, index) => {
    console.log(`${(index + 1).toString().padStart(2)}) ${col.name.padEnd(30)} ${col.type.padEnd(10)} ${col.notnull ? 'NOT NULL' : ''}`);
});
console.log('\n============================================\n');
