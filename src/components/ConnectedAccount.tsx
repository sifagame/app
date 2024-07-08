import { Avatar, Badge, IconButton, Typography, styled } from "@mui/material";
import { useConnectorClient, useReadContracts, useSwitchChain } from "wagmi";
import { abi as SifaAbi } from "../contracts/SifaToken.json";
import { contracts } from "../wagmi";
import { niceNumber, truncateEthAddress } from "../utils";
import { useEffect, useState } from "react";
import { watchAsset } from "viem/actions";
import { AddCircleOutline } from "@mui/icons-material";
import { formatUnits } from "viem";

interface BalanceProps {
  address: `0x${string}`;
}

const Balance = (props: BalanceProps) => {
  const [decimals, setDecimals] = useState(0);
  const [symbol, setSymbol] = useState("");
  const [balance, setBalance] = useState(0n);

  const contractConfig = {
    abi: SifaAbi,
    address: contracts.SIFA,
  };

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        ...contractConfig,
        functionName: "decimals",
      },
      {
        ...contractConfig,
        functionName: "symbol",
      },
      {
        ...contractConfig,
        functionName: "balanceOf",
        args: [props.address],
      },
    ],
  });

  useEffect(() => {
    setDecimals(data?.[0]?.result as number);
    setSymbol(data?.[1]?.result as string);
    setBalance(data?.[2]?.result as bigint);
  }, [data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const { data: client } = useConnectorClient();

  const addToken = () => {
    if (client) {
      watchAsset(client, {
        type: "ERC20",
        options: {
          address: contracts.SIFA,
          symbol: "SIFA",
          decimals: 18,
        },
      });
    }
  };

  return (
    <Typography sx={{ pt: 0.5, pb: 0.5, pr: 1, lineHeight: 2 }}>
      {balance ? `${niceNumber(formatUnits(balance, decimals))} ${symbol}` : ""}
      {balance > 0n && (
        <IconButton size="small" onClick={addToken}>
          <AddCircleOutline />
        </IconButton>
      )}
    </Typography>
  );
};

const ConnectedBadge = styled(Badge)(({ theme }) => ({
  "&": {
    cursor: "pointer",
  },
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      content: '""',
    },
  },
  "&.disconnected .MuiBadge-badge": {
    backgroundColor: "red",
    color: "red",
  },
}));

function stringToColor(string: string) {
  let hash = 0;
  let i: number;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: name,
  };
}

interface ConnectedAccountProps {
  address: `0x${string}`;
  chainId: number;
}

export const ConnectedAccount = (props: ConnectedAccountProps) => {
  const address = props.address;
  const name = address.substring(address.length - 2);

  const { chains, switchChain } = useSwitchChain();
  const [chain] = chains;

  return (
    <>
      <Balance address={address} />
      <ConnectedBadge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="dot"
        className={chain.id === props.chainId ? "connected" : "disconnected"}
        onClick={() => switchChain({ chainId: chain.id })}
      >
        <Avatar {...stringAvatar(name.toUpperCase())} />
      </ConnectedBadge>
      <Typography sx={{ pt: 0.5, pb: 0.5, pl: 1, lineHeight: 2 }}>
        {truncateEthAddress(address || "", 1, 2)}
      </Typography>
    </>
  );
};
