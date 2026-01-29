/**
 * Setup Wizard - Core Functions
 *
 * 이 파일은 설정 마법사의 핵심 기능을 모듈화하여 제공합니다.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 환경 변수 인터페이스
 */
export interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  TOSS_CLIENT_KEY?: string;
  TOSS_SECRET_KEY?: string;
  NEXT_PUBLIC_APP_URL: string;
}

/**
 * 사이트 설정 인터페이스
 */
export interface SiteConfig {
  name: string;
  url: string;
  adminEmail: string;
  description?: string;
}

/**
 * Supabase 연결 테스트
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(url, anonKey);

    // 간단한 쿼리로 연결 테스트
    const { error } = await supabase.from('profiles').select('count').limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116은 테이블이 없을 때 발생하는 에러 (정상)
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * .env.local 파일 생성
 */
export function createEnvFile(config: EnvConfig, projectRoot: string): void {
  const envPath = path.join(projectRoot, '.env.local');

  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${config.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.NEXT_PUBLIC_SUPABASE_ANON_KEY}
${config.SUPABASE_SERVICE_ROLE_KEY ? `SUPABASE_SERVICE_ROLE_KEY=${config.SUPABASE_SERVICE_ROLE_KEY}` : '# SUPABASE_SERVICE_ROLE_KEY='}

# Toss Payments Configuration (Optional)
${config.TOSS_CLIENT_KEY ? `TOSS_CLIENT_KEY=${config.TOSS_CLIENT_KEY}` : '# TOSS_CLIENT_KEY='}
${config.TOSS_SECRET_KEY ? `TOSS_SECRET_KEY=${config.TOSS_SECRET_KEY}` : '# TOSS_SECRET_KEY='}

# Application Configuration
NEXT_PUBLIC_APP_URL=${config.NEXT_PUBLIC_APP_URL}
`;

  fs.writeFileSync(envPath, envContent, 'utf-8');
}

/**
 * site.config.ts 파일 생성
 */
export function createSiteConfig(config: SiteConfig, projectRoot: string): void {
  const configDir = path.join(projectRoot, 'config');
  const configPath = path.join(configDir, 'site.config.ts');

  // config 디렉토리가 없으면 생성
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configContent = `/**
 * Site Configuration
 *
 * 이 파일은 Setup Wizard에 의해 자동 생성되었습니다.
 * 사이트의 기본 정보를 담고 있습니다.
 */

export const siteConfig = {
  name: "${config.name}",
  url: "${config.url}",
  adminEmail: "${config.adminEmail}",
  description: "${config.description || `${config.name} - 디지털 상품 쇼핑몰`}",

  // 소셜 미디어 링크 (선택사항)
  links: {
    youtube: "",
    github: "",
    twitter: "",
  },

  // 메타데이터
  metadata: {
    title: "${config.name}",
    description: "${config.description || `${config.name} - 디지털 상품 쇼핑몰`}",
    keywords: ["디지털 상품", "쇼핑몰", "다운로드"],
  },
} as const;

export type SiteConfig = typeof siteConfig;
`;

  fs.writeFileSync(configPath, configContent, 'utf-8');
}

/**
 * .gitignore 업데이트 (.env.local 추가)
 */
export function updateGitignore(projectRoot: string): void {
  const gitignorePath = path.join(projectRoot, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '', 'utf-8');
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');

  if (!gitignoreContent.includes('.env.local')) {
    fs.appendFileSync(gitignorePath, '\n# Environment Variables\n.env.local\n');
  }
}

/**
 * URL 형식 검증
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 이메일 형식 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 설정 완료 여부 확인
 */
export function isSetupComplete(projectRoot: string): boolean {
  const envPath = path.join(projectRoot, '.env.local');
  const configPath = path.join(projectRoot, 'config', 'site.config.ts');

  return fs.existsSync(envPath) && fs.existsSync(configPath);
}
