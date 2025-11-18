// .env 파일을 읽어오는 라이브러리 (ESM 방식)
import dotenv from 'dotenv';
dotenv.config();

// Supabase 클라이언트 불러오기 (ESM 방식)
import { createClient } from '@supabase/supabase-js';

// .env 파일에서 URL과 Key 값을 읽어옴
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey);

// export (ESM 방식)
export default supabase;