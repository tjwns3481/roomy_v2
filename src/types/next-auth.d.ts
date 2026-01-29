/**
 * NextAuth.js 타입 확장
 *
 * - Session에 role 추가
 * - JWT에 role 추가
 * - User에 role 추가
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: 'customer' | 'admin';
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: 'customer' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'customer' | 'admin';
  }
}
