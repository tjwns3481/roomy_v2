/**
 * Admin User Creation Script
 *
 * Usage: npx tsx scripts/create-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const email = 'futurewave@gmail.com';
  const password = 'admin1234';
  const nickname = 'Admin';

  console.log('🔧 Creating/Updating admin user...');
  console.log(`   Email: ${email}`);

  try {
    // Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users?.find(u => u.email === email);

    if (existingUser) {
      console.log('⚠️  User exists, updating password and profile...');

      // Update password
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password,
          email_confirm: true,
        }
      );

      if (updateAuthError) throw updateAuthError;
      console.log('✅ Password updated');

      // Update profile to admin
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: existingUser.id,
          email,
          nickname,
          role: 'admin',
        });

      if (updateProfileError) throw updateProfileError;

      console.log('✅ Admin profile updated successfully!');
      console.log(`   User ID: ${existingUser.id}`);
    } else {
      // Create new user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nickname,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      console.log(`✅ Auth user created: ${authData.user.id}`);

      // Create profile with admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          nickname,
          role: 'admin',
        });

      if (profileError) throw profileError;

      console.log('✅ Admin profile created successfully!');
    }

    console.log('');
    console.log('📋 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
