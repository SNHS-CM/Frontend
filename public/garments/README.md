# 옷 사진 넣는 곳

이 폴더에 옷 사진을 넣으면 화면에 바로 반영됩니다. (Vite의 `public/` 폴더라 번들링 없이 경로로 바로 참조돼요.)

## 넣는 방법

1. 여기(`public/garments/`)에 이미지 파일을 넣습니다.
   - 권장 포맷: `.png`(배경 투명) 또는 `.webp`
   - 권장 크기: 정사각형 400×400 이상
   - 파일 이름은 영문 소문자 + 하이픈으로. 예: `sage-tee.png`, `denim-jeans.png`
2. `src/data/outfits.ts`에서 해당 옷의 `image` 값을 `/garments/파일이름.png` 로 적어줍니다.
   - 맨 앞의 `/` 는 이 폴더(=`public`)를 가리킵니다. `public`은 경로에 쓰지 않아요.
   - 예: 파일이 `public/garments/sage-tee.png` 이면 → `image: '/garments/sage-tee.png'`

`image` 를 비워두면(`image` 생략) 사진 대신 `emoji` 값이 표시됩니다.
