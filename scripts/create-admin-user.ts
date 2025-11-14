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

// Use service role key for admin operations
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Service Role Key not found!');
  console.log('   Please add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.log('   Run "npm run get-service-key" for instructions');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdminUser() {
  console.log('👤 Creating admin user...');
  
  // You can customize these values
  const adminEmail = 'admin@flockmate.com';
  const adminPassword = 'FlockmateAdmin123!';
  const adminFullName = 'Flockmate Administrator';
  
  try {
    console.log(` Creating admin user with email: ${adminEmail}`);
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Skip email confirmation
      user_metadata: { 
        full_name: adminFullName 
      }
    });
    
    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('⚠️  Admin user already exists');
        // Get the existing user
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) {
          console.log('❌ Error fetching users:', usersError.message);
          return;
        }
        
        const existingUser = users.users.find(user => user.email === adminEmail);
        if (existingUser) {
          console.log(`   User ID: ${existingUser.id}`);
        }
      } else {
        console.log('❌ Error creating auth user:', authError.message);
        return;
      }
    } else {
      console.log('✅ Auth user created successfully');
      console.log(`   User ID: ${authData.user.id}`);
    }
    
    // Now create or update the profile in the profiles table
    console.log(' Creating/updating profile in database...');
    
    // First, check if profile already exists
    let userId = '';
    if (authData && authData.user) {
      userId = authData.user.id;
    } else {
      // If user already existed, we need to get their ID
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      if (!usersError) {
        const existingUser = users.users.find(user => user.email === adminEmail);
        if (existingUser) {
          userId = existingUser.id;
        }
      }
    }
    
    if (userId) {
      // Create or update the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: adminEmail,
          full_name: adminFullName,
          role: 'admin'
        }, {
          onConflict: 'id'
        })
        .select();
      
      if (profileError) {
        console.log('❌ Error creating profile:', profileError.message);
      } else {
        console.log('✅ Profile created/updated successfully');
        console.log(`   Profile ID: ${profileData[0].id}`);
        console.log(`   Role: ${profileData[0].role}`);
      }
    }
    
    console.log('\n✅ Admin user setup complete!');
    console.log('   You can now log in to the application with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Unexpected error during admin user creation:', error);
  }
}

// Run the script
createAdminUser();