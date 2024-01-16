import React from "react";
import type { AppProps } from "next/app";
import { Lato } from "next/font/google";
import { Navigation } from "@/components/layout";
import { Footer } from "@/components/layout";

const latoFont = Lato({
  subsets: ["latin"],
  weight: "300",
});
import "@/styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={latoFont.className}>
      <Navigation />
      <Component {...pageProps} />
      <Footer />
    </main>
  );
}
