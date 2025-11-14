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

// Use service role key for bypassing RLS policies (this should only be used in scripts, never in frontend code)
// The service role key is different from the anon key and has full access to the database
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY;

// Fallback to anon key if service role key is not available (less secure but might work for testing)
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
                    envConfig.VITE_SUPABASE_PUBLISHABLE_KEY || 
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2anN3cGxoZmpjcmVxYnJnd2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzM4ODMsImV4cCI6MjA3ODUwOTg4M30.LUFTyhoRrEhaGl7ibfFzfYfEbTPOL0bH0IOVU-Fnyz4';

console.log('Using Supabase URL:', SUPABASE_URL);
console.log('Using service role key:', !!SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function populateSampleData() {
  console.log('🌱 Populating database with sample data...');
  
  try {
    // First, let's check if we can bypass RLS
    console.log(' Checking RLS bypass capability...');
    
    // Sample farms data
    const sampleFarms = [
      {
        name: 'Green Valley Poultry Farm',
        location: 'North Region, Green Valley',
        capacity: 15000,
        status: 'active'
      },
      {
        name: 'Sunset Hills Farm',
        location: 'West Region, Sunset Hills',
        capacity: 12000,
        status: 'active'
      },
      {
        name: 'River Bend Agricultural Center',
        location: 'East Region, River Bend',
        capacity: 18000,
        status: 'maintenance'
      },
      {
        name: 'Mountain View Poultry',
        location: 'South Region, Mountain View',
        capacity: 10000,
        status: 'active'
      },
      {
        name: 'Prairie Land Farm',
        location: 'Central Region, Prairie Land',
        capacity: 20000,
        status: 'inactive'
      }
    ];
    
    // Insert farms
    console.log(' Inserting sample farms...');
    const { data: farmsData, error: farmsError } = await supabase
      .from('farms')
      .insert(sampleFarms)
      .select();
    
    if (farmsError) {
      console.log('❌ Error inserting farms:', farmsError.message);
      console.log('   This is likely due to RLS policies. You need to add your SUPABASE_SERVICE_ROLE_KEY to .env');
      console.log('   The service role key can be found in your Supabase project settings under API > Service Role Key');
      return;
    } else {
      console.log(`✅ Successfully inserted ${farmsData.length} farms`);
    }
    
    // Sample financial data
    const sampleFinancialData = [
      {
        month: 'January 2025',
        revenue: 25000.00,
        cost: 18000.00,
        profit: 7000.00,
        margin: 28.00
      },
      {
        month: 'February 2025',
        revenue: 28000.00,
        cost: 19500.00,
        profit: 8500.00,
        margin: 30.36
      },
      {
        month: 'March 2025',
        revenue: 32000.00,
        cost: 21000.00,
        profit: 11000.00,
        margin: 34.38
      },
      {
        month: 'April 2025',
        revenue: 30000.00,
        cost: 20000.00,
        profit: 10000.00,
        margin: 33.33
      },
      {
        month: 'May 2025',
        revenue: 35000.00,
        cost: 22000.00,
        profit: 13000.00,
        margin: 37.14
      },
      {
        month: 'June 2025',
        revenue: 38000.00,
        cost: 23500.00,
        profit: 14500.00,
        margin: 38.16
      }
    ];
    
    // Insert financial data
    console.log(' Inserting sample financial data...');
    const { data: financialData, error: financialError } = await supabase
      .from('financial_data')
      .insert(sampleFinancialData)
      .select();
    
    if (financialError) {
      console.log('❌ Error inserting financial data:', financialError.message);
    } else {
      console.log(`✅ Successfully inserted ${financialData.length} financial records`);
    }
    
    // Sample cost breakdown data
    const sampleCostBreakdown = [
      { name: 'Feed', value: 40, amount: 8000.00 },
      { name: 'Labor', value: 25, amount: 5000.00 },
      { name: 'Healthcare', value: 15, amount: 3000.00 },
      { name: 'Utilities', value: 10, amount: 2000.00 },
      { name: 'Other', value: 10, amount: 2000.00 }
    ];
    
    // Insert cost breakdown data
    console.log(' Inserting sample cost breakdown data...');
    const { data: costData, error: costError } = await supabase
      .from('cost_breakdown')
      .insert(sampleCostBreakdown)
      .select();
    
    if (costError) {
      console.log('❌ Error inserting cost breakdown data:', costError.message);
    } else {
      console.log(`✅ Successfully inserted ${costData.length} cost breakdown records`);
    }
    
    // Sample farm performance data
    const sampleFarmPerformance = [
      {
        farm_name: 'Green Valley Poultry Farm',
        fcr: 1.65,
        mortality: 2.8,
        avg_weight: 2.45,
        cost_per_kg: 3.75
      },
      {
        farm_name: 'Sunset Hills Farm',
        fcr: 1.58,
        mortality: 2.5,
        avg_weight: 2.50,
        cost_per_kg: 3.60
      },
      {
        farm_name: 'River Bend Agricultural Center',
        fcr: 1.72,
        mortality: 3.2,
        avg_weight: 2.35,
        cost_per_kg: 3.90
      },
      {
        farm_name: 'Mountain View Poultry',
        fcr: 1.60,
        mortality: 2.9,
        avg_weight: 2.48,
        cost_per_kg: 3.65
      },
      {
        farm_name: 'Prairie Land Farm',
        fcr: 1.68,
        mortality: 3.0,
        avg_weight: 2.40,
        cost_per_kg: 3.80
      }
    ];
    
    // Insert farm performance data
    console.log(' Inserting sample farm performance data...');
    const { data: performanceData, error: performanceError } = await supabase
      .from('farm_performance')
      .insert(sampleFarmPerformance)
      .select();
    
    if (performanceError) {
      console.log('❌ Error inserting farm performance data:', performanceError.message);
    } else {
      console.log(`✅ Successfully inserted ${performanceData.length} farm performance records`);
    }
    
    // Sample alerts data
    const sampleAlerts = [
      {
        type: 'critical',
        title: 'High Mortality Rate',
        message: 'Green Valley Poultry Farm is reporting mortality rates above threshold',
        farm: 'Green Valley Poultry Farm',
        read: false
      },
      {
        type: 'warning',
        title: 'Feed Shortage',
        message: 'Low feed inventory reported at Sunset Hills Farm',
        farm: 'Sunset Hills Farm',
        read: false
      },
      {
        type: 'info',
        title: 'New Batch Started',
        message: 'New batch initiated at River Bend Agricultural Center',
        farm: 'River Bend Agricultural Center',
        read: false
      },
      {
        type: 'success',
        title: 'Vaccination Complete',
        message: 'All birds vaccinated at Mountain View Poultry',
        farm: 'Mountain View Poultry',
        read: true
      }
    ];
    
    // Insert alerts data
    console.log(' Inserting sample alerts...');
    const { data: alertsData, error: alertsError } = await supabase
      .from('alerts')
      .insert(sampleAlerts)
      .select();
    
    if (alertsError) {
      console.log('❌ Error inserting alerts:', alertsError.message);
    } else {
      console.log(`✅ Successfully inserted ${alertsData.length} alerts`);
    }
    
    // Sample dashboard metrics data
    const sampleDashboardMetrics = [
      {
        metric_name: 'Total Revenue',
        metric_value: '$193,000',
        change_percentage: '+15.2%',
        change_type: 'positive'
      },
      {
        metric_name: 'Avg. FCR',
        metric_value: '1.65',
        change_percentage: '-0.02',
        change_type: 'positive'
      },
      {
        metric_name: 'Mortality Rate',
        metric_value: '2.88%',
        change_percentage: '-0.12%',
        change_type: 'positive'
      },
      {
        metric_name: 'Profit Margin',
        metric_value: '33.89%',
        change_percentage: '+1.56%',
        change_type: 'positive'
      },
      {
        metric_name: 'Active Farms',
        metric_value: '4',
        change_percentage: '0',
        change_type: 'neutral'
      }
    ];
    
    // Insert dashboard metrics data
    console.log(' Inserting sample dashboard metrics...');
    const { data: metricsData, error: metricsError } = await supabase
      .from('dashboard_metrics')
      .insert(sampleDashboardMetrics)
      .select();
    
    if (metricsError) {
      console.log('❌ Error inserting dashboard metrics:', metricsError.message);
    } else {
      console.log(`✅ Successfully inserted ${metricsData.length} dashboard metrics`);
    }
    
    console.log('\n🌱 Sample data population complete!');
    console.log('   You should now see data in your web application.');
    
  } catch (error) {
    console.error('❌ Unexpected error during data population:', error);
  }
}

// Run the population script
populateSampleData();