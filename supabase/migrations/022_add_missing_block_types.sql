-- @TASK Fix - BlockType enum에 누락된 값 추가
-- 기존 Prisma 스키마에서 생성된 BlockType enum에 새 블록 타입 추가

-- BlockType enum이 존재하는 경우에만 값 추가
DO $$
BEGIN
    -- AMENITIES 추가
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'AMENITIES' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType')) THEN
        ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'AMENITIES';
    END IF;

    -- RULES 추가
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'RULES' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType')) THEN
        ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'RULES';
    END IF;

    -- MAP 추가
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MAP' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType')) THEN
        ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'MAP';
    END IF;

    -- GALLERY 추가
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'GALLERY' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType')) THEN
        ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'GALLERY';
    END IF;

    -- NOTICE 추가
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'NOTICE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType')) THEN
        ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'NOTICE';
    END IF;

    -- CUSTOM 추가
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CUSTOM' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType')) THEN
        ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'CUSTOM';
    END IF;
END $$;

-- 확인: 현재 BlockType enum 값들 출력
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType');
