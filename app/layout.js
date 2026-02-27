import './globals.css'

export const metadata = {
  title: 'FAKE TOTO - 스포츠 배팅',
  description: '데모용 스포츠 토토 사이트. 축구, 야구, 농구, 배구 경기 배팅을 체험해보세요.',
  openGraph: {
    title: 'FAKE TOTO - 스포츠 배팅',
    description: '데모용 스포츠 토토 사이트',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
