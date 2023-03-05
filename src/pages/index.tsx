/* eslint-disable @next/next/no-sync-scripts */
import type { NextPage } from "next";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { createClient, gql } from "@urql/core";
import { useWallet } from "../use-wallet";
import { Button } from "../components/button";
import { useState } from "react";

const ISSUER_V2_CONTRACT = "KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv";

const fxhash = createClient({
  url: "https://api.fxhash.xyz/graphql",
});

export const fetchProject = async (id: number) => {
  const { data } = await fxhash
    .query(
      gql`
        query ProjectQuery($id: Float!) {
          generativeToken(id: $id) {
            id
            pricingFixed {
              price
            }
            pricingDutchAuction {
              restingPrice
            }
          }
        }
      `,
      {
        id,
      }
    )
    .toPromise();

  if (!data) throw new Error("couldn't fetch project");
  return data.generativeToken;
};

const AutoMintForm = () => {
  const [mintingState, setMintingState] = useState<{
    minting: boolean;
    currentIteration?: number;
    level?: number;
  }>({
    minting: false,
  });
  const { getContract, setSigner } = useWallet();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      projectId: null,
      useReserve: false,
      iterations: 10,
      interval: 1,
      privateKey: "",
    },
  });

  const onSubmit = async ({
    projectId,
    useReserve,
    iterations,
    privateKey,
  }: any) => {
    setSigner(privateKey);
    const project = await fetchProject(parseInt(projectId));
    const contract = await getContract(ISSUER_V2_CONTRACT);

    // currently only support dutch auctions at resting price
    const price =
      project.pricingFixed?.price || project.pricingDutchAuction.restingPrice;

    const mint = async (i: number) => {
      const head = await fetch("https://api.tzkt.io/v1/head");
      const { level } = await head.json();

      if (level === mintingState.level) {
        toast.custom("waiting for level to change...");
        setTimeout(() => mint(i), 15 * 1000);
      }

      setMintingState({ minting: true, currentIteration: i, level });

      try {
        await contract.methodsObject
          .mint({
            issuer_id: projectId,
            referrer: null,
            reserve_input: useReserve ? "05070703060000" : null,
          })
          .send({
            amount: price,
            mutez: true,
            storageLimit: 650,
          });
        toast.success(`minted ${i + 1} of ${iterations}`);

        if (i + 1 === parseInt(iterations)) {
          setMintingState({ minting: false });
          reset();
          return;
        }

        setTimeout(() => mint(i + 1), 15 * 1000);
      } catch (e) {
        toast.error("An error occurred - please try again");
        setMintingState({ minting: false });
      }
    };

    mint(0);
  };

  return (
    <>
      <label className="text-md font-body leading-6 text-gray-900 mt-8 mr-4">
        project id
      </label>
      <input
        type="text"
        className="font-body text-sm mt-4 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#EB664F] focus:border-[#EB664F]"
        {...register("projectId", { required: true, maxLength: 1000 })}
        aria-invalid={errors.projectId ? "true" : "false"}
      />
      <div className="mt-4" />
      <label className="text-md font-body leading-6 text-gray-900 mt-8 mr-4">
        use reserve?
      </label>
      <input
        type="checkbox"
        className="font-body text-sm mt-4 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#EB664F] focus:border-[#EB664F]"
        {...register("useReserve", { required: false })}
        aria-invalid={errors.useReserve ? "true" : "false"}
      />
      <div className="mt-4" />
      <label className="text-md font-body leading-6 text-gray-900 mt-8 mr-4">
        number of iterations to mint
      </label>
      <input
        type="text"
        className="font-body text-sm mt-4 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#EB664F] focus:border-[#EB664F]"
        {...register("iterations", { required: true, maxLength: 1000 })}
        aria-invalid={errors.iterations ? "true" : "false"}
      />
      <div className="mt-4" />
      <label className="text-md font-body leading-6 text-gray-900 mt-8 mr-4">
        private key
      </label>
      <input
        type="text"
        className="font-body text-sm mt-4 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#EB664F] focus:border-[#EB664F]"
        {...register("privateKey", { required: true, maxLength: 1000 })}
        aria-invalid={errors.privateKey ? "true" : "false"}
      />

      <Button
        disabled={mintingState.minting}
        className="mt-8"
        onClick={handleSubmit(onSubmit)}
      >
        {mintingState.currentIteration !== undefined
          ? `minting ${mintingState.currentIteration + 1} of ${watch(
              "iterations"
            )} at level ${mintingState.level}`
          : "automint"}
      </Button>
    </>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>autominter</title>
        <meta
          name="description"
          content="a tool for artists to automint fxhash tokens"
        />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <AutoMintForm />
    </>
  );
};

export default Home;
