/**
 * @TASK P7-T7.1 - 비밀번호 재설정 요청 페이지
 * @SPEC Supabase Auth 기반 비밀번호 재설정 이메일 발송
 *
 * 기능:
 * - 이메일 입력
 * - 비밀번호 재설정 링크 발송
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

// 비밀번호 재설정 요청 스키마
const resetPasswordSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { resetPassword, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);

    const result = await resetPassword(data.email);

    if (result.error) {
      setError(result.error.message || '비밀번호 재설정 요청에 실패했습니다');
      return;
    }

    setSubmittedEmail(data.email);
    setSuccess(true);
  };

  const isLoading = loading || isSubmitting;

  // 성공 화면
  if (success) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">이메일을 확인해주세요</h2>
              <p className="text-muted-foreground">
                <span className="font-medium">{submittedEmail}</span>으로
                <br />
                비밀번호 재설정 링크를 보냈습니다.
              </p>
              <p className="text-sm text-muted-foreground">
                이메일이 도착하지 않았다면 스팸함을 확인해주세요.
              </p>
            </div>
            <div className="pt-4">
              <Button variant="outline" asChild>
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  로그인으로 돌아가기
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">비밀번호 찾기</CardTitle>
        <CardDescription>
          가입한 이메일을 입력하시면
          <br />
          비밀번호 재설정 링크를 보내드립니다
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10"
                disabled={isLoading}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            재설정 링크 보내기
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <Button variant="link" asChild className="text-muted-foreground">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            로그인으로 돌아가기
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
