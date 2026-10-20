import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/client';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jinju-scca.vercel.app';
  
  let ogImageUrl = `${siteUrl}/og-image.png`;
  
  try {
    const supabase = createClient();
    const { data: ogSetting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'og_image')
      .maybeSingle();

    if (ogSetting?.value) {
      ogImageUrl = ogSetting.value.startsWith('http')
        ? ogSetting.value
        : `${siteUrl}${ogSetting.value.startsWith('/') ? '' : '/'}${ogSetting.value}`;
    }
  } catch (e) {
    // fallback to static og-image.png
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: '학교운영위원회 진주지역협의회 | 공식 웹플랫폼',
      template: '%s | 학교운영위원회 진주지역협의회',
    },
    description: '진주시 관내 유치원, 초등학교, 중학교, 고등학교, 특수학교 학교운영위원장 협조 및 학부모 소통 기구',
    keywords: [
      '학교운영위원회',
      '진주지역협의회',
      '진주교육지원청',
      '학부모위원회',
      '진주시학교운영위원회',
      '이준부'
    ],
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      url: siteUrl,
      siteName: '학교운영위원회 진주지역협의회',
      title: '학교운영위원회 진주지역협의회',
      description: '진주시 관내 유치원·초·중·고·특수학교 학교운영위원장 협조 및 학부모 소통 기구',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: '학교운영위원회 진주지역협의회 공식 웹플랫폼',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '학교운영위원회 진주지역협의회',
      description: '진주시 관내 유치원·초·중·고·특수학교 학교운영위원장 협조 및 학부모 소통 기구',
      images: [ogImageUrl],
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/logo.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/logo.png' }],
    },
  };
}

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
