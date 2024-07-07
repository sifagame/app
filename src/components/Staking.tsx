import { contracts } from "../wagmi";
import { abi as vaultAbi } from "../contracts/Vault.json";
import { abi as sifaAbi } from "../contracts/SifaToken.json";
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect, useState } from "react";
import {
  Button,
  FormGroup,
  Grid,
  InputAdornment,
  Link,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { formatEther, maxInt256, parseEther, parseUnits } from "viem";
import { ErrorMessage, SuccessMessage } from "./Messages";

export type StakingStatus = {
  decimals: number;
  balance: bigint;
  allowance: bigint;
  maxDeposit: bigint;
  shares: bigint;
  sharePrice: bigint;
  maxRedeem: bigint;
  maxWithdraw: bigint;
};

const defaultStakingStatus: StakingStatus = {
  decimals: 0,
  balance: 0n,
  allowance: 0n,
  maxDeposit: 0n,
  shares: 0n,
  sharePrice: 0n,
  maxRedeem: 0n,
  maxWithdraw: 0n,
};

const vaultContractConfig = {
  abi: vaultAbi,
  address: contracts.Vault,
};

const sifaContractConfig = {
  abi: sifaAbi,
  address: contracts.SIFA,
};

const Staking = () => {
  const account = useAccount();
  const [status, setStatus] = useState({
    ...defaultStakingStatus,
  } as StakingStatus);
  const [depositAmount, setDepositAmount] = useState(0n);
  const [redeemAmount, setRedeemAmount] = useState(0n);

  const { data: hash, error, writeContract } = useWriteContract();

  const { status: txStatus } = useWaitForTransactionReceipt({
    hash: hash,
  });

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        ...sifaContractConfig,
        functionName: "decimals",
      },
      {
        ...sifaContractConfig,
        functionName: "balanceOf",
        args: [account.address],
      },
      {
        ...sifaContractConfig,
        functionName: "allowance",
        args: [account.address, contracts.Vault],
      },
      {
        ...vaultContractConfig,
        functionName: "maxDeposit",
        args: [account.address],
      },
      {
        ...vaultContractConfig,
        functionName: "balanceOf",
        args: [account.address],
      },
      {
        ...vaultContractConfig,
        functionName: "convertToAssets",
        args: [parseUnits("1", status.decimals)],
      },
      {
        ...vaultContractConfig,
        functionName: "maxRedeem",
        args: [account.address],
      },
      {
        ...vaultContractConfig,
        functionName: "maxWithdraw",
        args: [account.address],
      },
    ],
  });

  const approve = () => {
    writeContract({
      ...sifaContractConfig,
      functionName: "approve",
      args: [contracts.Vault, maxInt256],
    });
  };

  const deposit = () => {
    writeContract({
      ...vaultContractConfig,
      functionName: "deposit",
      args: [depositAmount, account.address],
    });
  };

  const redeem = () => {
    writeContract({
      ...vaultContractConfig,
      functionName: "redeem",
      args: [redeemAmount, account.address, account.address],
    });
  };

  const handleChangeDepositAmount = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDepositAmount = parseEther(e.target.value);
    setDepositAmount(newDepositAmount);
  };

  const handleMaxDeposit = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const newDepositAmount = [
      status.allowance,
      status.balance,
      status.maxDeposit,
    ].reduce((m, e) => (e < m ? e : m));
    setDepositAmount(newDepositAmount);
  };

  const handleChangeRedeemAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRedeemAmount = parseUnits(e.target.value, status.decimals);
    setRedeemAmount(newRedeemAmount);
  };

  const handleMaxRedeem = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setRedeemAmount(status.maxRedeem);
  };

  const handleChangeRedeemSlider = (_: Event, newValue: number | number[]) => {
    console.log(newValue);
    setRedeemAmount(redeemPercentToAmount(newValue as number));
  };

  const redeemAmountToPercent = (amount: bigint): number => {
    const newPercent = Math.round(
      (Number(amount) / Number(status.maxRedeem)) * 100
    );
    return newPercent || 0;
  };

  const redeemPercentToAmount = (percent: number): bigint => {
    return (BigInt(percent) * status.maxRedeem) / 100n;
  };

  useEffect(() => {
    console.log(data);
    if (data) {
      setStatus({
        decimals: data?.[0]?.result as number,
        balance: data?.[1]?.result as bigint,
        allowance: data?.[2]?.result as bigint,
        maxDeposit: data?.[3]?.result as bigint,
        shares: data?.[4]?.result as bigint,
        sharePrice: data?.[5]?.result as bigint,
        maxRedeem: data?.[6]?.result as bigint,
        maxWithdraw: data?.[7]?.result as bigint,
      });
    }
  }, [data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    refetch();
    setRedeemAmount(0n);
    setDepositAmount(0n);
  }, [txStatus, error]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={4}>
          <Typography variant="h5" sx={{ pb: 1 }}>
            Your shares: {formatEther(status.shares)}
          </Typography>
		  <Typography>
            SIFA value: {formatEther(status.maxWithdraw)}
          </Typography>
          <Typography>
            Share price: {formatEther(status.sharePrice)} SIFA/share
          </Typography>
        </Grid>
        <Grid item md={4}>
          <Typography variant="h5" sx={{ pb: 2 }}>
            Deposit
          </Typography>
          <FormGroup sx={{ pb: 1 }}>
            <TextField
              required
              id="deposit-amount"
              label="Amount"
              variant="outlined"
              value={formatEther(depositAmount)}
              onChange={handleChangeDepositAmount}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Link href="#" onClick={handleMaxDeposit}>
                      max
                    </Link>
                  </InputAdornment>
                ),
              }}
            />
          </FormGroup>
          <FormGroup sx={{ pb: 1 }}>
            <Button variant="outlined" onClick={approve}>
              Approve
            </Button>
          </FormGroup>
          <FormGroup sx={{ pb: 1 }}>
            <Button
              variant="contained"
              onClick={deposit}
              disabled={depositAmount <= 0n}
            >
              Deposit
            </Button>
          </FormGroup>
        </Grid>
        <Grid item md={4}>
          <Typography variant="h5" sx={{ pb: 2 }}>
            Redeem
          </Typography>
          <FormGroup>
            <TextField
              id="redeem-amount"
              label="Amount"
              variant="outlined"
              value={formatEther(redeemAmount)}
              onChange={handleChangeRedeemAmount}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Link href="#" onClick={handleMaxRedeem}>
                      max
                    </Link>
                  </InputAdornment>
                ),
              }}
            />
          </FormGroup>
          <FormGroup>
            <Slider
              value={redeemAmountToPercent(redeemAmount)}
              onChange={handleChangeRedeemSlider}
              step={null}
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: "0%" },
                { value: 10 },
                { value: 30 },
                { value: 50 },
                { value: 70 },
                { value: 100, label: "100%" },
              ]}
            />
          </FormGroup>
          <FormGroup>
            <Button
              variant="contained"
              disabled={redeemAmount <= 0n}
              onClick={redeem}
            >
              Redeem
            </Button>
          </FormGroup>
        </Grid>
      </Grid>
      {error && <ErrorMessage message={error.toString()} />}
      {"success" === txStatus && (
        <SuccessMessage message={`Success, tx: ${hash}`} />
      )}
    </>
  );
};

export default Staking;
