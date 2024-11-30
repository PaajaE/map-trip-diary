import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL.startsWith('http') 
    ? process.env.VITE_SUPABASE_URL 
    : `https://${process.env.VITE_SUPABASE_URL}`,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', timestamp);

  try {
    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true });
    console.log(`Created backup directory: ${backupDir}`);

    // Backup tables
    const tables = ['trips', 'photos', 'tags', 'trip_tags'];
    
    for (const table of tables) {
      console.log(`Backing up ${table}...`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        throw error;
      }

      await fs.writeFile(
        path.join(backupDir, `${table}.json`),
        JSON.stringify(data, null, 2)
      );
      console.log(`✓ ${table} backed up successfully (${data.length} records)`);
    }

    // Backup storage
    console.log('\nBacking up storage...');
    
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw bucketsError;
    }

    for (const bucket of buckets) {
      console.log(`Processing bucket: ${bucket.name}`);
      
      const { data: files, error: filesError } = await supabase
        .storage
        .from(bucket.name)
        .list('', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (filesError) {
        console.error(`Error listing files in ${bucket.name}:`, filesError);
        throw filesError;
      }

      // Get signed URLs for all files
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          if (!file.name) return file;

          const { data } = await supabase
            .storage
            .from(bucket.name)
            .createSignedUrl(file.name, 60 * 60 * 24); // 24 hours

          return {
            ...file,
            signedUrl: data?.signedUrl
          };
        })
      );

      await fs.writeFile(
        path.join(backupDir, `storage-${bucket.name}.json`),
        JSON.stringify(filesWithUrls, null, 2)
      );
      console.log(`✓ Storage bucket ${bucket.name} backed up (${files.length} files)`);
    }

    // Save schema
    console.log('\nBacking up schema...');
    await fs.copyFile(
      path.join(__dirname, '..', 'src', 'services', 'supabase', 'schema.sql'),
      path.join(backupDir, 'schema.sql')
    );
    console.log('✓ Schema backed up successfully');

    console.log(`\n✨ Backup completed successfully!\nFiles saved to: ${backupDir}`);
  } catch (error) {
    console.error('\n❌ Backup failed:', error);
    process.exit(1);
  }
}

backupDatabase();