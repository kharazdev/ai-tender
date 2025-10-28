// File: scripts/seeds/tables.mjs
// --- MODIFIED FILE ---

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  try {
    console.log('Attempting to create "Persona" table...');
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

    // --- NEW CODE START ---
    console.log('Attempting to create "Settings" table...');
    await sql`
        CREATE TABLE IF NOT EXISTS "Settings" (
            "key" TEXT NOT NULL PRIMARY KEY,
            "value" TEXT NOT NULL,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `;
    console.log('✅ "Settings" table created successfully (or already exists).');
    // --- NEW CODE END ---


  } catch (error) {
    console.error('🔴 Error creating tables:', error.message);
    process.exit(1); 
  }
}

createTables();