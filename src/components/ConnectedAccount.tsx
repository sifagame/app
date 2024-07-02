import { Avatar, Badge, Typography, styled } from "@mui/material";
import { useReadContracts, useSwitchChain } from "wagmi";
import { abi as SifaAbi } from "../contracts/SifaToken.json";
import { contracts } from "../wagmi";
import { truncateEthAddress } from "../utils";
import { formatUnits } from "viem";

interface BalanceProps {
  address: `0x${string}`;
}

const Balance = (props: BalanceProps) => {
  const contractConfig = {
    abi: SifaAbi,
    address: contracts.SIFA,
  };
  const { data } = useReadContracts({
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

  const [decimals, symbol, rawbalance] = data || [];

  const balance = formatUnits(
    (rawbalance?.result as bigint) || 0n,
    (decimals?.result as number) || 0
  );

  return (
    <Typography sx={{ pt: 0.5, pb: 0.5, pr: 1, lineHeight: 2 }}>
      {balance} {symbol?.result?.toString()}
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
