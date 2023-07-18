import React from "react";
import NextImage from "next/image";
import "./globals.css";
import { NextAuthProvider } from "@/providers";

export const metadata = {
  title: "App Time",
  description: "Track your time spent on work",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <NextAuthProvider>
        <body>
          <header className="bg-white flex justify-evenly">
            <NextImage
              alt="App time logo"
              src="/assets/logo.svg"
              width={100}
              height={100}
            />
            <h1 className="inline-block font-bold text-transparent bg-clip-text bg-gradient-to-r from-turquoise-medium via-blue-soft to-pink-medium">
              App Time
            </h1>
          </header>
          {children}
        </body>
      </NextAuthProvider>
    </html>
  );
}
