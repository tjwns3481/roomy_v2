#!/usr/bin/env node

/**
 * Vibe Store - Setup Wizard
 *
 * 인터랙티브 CLI 위저드로 프로젝트 초기 설정을 진행합니다.
 *
 * Usage:
 *   npm run setup
 */

import prompts from 'prompts';
import * as path from 'path';
import {
  testSupabaseConnection,
  createEnvFile,
  createSiteConfig,
  updateGitignore,
  isValidUrl,
  isValidEmail,
  isSetupComplete,
  type EnvConfig,
  type SiteConfig,
} from './setup/index';

// 프로젝트 루트 경로
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * 메인 위저드 함수
 */
async function runSetupWizard() {
  console.clear();
  console.log('\n🎉 Vibe Store - Setup Wizard\n');
  console.log('프로젝트 초기 설정을 시작합니다.\n');

  // 이미 설정이 완료된 경우
  if (isSetupComplete(PROJECT_ROOT)) {
    const { confirmOverwrite } = await prompts({
      type: 'confirm',
      name: 'confirmOverwrite',
      message: '이미 설정이 완료되었습니다. 다시 설정하시겠습니까?',
      initial: false,
    });

    if (!confirmOverwrite) {
      console.log('\n설정을 취소했습니다.');
      process.exit(0);
    }
  }

  try {
    // Step 1: Supabase 설정
    console.log('\n📦 Step 1: Supabase 설정');
    console.log('─'.repeat(50));

    const supabaseConfig = await prompts([
      {
        type: 'text',
        name: 'url',
        message: 'Supabase Project URL',
        validate: (value) =>
          isValidUrl(value) ? true : '올바른 URL을 입력해주세요.',
      },
      {
        type: 'text',
        name: 'anonKey',
        message: 'Supabase Anon Key',
        validate: (value) =>
          value.length > 0 ? true : 'Anon Key를 입력해주세요.',
      },
      {
        type: 'confirm',
        name: 'addServiceKey',
        message: 'Service Role Key를 추가하시겠습니까? (선택사항)',
        initial: false,
      },
    ]);

    // 연결 취소 확인
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      console.log('\n설정을 취소했습니다.');
      process.exit(0);
    }

    // Service Role Key 입력 (선택)
    let serviceRoleKey: string | undefined;
    if (supabaseConfig.addServiceKey) {
      const { serviceKey } = await prompts({
        type: 'text',
        name: 'serviceKey',
        message: 'Supabase Service Role Key',
      });
      serviceRoleKey = serviceKey;
    }

    // Supabase 연결 테스트
    console.log('\n🔍 Supabase 연결을 테스트하는 중...');
    const testResult = await testSupabaseConnection(
      supabaseConfig.url,
      supabaseConfig.anonKey
    );

    if (!testResult.success) {
      console.error('\n❌ Supabase 연결 실패:', testResult.error);
      console.log('\nURL과 Key를 다시 확인해주세요.');
      process.exit(1);
    }

    console.log('✅ Supabase 연결 성공!');

    // Step 2: Toss Payments 설정 (선택사항)
    console.log('\n💳 Step 2: Toss Payments 설정 (선택사항)');
    console.log('─'.repeat(50));

    const { configureToss } = await prompts({
      type: 'confirm',
      name: 'configureToss',
      message: 'Toss Payments를 설정하시겠습니까?',
      initial: false,
    });

    let tossClientKey: string | undefined;
    let tossSecretKey: string | undefined;

    if (configureToss) {
      const tossConfig = await prompts([
        {
          type: 'text',
          name: 'clientKey',
          message: 'Toss Payments Client Key',
        },
        {
          type: 'text',
          name: 'secretKey',
          message: 'Toss Payments Secret Key',
        },
      ]);

      tossClientKey = tossConfig.clientKey;
      tossSecretKey = tossConfig.secretKey;
    } else {
      console.log('⏭️  Toss Payments 설정을 건너뜁니다.');
    }

    // Step 3: 사이트 기본 정보
    console.log('\n🏪 Step 3: 사이트 기본 정보');
    console.log('─'.repeat(50));

    const siteInfo = await prompts([
      {
        type: 'text',
        name: 'name',
        message: '상점명',
        initial: 'Vibe Store',
        validate: (value) =>
          value.length > 0 ? true : '상점명을 입력해주세요.',
      },
      {
        type: 'text',
        name: 'url',
        message: '사이트 URL',
        initial: 'http://localhost:3000',
        validate: (value) =>
          isValidUrl(value) ? true : '올바른 URL을 입력해주세요.',
      },
      {
        type: 'text',
        name: 'adminEmail',
        message: '관리자 이메일',
        validate: (value) =>
          isValidEmail(value) ? true : '올바른 이메일을 입력해주세요.',
      },
      {
        type: 'text',
        name: 'description',
        message: '사이트 설명 (선택사항)',
        initial: '',
      },
    ]);

    // 연결 취소 확인
    if (!siteInfo.name || !siteInfo.url || !siteInfo.adminEmail) {
      console.log('\n설정을 취소했습니다.');
      process.exit(0);
    }

    // Step 4: 설정 파일 생성
    console.log('\n📝 Step 4: 설정 파일 생성');
    console.log('─'.repeat(50));

    const envConfig: EnvConfig = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseConfig.url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseConfig.anonKey,
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
      TOSS_CLIENT_KEY: tossClientKey,
      TOSS_SECRET_KEY: tossSecretKey,
      NEXT_PUBLIC_APP_URL: siteInfo.url,
    };

    const siteConfig: SiteConfig = {
      name: siteInfo.name,
      url: siteInfo.url,
      adminEmail: siteInfo.adminEmail,
      description: siteInfo.description || undefined,
    };

    // 파일 생성
    createEnvFile(envConfig, PROJECT_ROOT);
    createSiteConfig(siteConfig, PROJECT_ROOT);
    updateGitignore(PROJECT_ROOT);

    console.log('✅ .env.local 생성 완료');
    console.log('✅ config/site.config.ts 생성 완료');
    console.log('✅ .gitignore 업데이트 완료');

    // 완료
    console.log('\n🎉 설정이 완료되었습니다!\n');
    console.log('다음 단계:');
    console.log('  1. npm run dev - 개발 서버 시작');
    console.log('  2. npm run db:migrate - 데이터베이스 마이그레이션 (선택)');
    console.log('  3. http://localhost:3000 - 사이트 확인\n');
  } catch (error) {
    if (error instanceof Error && error.message === 'canceled') {
      console.log('\n설정을 취소했습니다.');
      process.exit(0);
    }

    console.error('\n❌ 설정 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 위저드 실행
runSetupWizard();
