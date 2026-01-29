#!/usr/bin/env tsx

/**
 * DB Reset Script
 *
 * 데이터베이스를 초기화합니다.
 * - 모든 데이터 삭제 (CASCADE)
 * - 시드 데이터 재삽입
 *
 * ⚠️  WARNING: 프로덕션 환경에서는 절대 실행하지 마세요!
 *
 * Usage:
 * - npm run db:reset
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

// 환경변수 체크
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const nodeEnv = process.env.NODE_ENV;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  console.error('필수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n.env.local 파일을 확인하세요.');
  process.exit(1);
}

// 프로덕션 환경 보호
if (nodeEnv === 'production') {
  console.error('❌ 프로덕션 환경에서는 DB 리셋을 실행할 수 없습니다!');
  console.error('NODE_ENV=production이 감지되었습니다.');
  process.exit(1);
}

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * 확인 메시지
 */
async function confirmReset(): Promise<boolean> {
  console.log('\n⚠️  경고: 모든 데이터가 삭제됩니다!');
  console.log('계속하려면 "RESET"을 입력하세요.\n');

  // Node.js에서 stdin 입력받기
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    readline.question('입력: ', (answer: string) => {
      readline.close();
      resolve(answer.trim() === 'RESET');
    });
  });
}

/**
 * 테이블 데이터 삭제 (역순)
 */
async function truncateTables() {
  console.log('\n🗑️  데이터 삭제 중...\n');

  const tables = [
    'downloads',
    'order_items',
    'orders',
    'cart_items',
    'product_tags',
    'tags',
    'product_files',
    'product_images',
    'products',
    'categories',
    // profiles는 auth 관련이므로 보존
  ];

  for (const table of tables) {
    console.log(`   - ${table} 삭제 중...`);

    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 행 삭제 (dummy condition)

    if (error) {
      console.error(`   ❌ ${table} 삭제 실패:`, error.message);
    } else {
      console.log(`   ✅ ${table} 삭제 완료`);
    }
  }

  console.log('\n✅ 데이터 삭제 완료\n');
}

/**
 * 메인 함수
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   Vibe Store - Database Reset Tool           ║');
  console.log('╚═══════════════════════════════════════════════╝');

  // 확인
  const confirmed = await confirmReset();

  if (!confirmed) {
    console.log('\n❌ 리셋이 취소되었습니다.\n');
    process.exit(0);
  }

  try {
    // 연결 테스트
    console.log('\n🔍 Supabase 연결 테스트 중...');
    const { error: pingError } = await supabase.from('profiles').select('id').limit(1);

    if (pingError && pingError.code !== 'PGRST116') {
      throw new Error('Supabase 연결 실패: ' + pingError.message);
    }

    console.log('✅ Supabase 연결 성공');
    console.log('='.repeat(50));

    // 데이터 삭제
    await truncateTables();

    console.log('='.repeat(50));
    console.log('\n🔄 시드 데이터 재삽입 중...\n');

    // 시드 스크립트 실행
    execSync('npm run db:seed', { stdio: 'inherit' });

    console.log('\n✅ 데이터베이스 리셋 완료!\n');

  } catch (err: any) {
    console.error('\n❌ 리셋 실패:', err.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ 예외 발생:', err);
  process.exit(1);
});
