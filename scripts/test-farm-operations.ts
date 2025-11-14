import { createClient } from '@supabase/supabase-js';

// Configuration - replace with your actual values
const SUPABASE_URL = 'https://gvjswplhfjcreqbrgwhr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlb25sdGlpZGxucGd2YW53dmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzgzMzAsImV4cCI6MjA3Njc1NDMzMH0.0DS5-ILmlYMYygWrJKfyv2qcS-5kS505KmM4vZPKtX8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testFarmOperations() {
  console.log('Testing farm operations...');
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user);
  
  if (!user) {
    console.log('No user authenticated');
    return;
  }
  
  // Check user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  console.log('User profile:', profile);
  console.log('Profile error:', profileError);
  
  if (profileError) {
    console.log('Error fetching profile:', profileError);
    return;
  }
  
  // Test farm insertion
  const testFarm = {
    name: 'Test Farm',
    location: 'Test Location',
    capacity: 1000,
    status: 'active'
  };
  
  console.log('Attempting to insert test farm:', testFarm);
  
  const { data, error } = await supabase
    .from('farms')
    .insert(testFarm)
    .select()
    .single();
  
  console.log('Insert result:', data);
  console.log('Insert error:', error);
  
  if (error) {
    console.log('Failed to insert farm:', error);
    
    // Try to fetch farms to see if we have read permissions
    const { data: farms, error: fetchError } = await supabase
      .from('farms')
      .select('*');
    
    console.log('Fetch farms result:', farms);
    console.log('Fetch farms error:', fetchError);
  } else {
    console.log('Successfully inserted farm:', data);
    
    // Clean up - delete the test farm
    if (data && data.id) {
      const { error: deleteError } = await supabase
        .from('farms')
        .delete()
        .eq('id', data.id);
      
      console.log('Cleanup delete error:', deleteError);
    }
  }
}

// Run the test
testFarmOperations().catch(console.error);