// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cudwwnfaahriybxvgcaa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZHd3bmZhYWhyaXlieHZnY2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTMsImV4cCI6MjA2NTMxMTQxM30.EykpPjbDLO5j9vi-U3HCqDE3i_kdayt-yRZ8Av_fLvI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);