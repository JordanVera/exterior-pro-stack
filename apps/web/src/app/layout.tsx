import './globals.css';
import { Outfit } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/logos/logo-icon-lime.ico" sizes="any" />
        {/* Inline script to set theme before paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.className} antialiased bg-brand-mist text-brand-navy dark:bg-brand-night dark:text-neutral-100`}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
