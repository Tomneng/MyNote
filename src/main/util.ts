/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  console.log('NODE_ENV:', process.env.NODE_ENV); // 환경 변수 출력

  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    console.log('Development Mode'); // 개발 모드 여부 확인
    console.log('Using Port:', port); // 사용할 포트 출력

    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    console.log('Generated URL:', url.href); // 생성된 URL 출력

    return url.href;
  }

  const filePath = path.resolve(__dirname, '../renderer/', htmlFileName);
  console.log('Production Mode'); // 프로덕션 모드 여부 확인
  console.log('Resolved file path:', filePath); // 파일 경로 출력

  return `file://${filePath}`;
}
