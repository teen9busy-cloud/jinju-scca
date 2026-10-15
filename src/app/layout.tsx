import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '학교운영위원회 진주지역협의회 | 공식 웹사이트',
  description: '진주시 관내 유치원, 초등학교, 중학교, 고등학교, 특수학교 학교운영위원장 협조 및 학부모 소통 기구',
  keywords: '학교운영위원회, 진주지역협의회, 진주교육지원청, 학부모위원회, 으뜸유치원, 진주시학교운영위원회',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
