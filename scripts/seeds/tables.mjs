// File: scripts/seeds/tables.mjs

import { neon } from '@neondatabase/serverless';
import 'dotenv/config'; // <-- 1. Import and configure dotenv

// 2. Make sure your DATABASE_URL is in the .env file
const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  console.log('Attempting to create "Persona" table...');
  try {
    // 3. The SQL command to create the table
    await sql`
      CREATE TABLE IF NOT EXISTS "Persona" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "key" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "instruction" TEXT NOT NULL,
          "types" TEXT[] NOT NULL,
          "categories" TEXT[] NOT NULL,
          "isDefault" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ "Persona" table created successfully (or already exists).');

    // You can add more table creation queries here in the future
    // For example:
    // await sql`CREATE TABLE IF NOT EXISTS "User" (...)`;
    // console.log('✅ "User" table created successfully.');

  } catch (error) {
    console.error('🔴 Error creating tables:', error.message);
    // Exit with a non-zero code to indicate an error
    process.exit(1); 
  }
}

// 4. Run the function
createTables();