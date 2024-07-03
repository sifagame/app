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

const Faucet = () => {
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

  const { data } = useReadContracts({
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

  const available = data?.[0]?.result as boolean;
  const nextClaimAt = data?.[1]?.result as bigint;
  const decimals = data?.[2].result as number;
  const faucetBalance = data?.[3].result as bigint;
  const dropAmount = data?.[4].result as bigint;
  const delay = Number(data?.[5].result);
  const requireEth = data?.[6].result as bigint;

  console.log(available, nextClaimAt);

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const result = useWaitForTransactionReceipt({
    hash: hash,
  });

  const claim = () => {
    gaEvent("Claim Attempt", "");
    writeContract({
      ...faucetContractConfig,
      functionName: "drop",
      args: [address],
    });
  };

  if (error) {
	gaEvent("Claim Failed");
  }

  if (result?.isSuccess) {
	gaEvent("Claim Success");
  }

  return (
    <>
      <p>Faucet status:</p>
      <ul>
        <li>
          Balance available: {formatUnits(faucetBalance || 0n, decimals || 0)}{" "}
          SIFA
        </li>
        <li>
          Claim amount: {formatUnits(dropAmount || 0n, decimals || 0)} SIFA
        </li>
        <li>Claim delay: {(delay || 0) / 60 / 60} hours</li>
        <li>
          ETH hold required for claim: {formatUnits(requireEth || 0n, 18)}
        </li>
      </ul>
      {!available && <RemainingTime nextClaimAt={nextClaimAt} />}
      <Button
        variant="contained"
        onClick={claim}
        disabled={!available || isPending}
      >
        Claim
      </Button>
      {isPending && (
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
      {result?.isSuccess && (
        <SuccessMessage message={`Claim successful, tx: ${hash}`} />
      )}
    </>
  );
};

export default Faucet;
