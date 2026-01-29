// @TASK P8-S11-T1: 색상 선택 컴포넌트
// @SPEC specs/screens/editor-branding.yaml - ColorPicker

'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

// 프리셋 색상
const PRESET_COLORS = [
  '#FF385C', // Rausch (AirBnB Primary)
  '#00A699', // Teal (AirBnB Secondary)
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#F59E0B', // Amber
  '#10B981', // Green
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
];

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    // HEX 형식 검증 (간단한 검증)
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  const handlePresetClick = (color: string) => {
    setHexInput(color);
    onChange(color);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-text-primary">{label}</Label>

      {/* 프리셋 색상 */}
      <div className="grid grid-cols-6 gap-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handlePresetClick(color)}
            className={`
              w-full aspect-square rounded-airbnb border-2 transition-all
              hover:scale-110 hover:shadow-airbnb-sm
              ${value === color ? 'border-text-primary ring-2 ring-primary ring-offset-2' : 'border-border'}
            `}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`색상 선택: ${color}`}
          />
        ))}
      </div>

      {/* HEX 입력 */}
      <div className="flex gap-3 items-center">
        <div
          className="w-14 h-14 rounded-airbnb border-2 border-border flex-shrink-0 shadow-airbnb-sm"
          style={{ backgroundColor: value }}
          aria-label="선택된 색상"
        />
        <Input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
          placeholder="#FF385C"
          className="font-mono text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          maxLength={7}
        />
      </div>
    </div>
  );
}
