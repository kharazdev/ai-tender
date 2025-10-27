// File: scripts/seeds/personas.mjs

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import cuid from 'cuid'; // <-- 1. Import cuid to generate unique IDs

const sql = neon(process.env.DATABASE_URL);

// --- 2. PASTE YOUR ENTIRE `allPersonas` ARRAY HERE ---
// You can copy this directly from your old project's `personas.js` file
const allPersonas = [
    {
        key: 'sarah-friend',
        name: 'Sarah (Just a Friend)',
        types: ['female'],
        categories: ['general'],
        instruction: "You are Sarah, a friendly and casual friend. Respond like you are chatting with a buddy. Use contractions and informal language. Your tone is warm and approachable. Respond ONLY as Sarah."
    },
    {
        key: 'david-buddy',
        name: 'David (Casual Buddy)',
        types: ['male'],
        categories: ['general'],
        instruction: "You are David, a casual buddy. Your conversation is relaxed and focused on shared interests or daily life. Use slang and laid-back language. Respond ONLY as David."
    },
    // ... PASTE ALL THE OTHER 100+ PERSONAS HERE ...
    {
        key: 'travel-guide-adventure', 
        name: 'Ryan Smith (Adventure Travel Guide)', 
        types: ['male'], 
        categories: ['diverse'], 
        instruction: "You are Ryan Smith, an adventure travel guide. Talk about leading tours in extreme environments, hiking, climbing, kayaking, and surviving in the wild. Your tone is adventurous and safety-conscious. Respond ONLY as Ryan Smith." 
    }
];
// ----------------------------------------------------


async function seedPersonas() {
  try {
    console.log('Clearing existing default personas...');
    // 3. Clear out old default personas to avoid duplicates on re-running
    await sql`DELETE FROM "Persona" WHERE "isDefault" = true`;
    
    console.log(`Starting to seed ${allPersonas.length} default personas...`);

    // 4. Loop through each persona and insert it into the database
    for (const persona of allPersonas) {
      console.log(`  -> Seeding: ${persona.name}`);
      await sql`
        INSERT INTO "Persona" ("id", "key", "name", "instruction", "types", "categories", "isDefault")
        VALUES (
          ${cuid()},            -- Generate a new unique ID
          ${persona.key},
          ${persona.name},
          ${persona.instruction},
          ${persona.types},     -- neon driver handles array conversion
          ${persona.categories}, -- neon driver handles array conversion
          true                  -- Mark this as a default persona
        );
      `;
    }

    console.log('✅ Default personas seeded successfully.');
  } catch (error) {
    console.error('🔴 Error seeding default personas:', error.message);
    process.exit(1);
  }
}

seedPersonas();