// @TASK TouchStay-Comparison - WiFi 정보 블록 (Touch Stay 핵심 기능)
'use client';

import { useState } from 'react';
import { Wifi, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WifiBlockProps {
  content: {
    networkName: string;
    password: string;
    instructions?: string;
    qrCode?: string; // WiFi QR code for auto-connect
  };
  themeColor?: string;
}

export function WifiBlock({ content, themeColor = '#3B82F6' }: WifiBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(content.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: themeColor }}
      >
        <Wifi className="w-5 h-5 text-white" />
        <h3 className="font-semibold text-white">WiFi 연결 정보</h3>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Network Name */}
        <div>
          <label className="text-sm text-gray-500 block mb-1">네트워크 이름</label>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <span className="font-mono font-medium">{content.networkName}</span>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-gray-500 block mb-1">비밀번호</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <span className="font-mono font-medium">
                {showPassword ? content.password : '•'.repeat(content.password.length)}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyPassword}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-green-500" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  복사
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        {content.instructions && (
          <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
            <p>{content.instructions}</p>
          </div>
        )}

        {/* QR Code for auto-connect */}
        {content.qrCode && (
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500 mb-2">QR 코드로 자동 연결</p>
            <img
              src={content.qrCode}
              alt="WiFi QR Code"
              className="mx-auto w-32 h-32"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
