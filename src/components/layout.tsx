import Link from "next/link";
import { ReactNode } from "react";
import { useWallet } from "../use-wallet";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <div className="flex flex-row fixed top-0 w-full p-4 justify-between bg-white z-10">
        <Link href="/">
          <h2 className="font-heading text-3xl md:text-4xl font-bold cursor-pointer tracking-tighter">
            autominter
          </h2>
        </Link>
      </div>
      <div className="mt-20 mb-[72px] md:mb-[56px] max-w-[998px] px-4 md:px-12 mx-auto">
        {children}
      </div>
    </>
  );
};
