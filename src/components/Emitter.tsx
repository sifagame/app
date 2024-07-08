import { contracts } from "../wagmi";
import { abi as EmitterAbi } from "../contracts/Emitter.json";
import { abi as SifaAbi } from "../contracts/SifaToken.json";
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { Button } from "@mui/material";
import useAnalyticsEventTracker from "../hooks/useAnalyticsEventTracker";
import { ErrorMessage, SuccessMessage } from "./Messages";
import { niceNumber } from "../utils";

export type EmitterStatus = {
  owner: `0x${string}`;
  epoch: number;
  rate: bigint;
  started: number;
  locked: bigint;
  released: bigint;
  available: bigint;
  lastWithrawalAt: number;
  vault: `0x${string}`;
  decimals: number;
};

const defaultEmitterStatus: EmitterStatus = {
  owner: "0x0",
  epoch: 0,
  rate: 0n,
  started: 0,
  locked: 0n,
  released: 0n,
  available: 0n,
  lastWithrawalAt: 0,
  vault: "0x0",
  decimals: 0,
};

export const Emitter = () => {
  const account = useAccount();
  const gaEvent = useAnalyticsEventTracker("Emitter");
  const [status, setStatus] = useState({
    ...defaultEmitterStatus,
  } as EmitterStatus);

  const emitterContractConfig = {
    abi: EmitterAbi,
    address: contracts.Emitter,
  };

  const sifaContractConfig = {
    abi: SifaAbi,
    address: contracts.SIFA,
  };

  const { data, refetch } = useReadContracts({
    contracts: [
      { ...emitterContractConfig, functionName: "owner" },
      { ...emitterContractConfig, functionName: "epoch" },
      { ...emitterContractConfig, functionName: "rate" },
      { ...emitterContractConfig, functionName: "started" },
      { ...emitterContractConfig, functionName: "locked" },
      { ...emitterContractConfig, functionName: "released" },
      { ...emitterContractConfig, functionName: "available" },
      { ...emitterContractConfig, functionName: "lastWithrawalAt" },
      { ...emitterContractConfig, functionName: "vault" },
      {
        ...sifaContractConfig,
        functionName: "decimals",
      },
    ],
  });

  const { data: hash, error, writeContract } = useWriteContract();

  const { status: txStatus } = useWaitForTransactionReceipt({
    hash: hash,
  });

  const withdraw = () => {
    writeContract({ ...emitterContractConfig, functionName: "withdraw" });
  };
  const start = () => {
    gaEvent("Withdraw Attempt");
    writeContract({ ...emitterContractConfig, functionName: "start" });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    const interval = setInterval(refetch, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (account && data) {
      setStatus({
        owner: data?.[0]?.result as `0x${string}`,
        epoch: data?.[1]?.result as number,
        rate: data?.[2]?.result as bigint,
        started: Number(data?.[3]?.result),
        locked: data?.[4]?.result as bigint,
        released: data?.[5]?.result as bigint,
        available: data?.[6]?.result as bigint,
        lastWithrawalAt: Number(data?.[7]?.result),
        vault: data?.[8]?.result as `0x${string}`,
        decimals: data?.[9]?.result as number,
      });
    }
  }, [data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    refetch();
    if ("success" === txStatus) {
      gaEvent("Withdraw Success");
    }
  }, [txStatus, error]);

  return (
    <>
      <p>
        SIFA was initially designed to release 800M tokens within 10 years.
        Tokens are released per second and may be withdrawn to the Vault. The
        Vault then share received tokens across all stake holders. Read
        whitepaper for more details.
      </p>
      <p>Emitter status:</p>
      <ul>
        <li>Owner: {status.owner}</li>
        <li>Current epoch: {status.epoch}</li>
        <li>
          Current release rate: {formatUnits(status.rate, status.decimals)}{" "}
          SIFA/sec
        </li>
        <li>
          Emission started:{" "}
          {status.started
            ? new Date(status.started * 1000).toLocaleString()
            : "no"}
        </li>
        <li>
          Tokens locked: {niceNumber(formatUnits(status.locked, status.decimals))} SIFA
        </li>
        <li>
          Tokens released: {niceNumber(formatUnits(status.released, status.decimals))} SIFA
        </li>
        <li>
          Tokens available to withdraw:{" "}
          {niceNumber(formatUnits(status.available, status.decimals))} SIFA
        </li>
        <li>
          Last withdrawal:{" "}
          {status.lastWithrawalAt
            ? new Date(status.lastWithrawalAt * 1000).toLocaleString()
            : "no"}
        </li>
      </ul>
      <p>Anyone can withdraw to the Vault: {status.vault}</p>
      <Button
        variant="contained"
        onClick={withdraw}
        disabled={status.available === 0n}
      >
        Withdraw
      </Button>{" "}
      {account?.address === status.owner && status.started === 0 && (
        <Button variant="outlined" onClick={start}>
          Start
        </Button>
      )}
      {error && <ErrorMessage message={error.toString()} />}
      {"success" === txStatus && (
        <SuccessMessage message={`Success, tx: ${hash}`} />
      )}
    </>
  );
};

export default Emitter;
