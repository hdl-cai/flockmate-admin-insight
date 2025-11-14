// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

// Configuration - replace with your actual values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gvjswplhfjcreqbrgwhr.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2anN3cGxoZmpjcmVxYnJnd2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzM4ODMsImV4cCI6MjA3ODUwOTg4M30.LUFTyhoRrEhaGl7ibfFzfYfEbTPOL0bH0IOVU-Fnyz4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testDatabaseConnection() {
  console.log('=== Database Connection Test ===');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data, error } = await supabase.rpc('uuid_generate_v4');
    if (error) {
      console.error('   ❌ Connection failed:', error.message);
      return;
    }
    console.log('   ✅ Connection successful');
    
    // Test 2: Check authentication status
    console.log('2. Checking authentication status...');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('   ✅ Authenticated as:', user.email);
    } else {
      console.log('   ❌ Not authenticated');
      return;
    }
    
    // Test 3: Check user profile
    console.log('3. Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('   ❌ Profile fetch failed:', profileError.message);
      return;
    }
    console.log('   ✅ Profile found:', profile);
    
    // Test 4: Check if user is admin
    console.log('4. Checking user permissions...');
    if (profile.role === 'admin') {
      console.log('   ✅ User has admin privileges');
    } else {
      console.log('   ⚠️  User is not admin (role:', profile.role, ')');
    }
    
    // Test 5: Test farms table access
    console.log('5. Testing farms table access...');
    
    // Try to read farms
    const { data: farms, error: farmsReadError } = await supabase
      .from('farms')
      .select('id, name, location, capacity, status')
      .limit(5);
    
    if (farmsReadError) {
      console.error('   ❌ Farms read failed:', farmsReadError.message);
    } else {
      console.log('   ✅ Farms read successful. Found', farms.length, 'farms');
      farms.forEach(farm => {
        console.log('     -', farm.name, 'in', farm.location);
      });
    }
    
    // Test 6: Try to insert a test farm
    console.log('6. Testing farm insertion...');
    const testFarm = {
      name: 'Test Farm ' + Date.now(),
      location: 'Test Location',
      capacity: 1000,
      status: 'active'
    };
    
    const { data: insertedFarm, error: insertError } = await supabase
      .from('farms')
      .insert(testFarm)
      .select()
      .single();
    
    if (insertError) {
      console.error('   ❌ Farm insertion failed:', insertError.message);
      console.log('   Error details:', insertError);
    } else {
      console.log('   ✅ Farm inserted successfully:', insertedFarm.name);
      
      // Clean up - delete the test farm
      console.log('7. Cleaning up test farm...');
      const { error: deleteError } = await supabase
        .from('farms')
        .delete()
        .eq('id', insertedFarm.id);
      
      if (deleteError) {
        console.error('   ❌ Cleanup failed:', deleteError.message);
      } else {
        console.log('   ✅ Test farm cleaned up successfully');
      }
    }
    
    console.log('=== Test Complete ===');
    
  } catch (error) {
    console.error('Unexpected error during database test:', error);
  }
}

// Run the test
testDatabaseConnection();