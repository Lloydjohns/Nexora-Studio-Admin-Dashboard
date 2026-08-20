import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Nexora Studio — Admin Dashboard',
  description:
    'Internal business operating system for Nexora Studio: clients, projects, content, finance, and analytics.',
  icons: {
    icon: '/public/images/companylogo.png',
    shortcut: '/public/images/companylogo.png',
    apple: '/public/images/companylogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}

            <Toaster
              richColors
              position="bottom-right"
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}