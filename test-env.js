import dotenv from 'dotenv';
dotenv.config();

console.log('=== Environment Variables Test ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('PORT:', process.env.PORT);
