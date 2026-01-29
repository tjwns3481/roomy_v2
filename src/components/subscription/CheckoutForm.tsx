/**
 * @TASK P6-T6.5 - 결제 폼 컴포넌트
 * @SPEC docs/planning/06-tasks.md#P6-T6.5
 *
 * 결제 수단 선택 및 약관 동의 처리
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Building2, Smartphone } from 'lucide-react';
import type { TossPaymentMethod } from '@/types/payment';

interface CheckoutFormProps {
  orderId: string;
  amount: number;
  orderName: string;
  onSubmit: (paymentMethod: TossPaymentMethod) => Promise<void>;
}

/**
 * 결제 수단 옵션 정의
 */
const PAYMENT_METHODS = [
  {
    value: 'CARD' as TossPaymentMethod,
    label: '신용카드',
    description: '간편하고 빠른 결제',
    icon: CreditCard,
  },
  {
    value: 'TRANSFER' as TossPaymentMethod,
    label: '계좌이체',
    description: '실시간 계좌이체',
    icon: Building2,
  },
  {
    value: 'VIRTUAL_ACCOUNT' as TossPaymentMethod,
    label: '가상계좌',
    description: '가상계좌로 입금',
    icon: Smartphone,
  },
] as const;

export function CheckoutForm({ orderId, amount, orderName, onSubmit }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<TossPaymentMethod>('CARD');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 약관 동의 체크
    if (!termsAgreed || !privacyAgreed) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(paymentMethod);
    } catch (err) {
      console.error('결제 요청 실패:', err);
      setError(err instanceof Error ? err.message : '결제 요청에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 결제 수단 선택 */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">결제 수단</Label>
        <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as TossPaymentMethod)}>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.value}
                  className={`
                    flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${paymentMethod === method.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  <RadioGroupItem value={method.value} id={method.value} />
                  <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={method.value} className="cursor-pointer font-medium">
                      {method.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* 약관 동의 */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Checkbox id="terms" checked={termsAgreed} onCheckedChange={(checked) => setTermsAgreed(checked as boolean)} />
          <div className="flex-1">
            <Label htmlFor="terms" className="cursor-pointer">
              <span className="text-red-600">(필수)</span> 구매 조건 확인 및 결제 진행 동의
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              주문 내용을 확인하였으며, 결제에 동의합니다.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="privacy"
            checked={privacyAgreed}
            onCheckedChange={(checked) => setPrivacyAgreed(checked as boolean)}
          />
          <div className="flex-1">
            <Label htmlFor="privacy" className="cursor-pointer">
              <span className="text-red-600">(필수)</span> 개인정보 제3자 제공 동의
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              결제 대행 서비스(토스페이먼츠)에 개인정보 제공에 동의합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 결제 버튼 */}
      <Button type="submit" size="lg" className="w-full" disabled={isLoading || !termsAgreed || !privacyAgreed}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            결제 진행 중...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {amount.toLocaleString()}원 결제하기
          </>
        )}
      </Button>

      {/* 안내 문구 */}
      <p className="text-xs text-center text-muted-foreground">
        결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
      </p>
    </form>
  );
}
