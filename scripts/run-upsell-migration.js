// @TASK P8-R3: Upsell items 마이그레이션 실행 스크립트

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('📂 마이그레이션 파일 읽기...');
    const sql = fs.readFileSync('supabase/migrations/025_upsell_items.sql', 'utf8');

    console.log('🔄 SQL 실행 중...');

    // SQL을 세미콜론으로 분리하여 각각 실행
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (!statement) continue;

      const { error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      });

      if (error) {
        // exec_sql RPC가 없을 수 있으므로 직접 실행
        console.log('⚠️ exec_sql RPC가 없습니다. 직접 쿼리 실행을 시도합니다...');
        console.log('Statement preview:', statement.substring(0, 100) + '...');
        // 직접 쿼리는 보안상 권장하지 않으므로 Supabase Studio에서 수동 실행 필요
        throw error;
      }
    }

    console.log('✅ 마이그레이션 성공!');

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error.message);
    console.log('\n수동 실행 안내:');
    console.log('1. Supabase Studio (https://supabase.com/dashboard) 접속');
    console.log('2. SQL Editor 열기');
    console.log('3. supabase/migrations/025_upsell_items.sql 파일 내용 복사');
    console.log('4. SQL Editor에 붙여넣고 실행');
    process.exit(1);
  }
}

runMigration();
