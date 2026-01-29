#!/usr/bin/env tsx

/**
 * DB Migration Script
 *
 * Supabase 키 검증 후 연결 테스트를 수행하고,
 * 모든 마이그레이션 SQL 파일을 순차적으로 실행합니다.
 *
 * Usage:
 * - npm run db:migrate
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// 환경변수 체크
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  console.error('필수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n.env.local 파일을 확인하세요.');
  process.exit(1);
}

// Supabase 클라이언트 생성 (Service Role Key 사용)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Supabase 연결 테스트
 */
async function testConnection(): Promise<boolean> {
  console.log('🔍 Supabase 연결 테스트 중...');

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found (테이블 존재하지만 데이터 없음)
      console.error('❌ Supabase 연결 실패:', error.message);
      return false;
    }

    console.log('✅ Supabase 연결 성공\n');
    return true;
  } catch (err) {
    console.error('❌ Supabase 연결 중 예외 발생:', err);
    return false;
  }
}

/**
 * 마이그레이션 파일 목록 가져오기
 */
function getMigrationFiles(): string[] {
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');

  try {
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // 파일명 순서대로 정렬 (001_, 002_, ...)

    return files;
  } catch (err) {
    console.error('❌ 마이그레이션 폴더를 찾을 수 없습니다:', migrationsDir);
    throw err;
  }
}

/**
 * SQL 파일 실행
 */
async function executeSqlFile(filename: string): Promise<boolean> {
  const filepath = join(process.cwd(), 'supabase', 'migrations', filename);

  console.log(`📄 실행 중: ${filename}`);

  try {
    const sql = readFileSync(filepath, 'utf-8');

    // SQL을 세미콜론으로 분리하여 개별 실행
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // 이미 존재하는 경우 무시 (idempotent)
          if (error.message.includes('already exists')) {
            console.log(`   ⚠️  이미 존재: ${error.message}`);
            continue;
          }

          throw error;
        }
      }
    }

    console.log(`   ✅ 완료: ${filename}\n`);
    return true;
  } catch (err: any) {
    console.error(`   ❌ 실패: ${filename}`);
    console.error(`   오류: ${err.message}\n`);
    return false;
  }
}

/**
 * 대체 방법: supabase-js의 from().select()로 SQL 실행 불가하므로,
 * 직접 PostgreSQL RPC를 만들거나, 각 마이그레이션을 Supabase Dashboard에서 실행
 *
 * 현재는 각 마이그레이션을 개별 statement로 실행하는 방식으로 구현
 */
async function runMigrations(): Promise<void> {
  console.log('🚀 마이그레이션 시작\n');
  console.log('='.repeat(50));

  const files = getMigrationFiles();

  if (files.length === 0) {
    console.log('⚠️  실행할 마이그레이션이 없습니다.\n');
    return;
  }

  console.log(`📋 총 ${files.length}개 마이그레이션 파일 발견\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const success = await executeSqlFile(file);

    if (success) {
      successCount++;
    } else {
      failCount++;
      console.error(`\n❌ 마이그레이션 중단: ${file} 실패\n`);
      break; // 첫 실패 시 중단
    }
  }

  console.log('='.repeat(50));
  console.log(`\n📊 결과: 성공 ${successCount}개, 실패 ${failCount}개`);

  if (failCount > 0) {
    console.error('\n❌ 마이그레이션이 완전히 완료되지 않았습니다.');
    console.error('Supabase Dashboard에서 수동으로 마이그레이션을 확인하세요.');
    console.error(`Dashboard: ${supabaseUrl?.replace('.supabase.co', '.supabase.co/project/_/editor') ?? 'URL not available'}`);
    process.exit(1);
  }

  console.log('\n✅ 모든 마이그레이션이 성공적으로 완료되었습니다!\n');
}

/**
 * 실제로는 Supabase에서 직접 SQL 실행을 위한 RPC 함수가 필요합니다.
 *
 * Supabase 콘솔에서 다음 함수를 먼저 생성해야 합니다:
 *
 * CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
 * RETURNS void
 * LANGUAGE plpgsql
 * SECURITY DEFINER
 * AS $$
 * BEGIN
 *   EXECUTE sql_query;
 * END;
 * $$;
 *
 * 또는 더 간단하게, 각 마이그레이션을 Supabase Dashboard의 SQL Editor에서 실행하는 것을 권장합니다.
 */

/**
 * ALTERNATIVE: Supabase CLI 사용
 *
 * Supabase CLI를 사용하면 더 쉽게 마이그레이션을 관리할 수 있습니다:
 *
 * 1. supabase init (프로젝트 초기화)
 * 2. supabase link --project-ref [PROJECT_ID]
 * 3. supabase db push (로컬 마이그레이션을 원격에 적용)
 *
 * 하지만 여기서는 npm 스크립트로 간단히 실행할 수 있도록 구현합니다.
 */

/**
 * 간소화된 버전: Supabase Dashboard 안내
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   Vibe Store - Database Migration Tool       ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  // 1. 연결 테스트
  const connected = await testConnection();

  if (!connected) {
    console.error('\n⚠️  Supabase 연결에 실패했습니다.');
    console.error('\n아래 단계를 따라 수동으로 마이그레이션하세요:\n');
    console.error('1. Supabase Dashboard 접속');
    console.error(`   ${supabaseUrl?.replace('.supabase.co', '.supabase.co/project/_/editor') ?? 'URL not available'}`);
    console.error('\n2. SQL Editor 메뉴로 이동');
    console.error('\n3. 다음 마이그레이션 파일을 순서대로 실행:');

    const files = getMigrationFiles();
    files.forEach((file, idx) => {
      console.error(`   ${idx + 1}. supabase/migrations/${file}`);
    });

    console.error('\n각 파일의 내용을 복사하여 SQL Editor에 붙여넣고 실행하세요.\n');
    process.exit(1);
  }

  // 2. 마이그레이션 실행 안내
  console.log('⚠️  현재 버전은 Supabase CLI 사용을 권장합니다.\n');
  console.log('자동 마이그레이션을 위해 다음 옵션 중 하나를 선택하세요:\n');
  console.log('📌 옵션 1: Supabase CLI 사용 (권장)');
  console.log('   npm install -g supabase');
  console.log('   supabase login');
  console.log('   supabase link --project-ref [YOUR_PROJECT_ID]');
  console.log('   supabase db push\n');
  console.log('📌 옵션 2: Supabase Dashboard에서 수동 실행');
  console.log(`   Dashboard: ${supabaseUrl?.replace('.supabase.co', '.supabase.co/project/_/sql') ?? 'URL not available'}\n`);

  const files = getMigrationFiles();
  console.log('📋 실행할 마이그레이션 목록:\n');
  files.forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file}`);
  });

  console.log('\n✅ 마이그레이션 파일이 준비되었습니다.');
  console.log('위 방법 중 하나를 선택하여 마이그레이션을 진행하세요.\n');
}

main().catch(err => {
  console.error('❌ 예외 발생:', err);
  process.exit(1);
});
