// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
config();

// Try to read from .env file directly as fallback
let envConfig = {};
try {
  const envPath = resolve(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envConfig[key.trim()] = value.trim().replace(/"/g, '');
    }
  });
} catch (error) {
  console.log('Could not read .env file directly');
}

// Get environment variables with fallbacks
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || envConfig.VITE_SUPABASE_URL || 'https://gvjswplhfjcreqbrgwhr.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || envConfig.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2anN3cGxoZmpjcmVxYnJnd2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzM4ODMsImV4cCI6MjA3ODUwOTg4M30.LUFTyhoRrEhaGl7ibfFzfYfEbTPOL0bH0IOVU-Fnyz4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyDatabaseSchema() {
  console.log('🔍 Verifying database schema...');
  
  // List of required tables
  const requiredTables = [
    'profiles',
    'farms',
    'financial_data',
    'cost_breakdown',
    'farm_performance',
    'alerts',
    'dashboard_metrics'
  ];
  
  try {
    // Get list of tables in the public schema
    console.log(' Checking database schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Error fetching table list:', tablesError.message);
      return;
    }
    
    const tableNames = tables.map(table => table.table_name);
    console.log(` Found ${tableNames.length} tables in public schema`);
    
    // Check each required table
    console.log('\n📋 Required tables verification:');
    let allTablesPresent = true;
    
    for (const tableName of requiredTables) {
      if (tableNames.includes(tableName)) {
        console.log(`✅ ${tableName}`);
      } else {
        console.log(`❌ ${tableName} (MISSING)`);
        allTablesPresent = false;
      }
    }
    
    if (!allTablesPresent) {
      console.log('\n⚠️  Some required tables are missing from the database.');
      console.log('   Please run the database migration scripts to create the tables.');
      console.log('   Check the supabase/migrations directory for SQL migration files.');
    }
    
    // Check RLS status for each table
    console.log('\n🔐 Row Level Security verification:');
    for (const tableName of requiredTables) {
      if (tableNames.includes(tableName)) {
        try {
          // Check if RLS is enabled
          const { data: rlsData, error: rlsError } = await supabase
            .rpc('rls_status', { table_name: tableName });
          
          if (rlsError) {
            // If the rpc doesn't exist, we'll check another way
            console.log(`ℹ️  ${tableName} (RLS status check not available)`);
          } else {
            console.log(`✅ ${tableName} (RLS: ${rlsData.enabled ? 'Enabled' : 'Disabled'})`);
          }
        } catch (error) {
          console.log(`ℹ️  ${tableName} (RLS status check not available)`);
        }
      }
    }
    
    // Test basic operations on each table
    console.log('\n🧪 Basic operations test:');
    
    // Test profiles table
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (profilesError) {
        console.log('❌ profiles: Read operation failed -', profilesError.message);
      } else {
        console.log('✅ profiles: Read operation successful');
      }
    } catch (error) {
      console.log('❌ profiles: Read operation failed -', error.message);
    }
    
    // Test farms table
    try {
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select('id')
        .limit(1);
      
      if (farmsError) {
        console.log('❌ farms: Read operation failed -', farmsError.message);
      } else {
        console.log('✅ farms: Read operation successful');
      }
    } catch (error) {
      console.log('❌ farms: Read operation failed -', error.message);
    }
    
    // Test financial_data table
    try {
      const { data: financialData, error: financialError } = await supabase
        .from('financial_data')
        .select('id')
        .limit(1);
      
      if (financialError) {
        console.log('❌ financial_data: Read operation failed -', financialError.message);
      } else {
        console.log('✅ financial_data: Read operation successful');
      }
    } catch (error) {
      console.log('❌ financial_data: Read operation failed -', error.message);
    }
    
    console.log('\n🔍 Schema verification complete!');
    
    if (allTablesPresent) {
      console.log('✅ All required tables are present in the database');
    } else {
      console.log('❌ Some required tables are missing');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during schema verification:', error);
  }
}

// Run the verification
verifyDatabaseSchema();