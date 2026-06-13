# Prism Portfolio

lukebaffait.fr **스크롤 전개형** 포트폴리오 클론 + aerukart.com **프리즘 유리** 색상 테마.

## 배포

- **라이브**: https://ponezzo.github.io/prism-portfolio/
- **Figma**: https://www.figma.com/design/izxX8YJ16HiW3JB4sQsClp

## 동작 (원본과 동일)

- Lenis + GSAP ScrollTrigger 스크롤 전개
- 프리로더 → 히어로(400vh) → 캔버스 리빌 → About → Projects → Circle Gallery → Skills → Contact → Footer
- `/works/` CSS 3D 큐브 페이지
- `/info/`, `/contact/` 서브 페이지

## 색상만 변경

원본 `#ff1e00` 빨간색 → aerukart 프리즘 그radient (`--prism-hot`, `--prism-pink`, `--prism-gradient`)
히어로 WebGL → 회전하는 **유리 프리즘** (Three.js)

## Figma 연동

Figma **Prism Theme** 변수 수정 후: **"Figma 변경사항 GitHub에 적용해줘"**

## 로컬 실행

```bash
npm install
npx serve . -p 4173
```
