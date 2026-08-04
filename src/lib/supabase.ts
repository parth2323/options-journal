import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ggucwhvotomwcyawvjtl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdndWN3aHZvdG9td2N5YXd2anRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDYyNjksImV4cCI6MjA3NzQyMjI2OX0.OvX5OIqM-r7WgcmpQc-7FiRy8M_9obj_H5LgCpppMtY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
