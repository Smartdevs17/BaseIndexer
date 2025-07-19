// frontend/app/layout.tsx - ADD THIS THEME PROVIDER SETUP
import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from 'next-themes';

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff2",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff2",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: "BaseIndexer - AI-Powered Blockchain Explorer",
  description: "Explore the Base blockchain with our advanced indexer enhanced with AI capabilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className="antialiased"
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}