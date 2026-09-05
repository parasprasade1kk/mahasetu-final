import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AccessibilityBar from "@/components/AccessibilityBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "MahaSetu | Unified Citizen Services Portal • Government of Maharashtra",
  description: "Official single-window citizen services and welfare scheme delivery portal for Maharashtra. Apply for certificates, scholarships, land records, DBT benefits, and manage data consent securely.",
  keywords: "MahaSetu, Aaple Sarkar, Maharashtra Government, Citizen Services, MahaDBT, Caste Certificate, Income Certificate, 7/12 extract",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#f8f9ff] text-[#0b1c30] flex flex-col min-h-screen">
        <AppProvider>
          <AccessibilityBar />
          <Navbar />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
