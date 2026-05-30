import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "./utils/auth/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = (process.env.NEXT_PUBLIC_URL as string).replace(/\/+$/, "");

const siteDescription =
  "Lumina is a modern team workspace for managing tasks, workspaces, Kanban boards, invitations, notifications, and role-aware collaboration in one beautiful place.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lumina | Team Task Management Workspace",
    template: "%s | Lumina",
  },
  description: siteDescription,
  applicationName: "Lumina",
  keywords: [
    "Lumina",
    "task management",
    "team workspace",
    "Kanban board",
    "project management",
    "team collaboration",
    "workspace management",
  ],
  authors: [{ name: "Lumina" }],
  creator: "Lumina",
  publisher: "Lumina",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lumina | Team Task Management Workspace",
    description: siteDescription,
    url: "/",
    siteName: "Lumina",
    images: [
      {
        url: "/planning.png",
        width: 512,
        height: 512,
        alt: "Lumina task planning logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina | Team Task Management Workspace",
    description: siteDescription,
    images: [
      {
        url: "/planning.png",
        alt: "Lumina task planning logo",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/planning.png",
    apple: "/planning.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
