
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hseyozbbvkjdxvwjkodv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZXlvemJidmtqZHh2d2prb2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjE0ODYsImV4cCI6MjA4NDQ5NzQ4Nn0.FRRWAa3Fk_P5j6OA2tFXXxVPyOklShvp65V1RBkNFaQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
