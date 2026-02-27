# FAKE TOTO - 스포츠 배팅 사이트

데모용 스포츠 토토(배팅) 웹사이트입니다.

## 기능

- **스포츠토토**: 축구, 야구, 농구, 배구 경기 배팅
- **사다리타기**: 좌/우 예측, 공 애니메이션
- **달팽이 레이스**: 6마리 달팽이 SVG 레이스
- **3D 경마**: Three.js 기반 8마리 말 레이스

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 빌드

```bash
npm run build
npm start
```

## 기술 스택

- Next.js 14 + React 18
- Tailwind CSS, Framer Motion
- Zustand (상태 관리)
- Three.js / React Three Fiber (3D 경마)

## GitHub & 배포

### GitHub 연결

```bash
# 1. GitHub에서 fake-toto 저장소 생성 (빈 저장소)
# 2. 원격 연결 및 푸시
./scripts/setup-github.sh YOUR_GITHUB_USERNAME
git push -u origin main
```

### Vercel 배포

1. [Vercel](https://vercel.com) 로그인 (GitHub 연동)
2. **Import Project** → `fake-toto` 저장소 선택
3. **Deploy** → 완료 (URL 자동 발급)

자세한 내용은 [DEPLOY.md](./DEPLOY.md) 참고
