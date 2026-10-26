# 복붙 표 정리 / Paste Table Cleaner

W013. `dist/`를 정적 호스팅하면 동작하는 설치·빌드 없는 브라우저 도구입니다. 한국어 `/` 및 `/en/`, `/es/`, `/zh/`, `/ja/`, `/de/`와 모든 경로의 언어 메뉴를 제공합니다. 입력·예시 데이터는 번역하지 않습니다.

## 구현

- CSV/TSV/세미콜론/파이프/연속 공백 2개 이상 분리. 자동 구분자 감지는 첫 레코드 기준이며 수동 교정 가능합니다.
- 인용된 구분자, 셀 내부 CRLF/LF, 두 번 쓴 인용부호 보존. 잘못된 인용부호는 명시적 오류 처리.
- 셀 앞뒤 공백, 셀 내부 연속 공백, 빈 행, 완전히 빈 열, 셀 내부 줄바꿈, 짧은 행 빈 셀 채우기를 각각 선택합니다. 줄바꿈 평탄화·빈 셀 채우기는 기본 해제입니다.
- 결과 TSV·CSV·Markdown 출력, 클립보드 복사·파일 다운로드. Markdown 헤더 자동 생성 또는 첫 행 사용.
- CSV·TSV 수식 시작 문자 보호는 기본 설정. 위험 문자 앞에 작은따옴표를 추가합니다. 이 처리는 값을 바꾸며 스프레드시트 재저장 이후까지 보장하지 않습니다.
- Markdown의 사용자 HTML 문자·파이프를 이스케이프하고 셀 내부 줄바꿈을 `<br>`로 표현합니다.
- 결과 및 오류 현지화. 숫자·날짜·앞자리 0 자동 변환 없음. 원본 입력 유지, 외부 전송·저장·추적·광고 없음. 모든 경로 `noindex,nofollow`.

## 제한

2,000,000자, 10,001행, 200열, 500,000셀. 파일 최대 8 MB, UTF-8만 지원. 화면 미리보기 300행, 복사·내보내기는 전체. 연속 공백 모드는 인용부호 밖의 두 개 이상 공백만 구분자로 취급합니다. 일반 텍스트의 시각적 정렬을 자동 추론하지 않습니다. 브라우저 시각 QA는 수행하지 않았습니다.

## 검증

앱 루트 PowerShell에서 실행한 명령입니다.

```powershell
$node = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
foreach ($file in @('dist/app.js','dist/core.js','dist/table.js','dist/i18n.js','dist/common-i18n.js')) {
  & '..\..\.tools\rtk\rtk.exe' proxy $node --check $file
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
& '..\..\.tools\rtk\rtk.exe' proxy $node tests.mjs
```

결과: JS 5파일 구문 검사 exit 0. 9개 fixture 그룹 통과. 인용 TSV·다중행·인용부호·앞자리 0, 공백·행·열 제거, 개행 보존/평탄화, 불균일 행 차단/패딩, 원래 레코드 위치, 인용된 공백, CSV/TSV 왕복, 수식 보호, Markdown HTML/파이프 이스케이프 및 헤더 생성, 비정상/빈/극단 입력, 6개 언어 카탈로그 완전성을 확인했습니다.

## 근거

- [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180): CSV 인용 규칙
- [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection): 수식 시작값 처리와 한계

코드·스타일·예시 직접 작성. 외부 이미지·라이브러리·폰트 없음.

## Public GitHub Pages release

Launch: https://nanalab.kr/paste-table-cleaner/

Korean is at the root. English, Spanish, Chinese, Japanese and German use `/en/`, `/es/`, `/zh/`, `/ja/`, `/de/`.
GitHub Pages serves `main` → `/docs` using the branch build. No project CNAME is used.

Build: `node scripts/build-public.mjs`. The `dist/` snapshot and its original generators/tests are preserved as the application source. The public build adds metadata, six-locale sitemaps, original JPEG cards, More Apps styling and the existing NaNa publisher integrations. It does not upload selected user files.

Publisher integrations: AdSense, Google Tag Manager, Google Analytics and Cloudflare Web Analytics, with the same publisher settings as the NaNa Lab homepage. These scripts can make network requests independently of local file processing.

Original JPEG cards are rendered from original text and geometry using an installed system font; no font files are redistributed. Existing source references and third-party notices remain applicable.
