import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Theia Smart Relay',
  description: 'AI-powered iMessage relay and auto-response system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
