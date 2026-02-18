import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oigrjktauwgxbcowwadc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZ3Jqa3RhdXdneGJjb3d3YWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTk3NzcsImV4cCI6MjA4NjA3NTc3N30.33RGuyW2CxQnYNNAlMR79ueoSqYeo0iIhz5xJ3tLAok';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Speaker {
  id: string;
  name: string;
  photo: string | null;
}

export interface Talk {
  id: string;
  day: string;
  time: string;
  title: string;
  description: string | null;
  site: string | null;
  speaker_id: string | null;
  link: string | null;
  speaker?: Speaker;
}

export interface User {
  id: string;
  name: string | null;
  created_at: string;
}

export interface UserTalk {
  id: string;
  user_id: string;
  talk_id: string;
  created_at: string;
  talk?: Talk;
}
