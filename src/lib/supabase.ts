import { createClient } from '@supabase/supabase-js';

// 아까 .env.local에 적어둔 열쇠를 자동으로 불러옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 다른 파일에서 쓸 수 있도록 연결 통로(client)를 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseKey);