# Stage 1: 빌드 환경
FROM node:18-alpine AS builder

WORKDIR /app

# 종속성 설치
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# Stage 2: 실행 환경 (경량 Alpine 이미지)
FROM node:18-alpine

# 실행 폴더
WORKDIR /app

# 빌드 결과물만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 실행에 필요한 의존성만 설치 (devDependencies 제외)
RUN npm install --legacy-peer-deps

# Nest 앱 포트
EXPOSE 3002

# 앱 시작 명령
CMD ["node", "dist/main"]
