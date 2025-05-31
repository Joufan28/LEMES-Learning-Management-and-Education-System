import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Suspense } from "react";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LEMES | Learning-Management-and-Education-System",
  description:
    "LEMES (Learning Management and Education System) adalah sebuah platform pembelajaran daring (online) yang dirancang untuk memudahkan proses belajar-mengajar secara digital. Sistem ini memungkinkan instruktur untuk membuat dan mengelola kursus, serta memberikan akses kepada siswa untuk belajar kapan saja dan di mana saja",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${dmSans.className}`}>
          <Providers>
            <Suspense fallback={null}>
              <div className="root-layout">{children}</div>
            </Suspense>
            <Toaster richColors closeButton />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
