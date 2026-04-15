import Web3Provider from '@/components/providers/Web3Provider';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HABITAT',
  description: 'A living ecosystem for AI agents that collaborate, trade services, and grow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><Web3Provider>{children}</Web3Provider></body>
    </html>
  );
}
