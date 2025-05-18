## 빠른 시작

### 1. 클론 및 설치

```bash
git clone https://github.com/ongjin/nexon-task.git
```

아래 경로에 .env.docker 파일을 각각 작성해 주세요!

```
auth/.env.docker
MONGODB_URI=mongodb://mongodb:27017/auth
JWT_SECRET=jwtsecret
JWT_EXPIRES_IN=3600s
```

```
event/.env.docker
MONGODB_URI=mongodb://mongodb:27017/event
JWT_SECRET=jwtsecret
JWT_EXPIRES_IN=3600s
```

```
gateway/.env.docker
AUTH_URL=http://auth:3001
EVENT_URL=http://event:3002
JWT_SECRET=jwtsecret
JWT_EXPIRES_IN=3600s
```

```
docker-compose up --build -d
```

---

## 서비스별 문서 보기

[Auth Service 문서 보기](auth/README.md)

---

[Event Service 문서 보기](event/README.md)

---

[Gateway 문서 보기](gateway/README.md)

---

## 체크리스트

```

Docker Desktop 실행 중인지 확인
포트 충돌 없는지 확인 (3000, 27017)
.env.docker 파일이 존재하는지 확인

```

---

## 구조

```

.
├── docker-compose.yml
├── mongo_data/ # MongoDB 볼륨 디렉토리
├── gateway/
│ └── Dockerfile
│ └── .env.docker
├── auth/
│ └── Dockerfile
│ └── .env.docker
├── event/
│ └── Dockerfile
│ └── .env.docker

```

---

```

```
