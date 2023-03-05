// src/pages/_app.tsx
import "../styles/globals.css";
import type { AppType } from "next/app";
import NoSSR from "react-no-ssr";
import { Toaster } from "react-hot-toast";
import { Layout } from "../components/layout";
import { WalletProvider } from "../use-wallet";
import "@fontsource/roboto-mono/400.css";
import { storage } from "../utils/storage";

const MyApp: AppType<{ address?: string }> = ({ Component, pageProps }) => (
  <NoSSR>
    <WalletProvider address={storage.getAddress()}>
      <Layout>
        <Toaster />
        <Component {...pageProps} />
      </Layout>
    </WalletProvider>
  </NoSSR>
);

export default MyApp;
