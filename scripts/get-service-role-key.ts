// @ts-nocheck
console.log(`
🔐 Supabase Service Role Key Required

To populate your database with sample data, you need to add the Supabase Service Role Key to your .env file.

Steps to get your Service Role Key:

1. Go to your Supabase project dashboard at https://app.supabase.com/project/gvjswplhfjcreqbrgwhr
2. Click on the "Settings" gear icon in the left sidebar
3. Click on "API" in the settings menu
4. Scroll down to the "Service Role Key" section
5. Copy the service role key (it starts with eyJhbGci...)
6. Add it to your .env file like this:

   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

After adding the service role key to your .env file, run this command again:

   npm run populate-db

⚠️  Important Security Note:
   - Never use the service role key in frontend code
   - Only use it in backend scripts and server-side code
   - Keep it secret and secure
`);