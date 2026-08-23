import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mzenklwiesdbacethgml.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s1aQKNhziSl78jsfXjf6sg_jDdEEviq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);