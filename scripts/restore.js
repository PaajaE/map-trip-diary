import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Note: Use service role key for full access
);

async function restoreDatabase(backupDir) {
  try {
    console.log('Starting database restore...');

    // First apply schema
    const schema = await fs.readFile(
      path.join(backupDir, 'schema.sql'),
      'utf-8'
    );
    
    // Execute schema through Supabase dashboard or CLI
    console.log('Please apply schema.sql through Supabase dashboard first');

    // Restore data
    const tables = ['tags', 'trips', 'photos', 'trip_tags']; // Order matters for foreign keys
    
    for (const table of tables) {
      console.log(`Restoring ${table}...`);
      
      const data = JSON.parse(
        await fs.readFile(
          path.join(backupDir, `${table}.json`),
          'utf-8'
        )
      );

      if (data.length > 0) {
        const { error } = await supabase
          .from(table)
          .insert(data);

        if (error) throw error;
      }
    }

    console.log('Restore completed successfully!');
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
}

// Get backup directory from command line argument
const backupDir = process.argv[2];
if (!backupDir) {
  console.error('Please provide backup directory path');
  process.exit(1);
}

restoreDatabase(backupDir);