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
import { contracts } from "../wagmi";
import { ErrorMessage, SuccessMessage } from "./Messages";

const Faucet = () => {
  const account = useAccount();
  const address = account?.address || "0x";

  const faucetContractConfig = {
    abi: FaucetAbi,
    address: contracts.Faucet,
  };

  const { data: availabilityData } = useReadContracts({
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
    ],
  });

  const available = availabilityData?.[0]?.result as boolean;
  const nextClaimAt = availabilityData?.[1]?.result as bigint;
  console.log(available, nextClaimAt);

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const result = useWaitForTransactionReceipt({
    hash: hash,
  });

  const claim = () => {
    writeContract({
      ...faucetContractConfig,
      functionName: "drop",
      args: [address],
    });
  };

  return (
    <>
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
