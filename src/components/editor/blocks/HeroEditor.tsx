// @TASK P1-T1.3 - HeroBlock 에디터
// @SPEC docs/planning/06-tasks.md#P1-T1.3

'use client';

import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { HeroContent } from '@/types/block';

interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function HeroEditor({ content, onChange, onImageUpload }: HeroEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 드래그 이벤트 핸들러
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  // 파일 업로드 처리
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);

    try {
      if (onImageUpload) {
        // 서버 업로드
        const url = await onImageUpload(file);
        onChange({ ...content, backgroundImage: url });
      } else {
        // 로컬 미리보기 (개발용)
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onChange({ ...content, backgroundImage: dataUrl });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleRemoveImage = () => {
    onChange({ ...content, backgroundImage: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 숙소명 */}
      <div>
        <label htmlFor="hero-title" className="block text-sm font-semibold text-text-primary mb-2">
          숙소명 <span className="text-error">*</span>
        </label>
        <input
          id="hero-title"
          type="text"
          value={content.title}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="예: 서울 강남 아파트"
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-body"
          required
          aria-required="true"
        />
      </div>

      {/* 서브타이틀 */}
      <div>
        <label htmlFor="hero-subtitle" className="block text-sm font-semibold text-text-primary mb-2">
          서브타이틀 <span className="text-caption text-text-secondary">(선택)</span>
        </label>
        <input
          id="hero-subtitle"
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          placeholder="예: 편안한 휴식을 위한 완벽한 공간"
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-body"
        />
      </div>

      {/* 배경 이미지 업로드 */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          배경 이미지 <span className="text-caption text-text-secondary">(선택)</span>
        </label>

        {content.backgroundImage ? (
          // 이미지 미리보기
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={content.backgroundImage}
              alt="배경 이미지 미리보기"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-error/90 transition-colors shadow-lg"
              aria-label="이미지 삭제"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // 드래그앤드롭 영역
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all
              ${
                isDragging
                  ? 'border-primary bg-primary-light'
                  : 'border-border hover:border-primary hover:bg-surface'
              }
            `}
            role="button"
            tabIndex={0}
            aria-label="이미지 업로드"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-body text-text-secondary">업로드 중...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-surface rounded-full">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-body font-semibold text-text-primary mb-1">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-caption text-text-secondary">
                    JPG, PNG, GIF (최대 10MB)
                  </p>
                </div>
                <Upload className="w-5 h-5 text-text-secondary" />
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* 오버레이 색상 */}
      <div>
        <label htmlFor="hero-overlay-color" className="block text-sm font-semibold text-text-primary mb-2">
          오버레이 색상 <span className="text-caption text-text-secondary">(선택)</span>
        </label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              id="hero-overlay-color"
              type="color"
              value={content.overlayColor || '#000000'}
              onChange={(e) => onChange({ ...content, overlayColor: e.target.value })}
              className="w-16 h-16 rounded-lg border-2 border-border cursor-pointer"
              aria-label="오버레이 색상 선택"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-primary font-medium">
              {content.overlayColor || '#000000'}
            </p>
            <p className="text-caption text-text-secondary">
              배경 이미지 위에 씌워질 색상
            </p>
          </div>
        </div>
      </div>

      {/* 오버레이 투명도 */}
      <div>
        <label htmlFor="hero-overlay-opacity" className="block text-sm font-semibold text-text-primary mb-2">
          오버레이 투명도 <span className="text-caption text-text-secondary">(선택)</span>
        </label>
        <div className="space-y-3">
          <input
            id="hero-overlay-opacity"
            type="range"
            min="0"
            max="100"
            value={content.overlayOpacity || 0}
            onChange={(e) => onChange({ ...content, overlayOpacity: parseInt(e.target.value) })}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="오버레이 투명도 조절"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={content.overlayOpacity || 0}
          />
          <div className="flex justify-between items-center">
            <span className="text-caption text-text-secondary">투명</span>
            <span className="text-body font-semibold text-primary">
              {content.overlayOpacity || 0}%
            </span>
            <span className="text-caption text-text-secondary">불투명</span>
          </div>
        </div>
      </div>
    </div>
  );
}
