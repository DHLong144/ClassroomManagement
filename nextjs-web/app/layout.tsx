'use client'
import "./globals.css";
import Navbar from "./admin/components/Navbar";
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();
  const hideNavbar = pathname === '/'

  return (
    <html lang="en">
      <head>
        <title className="head">Classroom management</title>
      </head>

      <body className="flex flex-col min-h-screen">
        <header>
          {!hideNavbar && <Navbar />}
        </header>

        <main className="flex-grow flex-1 mt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
