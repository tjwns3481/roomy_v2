// @TASK P8-S11-T1: 폰트 선택 컴포넌트
// @SPEC specs/screens/editor-branding.yaml - FontSelector

'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FontPreset } from '@/lib/validations/branding';

interface FontSelectorProps {
  value: FontPreset;
  onChange: (font: FontPreset) => void;
}

const FONT_OPTIONS = [
  {
    id: 'pretendard' as FontPreset,
    label: 'Pretendard',
    preview: '프리텐다드 - 깔끔하고 모던한 느낌',
    style: { fontFamily: 'Pretendard, sans-serif' },
  },
  {
    id: 'noto_sans' as FontPreset,
    label: 'Noto Sans KR',
    preview: '노토 산스 - 구글의 범용 글꼴',
    style: { fontFamily: '"Noto Sans KR", sans-serif' },
  },
  {
    id: 'nanum_gothic' as FontPreset,
    label: '나눔고딕',
    preview: '나눔고딕 - 한국적이고 친근한 느낌',
    style: { fontFamily: '"Nanum Gothic", sans-serif' },
  },
  {
    id: 'gmarket_sans' as FontPreset,
    label: 'G마켓 산스',
    preview: 'G마켓 산스 - 통통 튀는 느낌',
    style: { fontFamily: '"GMarket Sans", sans-serif' },
  },
  {
    id: 'spoqa_han_sans' as FontPreset,
    label: 'Spoqa Han Sans',
    preview: '스포카 한 산스 - 깔끔하고 세련된 느낌',
    style: { fontFamily: '"Spoqa Han Sans", sans-serif' },
  },
];

export default function FontSelector({ value, onChange }: FontSelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-text-primary">글꼴 선택</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as FontPreset)}>
        <div className="space-y-3">
          {FONT_OPTIONS.map((font) => (
            <label
              key={font.id}
              htmlFor={font.id}
              className={`
                flex items-start p-4 border-2 rounded-airbnb cursor-pointer transition-all
                hover:border-primary hover:shadow-airbnb-sm
                ${value === font.id ? 'border-primary bg-primary/5 shadow-airbnb-sm' : 'border-border'}
              `}
            >
              <RadioGroupItem value={font.id} id={font.id} className="mt-1" />
              <div className="ml-4 flex-1">
                <div className="font-medium text-sm text-text-primary mb-1">{font.label}</div>
                <div className="text-text-secondary text-sm leading-relaxed" style={font.style}>
                  {font.preview}
                </div>
              </div>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
