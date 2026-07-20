/**
 * Create Admin User Script
 * Creates an admin user: admin@epo.bg / Epo2026!
 * 
 * Run with: node scripts/create-admin.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  const email = 'admin@epo.bg';
  const password = 'Epo2026!';

  console.log('🔐 Creating admin user...');
  console.log('   Email:', email);
  console.log('   Password:', password);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Skip email confirmation
      },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        console.log('⚠️  User already exists!');
        console.log('   You can login with:', email, '/', password);
        return;
      }
      throw error;
    }

    console.log('✅ Admin user created successfully!');
    console.log('   User ID:', data.user?.id);
    console.log('   Email:', data.user?.email);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('');
    console.log('⚠️  IMPORTANT: If email confirmation is enabled, check your inbox!');
    console.log('   Or disable email confirmation in Supabase Dashboard:');
    console.log('   Authentication > Providers > Email > Confirm email = OFF');
  } catch (err) {
    console.error('❌ Error creating user:', err.message);
    process.exit(1);
  }
}

createAdminUser();
