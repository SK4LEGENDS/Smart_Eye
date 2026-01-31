import { AuthProvider } from "./context/AuthContext";
import ChatWidget from "./components/ChatWidget";

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import StyledComponentsRegistry from '@/lib/registry';

export const metadata = {
  title: "Smart Eye Care",
  description: "Advanced AI-powered eye disease detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StyledComponentsRegistry>
            {children}
            <ChatWidget />
          </StyledComponentsRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}

