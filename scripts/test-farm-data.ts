// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://gvjswplhfjcreqbrgwhr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlb25sdGlpZGxucGd2YW53dmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzgzMzAsImV4cCI6MjA3Njc1NDMzMH0.0DS5-ILmlYMYygWrJKfyv2qcS-5kS505KmM4vZPKtX8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testFarmData() {
  console.log('Testing farm data retrieval...');
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      return;
    }
    
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user authenticated. Please log in first.');
      return;
    }
    
    // Check user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
    } else {
      console.log('User profile:', profile);
    }
    
    // Try to fetch farms
    console.log('Fetching farms...');
    const { data: farms, error } = await supabase
      .from('farms')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching farms:', error);
      return;
    }
    
    console.log('Farms fetched successfully:');
    console.log('Total farms:', farms.length);
    console.log('Farms data:', farms);
    
    if (farms.length > 0) {
      console.log('Sample farm:', farms[0]);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testFarmData();