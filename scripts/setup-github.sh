#!/bin/bash
# GitHub 연결 스크립트
# 사용법: ./scripts/setup-github.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
  echo "사용법: ./scripts/setup-github.sh YOUR_GITHUB_USERNAME"
  echo "예: ./scripts/setup-github.sh johndoe"
  exit 1
fi

USERNAME=$1
REPO="fake-toto"

# 기존 origin 제거 (있을 경우)
git remote remove origin 2>/dev/null

# GitHub 원격 추가
git remote add origin "https://github.com/${USERNAME}/${REPO}.git"

echo ""
echo "✅ 원격 저장소 설정 완료!"
echo ""
echo "다음 단계:"
echo "1. https://github.com/new 에서 '${REPO}' 이름으로 새 저장소 생성 (README 추가 안 함)"
echo "2. 아래 명령어로 푸시:"
echo ""
echo "   git push -u origin main"
echo ""
