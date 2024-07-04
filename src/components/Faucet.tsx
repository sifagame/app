import { Button, CircularProgress } from "@mui/material";
import { green } from "@mui/material/colors";
import { RemainingTime } from "./RemainingTime";
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { abi as FaucetAbi } from "../contracts/Faucet.json";
import { abi as SifaAbi } from "../contracts/SifaToken.json";
import { contracts } from "../wagmi";
import { ErrorMessage, SuccessMessage } from "./Messages";
import { formatUnits } from "viem";
import useAnalyticsEventTracker from "../hooks/useAnalyticsEventTracker";
import { useEffect, useState } from "react";

interface FaucetStatus {
  available: boolean;
  nextClaimAt: bigint;
  decimals: number;
  faucetBalance: bigint;
  dropAmount: bigint;
  delay: number;
  requireEth: bigint;
}

const Faucet = () => {
  const [status, setStatus] = useState({} as FaucetStatus);
  const gaEvent = useAnalyticsEventTracker("Faucet");
  const account = useAccount();
  const address = account?.address || "0x";

  const faucetContractConfig = {
    abi: FaucetAbi,
    address: contracts.Faucet,
  };

  const sifaContractConfig = {
    abi: SifaAbi,
    address: contracts.SIFA,
  };

  const {
    data: hash,
    error,
    writeContract,
    status: writeStatus,
  } = useWriteContract();

  const { status: txStatus } = useWaitForTransactionReceipt({
    hash: hash,
  });

  const claim = () => {
    gaEvent("Claim Attempt", "");
    writeContract({
      ...faucetContractConfig,
      functionName: "drop",
      args: [address],
    });
    const newStatus = status;
    newStatus.available = false;
    setStatus(newStatus);
  };

  if (error) {
    gaEvent("Claim Failed");
  }

  if ("success" === txStatus) {
    gaEvent("Claim Success");
  }

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        ...faucetContractConfig,
        functionName: "available",
        args: [address],
      },
      {
        ...faucetContractConfig,
        functionName: "nextClaimAt",
        args: [address],
      },
      {
        ...sifaContractConfig,
        functionName: "decimals",
      },
      {
        ...sifaContractConfig,
        functionName: "balanceOf",
        args: [contracts.Faucet],
      },
      {
        ...faucetContractConfig,
        functionName: "DROP_AMOUNT",
      },
      {
        ...faucetContractConfig,
        functionName: "DELAY",
      },
      {
        ...faucetContractConfig,
        functionName: "REQUIRE_ETH",
      },
    ],
  });

  const inProgress =
    "pending" === writeStatus ||
    ("success" === writeStatus && "pending" === txStatus);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    setStatus({
      available: data?.[0]?.result as boolean,
      nextClaimAt: data?.[1]?.result as bigint,
      decimals: data?.[2].result as number,
      faucetBalance: data?.[3].result as bigint,
      dropAmount: data?.[4].result as bigint,
      delay: Number(data?.[5].result),
      requireEth: data?.[6].result as bigint,
    });
	refetch();
  }, [data, inProgress]);

  return (
    <>
      <p>Faucet status:</p>
      <ul>
        <li>
          Balance available:{" "}
          {formatUnits(status.faucetBalance || 0n, status.decimals || 0)} SIFA
        </li>
        <li>
          Claim amount:{" "}
          {formatUnits(status.dropAmount || 0n, status.decimals || 0)} SIFA
        </li>
        <li>Claim delay: {(status.delay || 0) / 60 / 60} hours</li>
        <li>
          ETH hold required for claim:{" "}
          {formatUnits(status.requireEth || 0n, 18)}
        </li>
      </ul>
      {!status.available && <RemainingTime nextClaimAt={status.nextClaimAt} />}
      <Button
        variant="contained"
        onClick={claim}
        disabled={!status.available || inProgress}
      >
        Claim
      </Button>
      {inProgress && (
        <CircularProgress
          size={16}
          sx={{
            color: green[500],
            position: "relative",
            top: "4px",
            left: "8px",
          }}
        />
      )}
      {error && <ErrorMessage message={error.toString()} />}
      {"success" === txStatus && (
        <SuccessMessage message={`Claim successful, tx: ${hash}`} />
      )}
    </>
  );
};

export default Faucet;
