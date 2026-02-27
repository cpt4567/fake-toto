# GitHub 연결 및 Vercel 배포 가이드

## 1. GitHub 저장소 생성

1. [GitHub](https://github.com) 로그인
2. 우측 상단 **+** → **New repository**
3. Repository name: `fake-toto`
4. **Public** 선택
5. **Create repository** (README, .gitignore 추가하지 않음)

## 2. GitHub에 푸시

저장소 생성 후 아래 명령어 실행:

```bash
cd /Users/mac/develop/fake-toto
git remote add origin https://github.com/YOUR_USERNAME/fake-toto.git
git push -u origin main
```

> `YOUR_USERNAME`을 본인 GitHub 아이디로 변경

SSH 사용 시:
```bash
git remote add origin git@github.com:YOUR_USERNAME/fake-toto.git
git push -u origin main
```

## 3. Vercel 배포

### 방법 A: Vercel 웹사이트에서 (권장)

1. [Vercel](https://vercel.com) 로그인 (GitHub 연동)
2. **Add New** → **Project**
3. **Import Git Repository**에서 `fake-toto` 선택
4. **Deploy** 클릭
5. 1~2분 후 배포 완료, URL 발급 (예: `fake-toto.vercel.app`)

### 방법 B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

## 4. 환경 변수 (필요시)

현재 프로젝트는 환경 변수 없이 동작합니다.

## 5. 커스텀 도메인 (선택)

Vercel 대시보드 → Project → Settings → Domains에서 추가 가능
