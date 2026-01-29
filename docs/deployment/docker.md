# Docker 배포 가이드

이 문서는 Vibe Store를 Docker 컨테이너로 빌드하고 배포하는 방법을 설명합니다. Docker를 사용하면 개발, 테스트, 프로덕션 환경 간 일관성을 보장합니다.

## 개요

- **컨테이너 이미지**: Node.js 20 기반
- **이미지 크기**: 약 500MB (멀티 스테이지 빌드)
- **실행 포트**: 3000
- **메모리 요구사항**: 최소 512MB

## 전제 조건

1. Docker 설치 (https://www.docker.com/products/docker-desktop)
2. Docker Compose (선택사항, 로컬 개발용)
3. Docker Hub 계정 (이미지 배포 시)

## Dockerfile 구조

### 멀티 스테이지 빌드

프로덕션 이미지 크기를 최소화하기 위해 멀티 스테이지 빌드를 사용합니다:

```
Stage 1: Build       → Next.js 빌드 + 의존성 설치
Stage 2: Runtime     → 최소 런타임 환경
```

## 1단계: Docker 이미지 빌드

### 1.1 로컬 빌드

```bash
# Dockerfile이 있는 디렉토리에서
docker build -t vibe-store:latest .

# 특정 버전 태그
docker build -t vibe-store:1.0.0 .
```

### 1.2 빌드 진행 상황 보기

```bash
# 상세 로그와 함께 빌드
docker build --progress=plain -t vibe-store:latest .
```

## 2단계: 로컬에서 컨테이너 실행

### 2.1 환경 파일 준비

```.env.docker
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TOSS_CLIENT_KEY=your_client_key
TOSS_SECRET_KEY=your_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
```

### 2.2 컨테이너 실행

```bash
# 기본 실행
docker run -p 3000:3000 --env-file .env.docker vibe-store:latest

# 상호작용 모드 (Ctrl+C로 종료)
docker run -it -p 3000:3000 --env-file .env.docker vibe-store:latest

# 백그라운드 실행
docker run -d -p 3000:3000 --env-file .env.docker --name vibe-store vibe-store:latest

# 실행 중인 컨테이너 확인
docker ps

# 컨테이너 로그 확인
docker logs -f vibe-store

# 컨테이너 중지
docker stop vibe-store

# 컨테이너 삭제
docker rm vibe-store
```

## 3단계: Docker Compose로 로컬 개발

### 3.1 docker-compose.yml 설정

프로젝트 루트에 `docker-compose.yml` 파일을 생성하면:

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f vibe-store

# 서비스 중지
docker-compose down

# 재빌드 후 시작
docker-compose up -d --build
```

### 3.2 개발 서버와 함께 실행

```bash
# docker-compose.yml에서 개발 모드 사용
docker-compose -f docker-compose.dev.yml up
```

## 4단계: Docker Hub에 푸시

### 4.1 로그인

```bash
docker login
# Docker Hub 사용자명과 패스워드 입력
```

### 4.2 이미지 태그

```bash
# Docker Hub에서 사용할 이름으로 태그
docker tag vibe-store:latest your-username/vibe-store:latest
docker tag vibe-store:latest your-username/vibe-store:1.0.0
```

### 4.3 푸시

```bash
# 최신 버전 푸시
docker push your-username/vibe-store:latest

# 특정 버전 푸시
docker push your-username/vibe-store:1.0.0
```

## 5단계: Kubernetes 배포 (선택사항)

### 5.1 Deployment 매니페스트

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vibe-store
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vibe-store
  template:
    metadata:
      labels:
        app: vibe-store
    spec:
      containers:
      - name: vibe-store
        image: your-username/vibe-store:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: vibe-store-secrets
              key: supabase-url
        - name: NEXT_PUBLIC_SUPABASE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: vibe-store-secrets
              key: supabase-anon-key
        # ... 다른 환경 변수들
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 5.2 배포

```bash
# Secret 생성
kubectl create secret generic vibe-store-secrets \
  --from-literal=supabase-url=... \
  --from-literal=supabase-anon-key=...

# Deployment 적용
kubectl apply -f k8s-deployment.yaml

# 상태 확인
kubectl get deployments
kubectl describe deployment vibe-store
kubectl logs -f deployment/vibe-store
```

## 6단계: 클라우드 배포

### 6.1 AWS ECS

```bash
# ECR에 푸시
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag vibe-store:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/vibe-store:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/vibe-store:latest

# ECS 작업 정의 생성 및 실행
aws ecs create-service --cluster default --service-name vibe-store ...
```

### 6.2 Google Cloud Run

```bash
# Cloud Build로 빌드
gcloud builds submit --tag gcr.io/your-project/vibe-store

# Cloud Run에 배포
gcloud run deploy vibe-store \
  --image gcr.io/your-project/vibe-store \
  --platform managed \
  --region us-central1 \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=..."
```

### 6.3 DigitalOcean App Platform

```bash
# app.yaml 생성
name: vibe-store
services:
- name: vibe-store
  github:
    repo: your-username/vibe-store
    branch: main
  build_command: npm run build
  run_command: npm run start
  envs:
  - key: NEXT_PUBLIC_SUPABASE_URL
    value: ${NEXT_PUBLIC_SUPABASE_URL}
  # ... 다른 환경 변수들

# 배포
doctl apps create --spec app.yaml
```

## 7단계: 모니터링 및 헬스 체크

### 7.1 헬스 체크 엔드포인트

```bash
# 컨테이너 내 헬스 체크
curl http://localhost:3000
```

### 7.2 로그 수집

```bash
# Docker 로그 확인
docker logs vibe-store

# 특정 시간대 로그
docker logs --since 30m vibe-store

# 로그를 파일로 저장
docker logs vibe-store > app.log 2>&1
```

### 7.3 리소스 모니터링

```bash
# 컨테이너 리소스 사용량
docker stats vibe-store

# CPU/메모리 제한 설정
docker run -m 512m --cpus 1 -d vibe-store:latest
```

## 문제 해결

### 포트 충돌

```bash
# 포트 변경
docker run -p 8080:3000 vibe-store:latest

# 특정 포트 사용 중인 프로세스 찾기
lsof -i :3000
```

### 환경 변수 누락

```bash
# 컨테이너 환경 변수 확인
docker exec vibe-store env | grep NEXT_PUBLIC

# 새 환경 변수로 재시작
docker rm vibe-store
docker run --env-file .env.docker -d vibe-store:latest
```

### 빌드 캐시 문제

```bash
# 캐시 무효화하고 빌드
docker build --no-cache -t vibe-store:latest .
```

### 메모리 부족

```bash
# 메모리 제한 증가
docker run -m 1g -d vibe-store:latest

# 스왑 메모리 확인
docker inspect vibe-store | grep -i memory
```

## 보안 체크리스트

배포 전 다음을 확인하세요:

- [ ] 민감한 정보가 이미지에 포함되지 않음
- [ ] 환경 변수가 Secrets로 관리됨
- [ ] 최소 권한 원칙 준수 (root 아닌 사용자)
- [ ] 기본 이미지 최신 버전 사용
- [ ] 알려진 취약점 스캔 (`docker scan`)
- [ ] 네트워크 정책 설정됨
- [ ] HTTPS 활성화됨

## 성능 최적화

### 이미지 크기 줄이기

```dockerfile
# 불필요한 패키지 제거
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 멀티 스테이지 빌드 사용
FROM node:20 AS builder
...
FROM node:20-alpine
```

### 빌드 시간 단축

```dockerfile
# npm ci 사용 (npm install 대신)
RUN npm ci

# .dockerignore 활용
node_modules/
.git/
.env.local
```

## 참고 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Next.js Docker 배포](https://nextjs.org/docs/deployment/docker)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Docker 보안 모범 사례](https://docs.docker.com/engine/security/)
