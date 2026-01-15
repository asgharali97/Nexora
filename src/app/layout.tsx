import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sessionprovider from "../components/SessionProvider";
import { Toaster } from "@/src/components/ui/sonner"
import ConditionalNavbar from "../components/ConditionalNavbar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexora",
  description: "Realtime analytics dashboard for your website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <Sessionprovider>
        <ConditionalNavbar/>
        </Sessionprovider>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
