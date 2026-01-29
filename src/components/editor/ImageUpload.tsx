// @TASK P8-S11-T1: 이미지 업로드 컴포넌트
// @SPEC specs/screens/editor-branding.yaml - ImageUpload

'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  guidebookId: string;
  aspectRatio?: 'auto' | '1:1' | '16:9';
  maxSizeMB?: number;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  guidebookId,
  aspectRatio = 'auto',
  maxSizeMB = 2,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // 파일 크기 검증
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다`);
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('guidebookId', guidebookId);

      const response = await fetch('/api/upload/branding', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const { url } = await response.json();
      onChange(url);
      toast.success('이미지가 업로드되었습니다');
    } catch (error) {
      toast.error('업로드 중 오류가 발생했습니다');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-text-primary">{label}</Label>

      {value ? (
        <div className="relative border-2 border-border rounded-airbnb overflow-hidden shadow-airbnb-sm">
          <img
            src={value}
            alt={label}
            className={`w-full object-contain bg-surface ${
              aspectRatio === '1:1' ? 'aspect-square' : aspectRatio === '16:9' ? 'aspect-video' : 'h-32'
            }`}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-3 right-3 shadow-airbnb-md"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-airbnb p-8 text-center cursor-pointer transition-all
            ${dragActive ? 'border-primary bg-primary/5 shadow-airbnb-sm' : 'border-border hover:border-text-tertiary hover:bg-surface'}
          `}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-body-sm text-text-secondary">업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-text-tertiary" />
              <div>
                <p className="text-body-sm text-text-primary font-medium">
                  클릭하거나 드래그하여 이미지 업로드
                </p>
                <p className="text-caption text-text-tertiary mt-1">최대 {maxSizeMB}MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
